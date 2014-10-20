
define('jzform/jzformElement',[
    'require',
    'underscore',
    'jquery',
    'backbone'
], function (require, _, $, Backbone) {
    var Element = function (form, params) {
        var defaults = {
            filters: [],
            validators: []
        };
        this.form = form;
        this.params = $.extend(defaults, params);
        this.initialize();
    };

    _.extend(Element.prototype, Backbone.Events, {
        input: null,
        filters: null,
        validators: null,
        messages: [],
        initialize: function () {
            this._events = {};
            this.listenTo(this.form, 'before:close', this.destroy);

            this.prepareFilters();
            this.prepareValidators();
            this.getInput();
        },
        prepareFilters: function () {
            var that = this;
            this.filters = [];
            $.each(this.params.filters, function (index, params) {
                var name = 'jzform/filter/' + params.name;
                require([name], function (Filter) {
                    var filter = new Filter(params.options);
                    that.filters.push(filter);
                });
            });
        },
        prepareValidators: function () {
            var that = this;
            this.validators = [];
            $.each(this.params.validators, function (index, params) {
                var name = 'jzform/validator/' + params.name;
                params.options.element = that;
                require([name], function (Validator) {
                    var validator = new Validator(params.options, params.messages);
                    that.validators.push(validator);
                });
            });
        },
        getInput: function () {
            if (!this.input) {
                var selector = '*[name="' + this.params.name + '"]';
                var $elements = this.form.$el.find(selector);
                var input = ($elements.length > 0) ? $elements : false;

                if (input) {
                    this.setInput(input);
                }
            }

            return this.input;
        },
        setInput: function (input) {
            this.input = input;
            // bind events if not already bound            
            if (this.input && !this.input.data('events-bound')) {
                this.bindEvents(this.input);
            }
        },
        bindEvents: function (input) {
            var that = this;
            input.data('events-bound', 1);
            input.bind('focus blur change keydown keyup paste', function (e) {
                that.trigger(e.type, e);
                that.form.trigger(e.type + ':' + that.params.name, that);
            });
            //this.listenTo(this, 'change', this.filter);
            this.listenTo(this, 'change', this.validate);
        },
        filter: function () {
            if (this.params.type === 'file') {
                return;
            }

            var input = this.getInput();
            if (input) {
                var currentValue = this.getValue();
                var filteredValue = this.filterValue(currentValue);
                input.val(filteredValue);
            }

            return true;
        },
        filterValue: function (value) {
            var filteredValue = value;
            $.each(this.filters, function (index, filter) {
                filteredValue = filter.filter(filteredValue);
            });

            return filteredValue;
        },
        validate: function () {
            var isValid = this.isValid();
            this.getTarget().toggleClass('invalid', !isValid);

            this.renderMessages();
            return isValid;
        },
        getValue: function () {
            var input = this.getInput();

            if (input && input.filter('[type=radio],[type=checkbox]').length > 0) {
                input = input.filter(':checked');
                if (input.length > 1) {
                    var values = [];
                    input.each(function (index, element) {
                        values.push($(element).val());
                    });
                    return values;
                } else if (input.length === 1) {
                    return input.val();
                } else {
                    return 0;
                }
            } else {
                return (input) ? input.val() : '';
            }
        },
        setValue: function (value) {
            var input = this.getInput();
            var filtered = this.filterValue(value);

            input.each(function () {
                var $this = $(this);
                switch ($this.attr('type')) {
                    case 'checkbox':
                    case 'radio':
                        if (filtered instanceof Array) {
                            var values = filtered.map(function (x) {
                                return x.toString();
                            });
                            var needle = $this.val().toString();
                            $this.prop('checked', (values.indexOf(needle) > -1));
                        } else {
                            $this.prop('checked', (filtered == $this.val()));
                        }
                        break;
                    default:
                        $this.val(filtered);
                }
            });
        },
        setOptions: function (options) {
            var $input = this.getInput();
            var type = $input.get(0).type || $input.attr('type');
            switch (type) {
                case 'select':
                case 'select-one':
                case 'select-multi':
                case 'select-multiple':
                    var html = '';

                    var optionsArray = this.normalizeOptions(options);
                    _.each(optionsArray, function (option) {
                        html += '<option value="' + option.value + '">' + option.label + '</option>';
                    });

                    $input.html(html);
                    break;
            }
        },
        normalizeOptions: function (options) {
            if (_.isArray(options) === false && _.isObject(options)) {
                var normal = [];
                _.each(options, function (label, value) {
                    normal.push({label: label, value: value});
                });

                return normal;
            } else if (_.isArray(options)) {
                _.each(options, function (option, key) {
                    if (_.isObject(option) === false) {
                        options[key] = {label: option, value: key};
                    }
                });
            }

            return options;
        },
        renderMessages: function () {
            if (!this.params.renderMessages) {
                return;
            }

            var target = this.getTarget();
            var messages = target.find('> .messages');
            if (messages.length === 0) {
                messages = $('<div class="messages"></div>');
                target.append(messages);
            }

            messages.empty();
            $.each(this.messages, function (index, message) {
                messages.append('<p>' + message + '</p>');
            });
        },
        isValid: function () {
            this.messages = [];
            var currentValue = this.getValue();
            var valid = true;
            var that = this;
            $.each(this.validators, function (index, validator) {
                valid = (valid && validator.isValid(currentValue, that.form));
                if (!valid && validator.message) {
                    that.addMessage(validator.message);
                }
            });
            return valid;
        },
        addMessage: function (message) {
            this.messages.push(message);
        },
        getTarget: function () {
            var input = this.getInput();
            return (input) ? input.parent('div.element, fieldset') : this.form.$el;
        },
        destroy: function () {
            this.trigger('before:destroy');
            this.stopListening();
            this.trigger('destroy');
        }
    });

    return Element;
});
define('jzform/jzformFieldset',[
    'underscore',
    'jquery',
    'backbone',
    'jzform/jzformElement'
], function(_, $, Backbone, Element) {
    var Fieldset = function(form, params) {
        var defaults = {
        };
        this.form = form;
        this.params = $.extend(defaults, params);
        this.initialize();
    };
    _.extend(Fieldset.prototype, Backbone.Events, {
        elements: null,
        messages: [],
        initialize: function() {
            this.prepareElements();
        },
        prepareElements: function() {
            var that = this;
            this.elements = {};
            $.each(this.getElementParameters(), function(name, params) {
                var form = that.getForm.call(that);
                var options = $.extend(that.params.element, params);
                switch (options.type) {
                    case 'fieldset':
                        that.addElement(name, new Fieldset(form, options));
                        break;
                    case 'element':
                    default:
                        that.addElement(name, new Element(form, options));
                        break;
                }
            });
        },
        addElement: function(name, element) {
            this.elements[name] = element;
        },
        getForm: function() {
            return this.form;
        },
        getElementParameters: function() {
            return this.params.elements;
        },
        getElement: function(name) {
            return this.elements[name];
        },
        getInput: function() {
            return this.getForm().$el.find('*[id="' + this.params.name + '-fieldset"]');
        },
        getValue: function() {
            return this.getValues();
        },
        getValues: function() {
            var values = {};
            $.each(this.elements, function(name, element) {
                var index = element.params.name;
                var value = element.getValue();

                if (typeof(values[index]) === 'array') {
                    values[index].push(value);
                } else if (index in values) {
                    var original = values[index];
                    values[index] = [];

                    if (original) {
                        values[index].push(original);
                    }

                    if (value) {
                        values[index].push(value);
                    }
                } else {
                    values[index] = value;
                }
            });
            return values;
        },
        validate: function() {
            var isValid = this.isValid();
            this.getInput().toggleClass('invalid', !isValid);
            return isValid;
        },
        isValid: function() {
            var valid = true;
            var stopOnFirstError = this.params.stopOnFirstError;
            $.each(this.elements, function(name, element) {
                if (stopOnFirstError) {
                    valid = (valid && element.validate.call(element));
                } else {
                    valid = (element.validate.call(element) && valid);
                }
            });
            return valid;
        },
        clearElements: function(selector) {
            selector = selector || '.element';
            this.getInput().find(selector).remove();
        },
        buildElementsFromCollection: function(collection) {
            var that = this;
            var template = this.getTemplate();
            collection.each(function(resource, index) {
                var data = {
                    index: index,
                    model: resource.toJSON()
                };

                that.buildElement(template, data);
            });
        },
        buildElementsFromArray: function(array) {
            var that = this;
            var template = this.getTemplate();

            $.each(array, function(index, resource) {
                var data = {
                    index: index,
                    model: resource
                };

                that.buildElement(template, data);
            });
        },
        buildElement: function(template, data) {
            var html = _.template(template, data, {
                interpolate: /__(.+?)__/g
            });

            var $fieldset = this.getInput();
            $fieldset.append(html);
            var input = $fieldset.find('.element:last *[name]');
            var name = this.params.name + '_' + data.index;
            var options = {
                name: this.params.name
            };
            var element = new Element(this.getForm(), options);
            element.setInput(input);
            this.addElement(name, element);
        },
        getTemplate: function() {
            var $fieldset = this.getInput();
            var template = $fieldset.find('span').attr('data-template');
            return template.replace(/\[__remove__\]/g, '');
        },
        populate: function(data) {
            var that = this;
            $.each(data, function(key, value) {
                var element = that.getElement(key);                
                if (element) {
                    element.setValue(value);
                }
            });
        },
        setValue: function(data) {
            this.populate(data);
        }
    });
    return Fieldset;
});
define('jzform/jzform',[
    'underscore',
    'jquery',
    'jzform/jzformFieldset'
], function(_, $, Fieldset) {
    var jzForm = function(element, params) {
        var defaults = {
            stopOnFirstError: false,
            element: {
                renderMessages: true
            }
        };
        this.$el = $(element);
        this.params = _.extend(defaults, params);
        this.initialize();
    };

    _.extend(jzForm.prototype, Fieldset.prototype, {
        initialize: function() {
            Fieldset.prototype.initialize.apply(this, arguments);
            this.bindEvents();
        },
        bindEvents: function() {
            var that = this;
            this.$el.bind('submit', function(e) {
                that.submit.call(that, e);
            });

            this.listenTo(this, 'submit', function() {
                this.changeSubmitValue('loading');
            });
            this.listenTo(this, 'submit:success', function() {
                this.changeSubmitValue('success');
            });
            this.listenTo(this, 'submit:error', function() {
                this.changeSubmitValue('error');
            });
        },
        getForm: function() {
            return this;
        },
        getElementParameters: function() {
            return this.params.form.elements;
        },
        reset: function() {
            this.$el.get(0).reset();
        },
        submit: function(e) {
            this.messages = [];

            if (this.validate()) {
                this.trigger('before:submit');

                var data = this.getValues();
                this.trigger('submit', e, data);
            } else {
                e.preventDefault();
            }
        },
        bindModel: function(model, submitOptions) {
            this.model = model;
            this.bindModelPopulate(model);
            this.bindModelSubmit(model, submitOptions);
        },
        bindModelPopulate: function(model) {
            this.listenTo(model, 'change', function() {
                this.populate(model.toJSON());
            });
            this.populate(model.toJSON());
        },
        bindModelSubmit: function(model, options) {
            var that = this;
            var defaults = {
                saveOptions: {},
                exclude: [],
                method: 'save',
                isNew: model.isNew()
            };
            options = $.extend(defaults, options);

            var saveCallback = options.saveOptions.save;
            var errorCallback = options.saveOptions.error || this.parseErrorMessages;

            var saveOptions = options.saveOptions;
            saveOptions.success = function(model) {
                that.trigger('submit:success', model, options);
                if (saveCallback) {
                    saveCallback.call(that, model, options);
                }
            };

            saveOptions.error = function(model, fail) {
                that.trigger('submit:error', model, fail);
                if (errorCallback) {
                    errorCallback.call(that, model, fail);
                }
            };

            this.listenTo(this, 'submit', function(e) {
                e.preventDefault();
                var values = this.getValues();
                var valuesToSave = _.omit(values, options.exclude);

                model[options.method].call(model, valuesToSave, saveOptions);
            });
        },
        parseErrorMessages: function(model, fail) {
            var that = this;
            var response = JSON.parse(fail.responseText);
            if (response['message']) {
                that.addMessage(response['message']);
                that.renderMessages();
            } else if (response['messages']) {
                $.each(response['messages'], function() {
                    that.addMessage(this);
                });

                that.renderMessages();
            }
        },
        renderMessages: function() {
            var target = this.$el;
            var messages = target.find('> .messages');
            if (messages.length === 0) {
                target.prepend('<div class="messages"></div>');
                messages = target.find('> .messages');
            }

            messages.empty();
            $.each(this.messages, function(index, message) {
                messages.append('<p>' + message + '</p>');
            });
        },
        addMessage: function(message) {
            if (typeof (this.messages) !== 'array') {
                this.messages = [];
            }

            this.messages.push(message);
        },
        getSubmitButton: function() {
            var submit = false;
            $.each(this.elements, function(name, element) {
                if (element.params.type === 'submit') {
                    submit = element.getInput();
                }
            });

            return submit;
        },
        changeSubmitValue: function(status) {
            var submit = this.getSubmitButton();

            if (submit) {
                if (!submit.attr('data-original-value')) {
                    submit.attr('data-original-value', submit.attr('value'));
                }

                var key = 'data-' + status + '-value';
                if (submit.attr(key)) {
                    submit.attr('value', submit.attr(key));
                }
            }
        },
        destroy: function() {
            this.trigger('before:destroy');
            this.stopListening();
            this.trigger('destroy');
        }
    });

    return jzForm;
});

define('jzform/validator/validator',[
    'underscore'
], function(_) {
    var Validator = {
        message: null,
        error: function(key, params) {
            params = params || this.params;

            if (this.messageTemplates && key in this.messageTemplates) {
                var template = this.messageTemplates[key];
                var message = this.parseMessageTemplate(template, params);
            } else {
                var message = 'Value invalid';
            }

            this.message = message;
        },
        parseMessageTemplate: function(template, params) {
            $.each(params, function(key, value) {
                var regex = new RegExp('%' + key + '%', 'g');
                template = template.replace(regex, value);
            });

            return template;
        }
    };
    Validator.extend = _.extend;

    return Validator;
});
define('jzform/validator/alnum',[
    'jzform/validator/validator'
], function(Validator) {
    var Alnum = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(Alnum.prototype, Validator, {
        isValid: function(value) {
            var regex = new RegExp('[^a-zA-Z0-9]');
            var match = regex.test(value);

            if (match) {
                this.error('notAlnum');
                return false;
            }

            return true;
        }
    });

    return Alnum;
});
define('jzform/validator/between',[
    'jzform/validator/validator'
], function(Validator) {
    var Between = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(Between.prototype, Validator, {
        isValid: function(value) {
            value = parseFloat(value);

            if (value < parseFloat(this.params.min)) {
                this.error('notBetween');
                return false;
            }

            if (value > parseFloat(this.params.max)) {
                this.error('notBetween');
                return false;
            }

            return true;
        }
    });

    return Between;
});
define('jzform/validator/fileExtension',[
    'jzform/validator/validator'
], function(Validator) {
    var FileExtension = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(FileExtension.prototype, Validator, {
        isValid: function(value, context) {
            console.log('implement file extension validator');
            return true;
        }
    });

    return FileExtension;
});
define('jzform/validator/fileSize',[
    'jzform/validator/validator'
], function(Validator) {
    var FileSize = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(FileSize.prototype, Validator, {
        isValid: function(value, context) {
            console.log('implement file size validator');
            return true;
        }
    });

    return FileSize;
});
define('jzform/validator/float',[
    'jzform/validator/validator'
], function(Validator) {
    var Float = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(Float.prototype, Validator, {
        isValid: function(value) {
            var match = (value === parseFloat(value));

            if (match) {
                this.error('notFloat');
                return false;
            }

            return true;
        }
    });

    return Float;
});
define('jzform/validator/greaterThan',[
    'jzform/validator/validator'
], function(Validator) {
    var GreaterThan = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(GreaterThan.prototype, Validator, {
        isValid: function(value) {
            value = parseFloat(value);

            if (value > parseFloat(this.params.max)) {
                this.error('notGreaterThan');
                return false;
            }

            return true;
        }
    });

    return GreaterThan;
});
define('jzform/validator/inArray',[
    'jzform/validator/validator'
], function(Validator) {
    var InArray = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(InArray.prototype, Validator, {
        isValid: function(value) {
            value = value.toString();
            var haystack = this.params.haystack;
            for (i = 0; i < haystack.length; i++) {
                if (value == haystack[i]) {
                    return true;
                }
            }

            this.error('notInArray');
            return false;
        }
    });

    return InArray;
});
define('jzform/validator/int',[
    'jzform/validator/validator'
], function(Validator) {
    var Int = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(Int.prototype, Validator, {
        isValid: function(value) {
            var match = (value === parseInt(value));

            if (match) {
                this.error('notInt');
                return false;
            }

            return true;
        }
    });

    return Int;
});
define('jzform/validator/lessThan',[
    'jzform/validator/validator'
], function(Validator) {
    var LessThan = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(LessThan.prototype, Validator, {
        isValid: function(value) {
            value = parseFloat(value);

            if (value > parseFloat(this.params.max)) {
                this.error('notLessThan');
                return false;
            }

            return true;
        }
    });

    return LessThan;
});
define('jzform/validator/matchElement',[
    'jzform/validator/validator'
], function(Validator) {
    var MatchElement = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
        this.firstValidation = true;
    };

    Validator.extend(MatchElement.prototype, Validator, {
        listenForTokenChange: function() {
            if (this.params.element && this.params.token) {
                var element = this.params.element;
                var token = this.params.token;
                element.listenTo(element.form, 'change:' + token, element.validate);
            }
        },
        isValid: function(value, context) {
            if (!context || typeof context.getValues !== 'function') {
                this.error('noContext');
                return false;
            }

            var token = this.params.token;
            if (!token) {
                this.error('missingToken');
                return false;
            }

            if (this.firstValidation) {
                this.listenForTokenChange();
                this.firstValidation = false;
            }

            var values = context.getValues();

            if (value !== values[token]) {
                this.error('notSame');
                return false;
            }

            return true;
        }
    });

    return MatchElement;
});
define('jzform/validator/notEmpty',[
    'jzform/validator/validator'
], function(Validator) {
    var NotEmpty = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(NotEmpty.prototype, Validator, {
        isValid: function(value, context) {
            if (!value || value.length <= 0) {
                this.error('isEmpty');
                return false;
            }

            return true;
        }
    });

    return NotEmpty;
});
define('jzform/validator/regex',[
    'jzform/validator/validator'
], function(Validator) {
    var Regex = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(Regex.prototype, Validator, {
        isValid: function(value) {
            var pattern = this.params.pattern;
            if (pattern.substr(0, 1) === '/' && pattern.substr(pattern.length - 1, 1) === '/') {
                pattern = pattern.substr(1, pattern.length - 2);
            }

            var regex = new RegExp(pattern);
            var match = regex.test(value);

            if (!match) {
                this.error('regexNotMatch');
            }

            return match;
        }
    });

    return Regex;
});
define('jzform/validator/step',[
    'jzform/validator/validator'
], function(Validator) {
    var Step = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(Step.prototype, Validator, {
        isValid: function(value) {
            value = parseFloat(value);

            var fmod = this.fmod(value - this.params.baseValue, this.params.step);
            if (fmod !== 0.0 && fmod !== this.params.step) {
                this.error('notStep');
                return false;
            }

            return true;
        },
        fmod: function(x, y) {
            if (y == 0.0) {
                return 1.0;
            }

            var precision = x.substr(x.indexOf('.') + 1).length + y.substr(y.indexOf('.') + 1).length;
            return Math.round(x - y * Math.floor(x / y), precision);
        }
    });

    return Step;
});
define('jzform/validator/stringLength',[
    'jzform/validator/validator'
], function(Validator) {
    var StringLength = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(StringLength.prototype, Validator, {
        isValid: function(value) {
            var tooShort = (value && this.params.min && value.length < this.params.min);
            var tooLong = (value && this.params.max && value.length > this.params.max);

            if (tooShort) {
                this.error('stringLengthTooShort');
            }

            if (tooLong) {
                this.error('stringLengthTooLong');
            }

            return (!tooShort && !tooLong);
        }
    });

    return StringLength;
});
define('jzform/filter/filter',[
    'underscore'
], function(_) {
    var Filter = function(params) {
        this.params = params;
    };

    Filter.extend = _.extend;

    return Filter;
});
define('jzform/filter/boolean',[
    'jzform/filter/filter'
], function(Filter) {
    var Boolean = Filter;

    Boolean.extend(Boolean.prototype, {
        filter: function(value) {
            switch (true) {
                case (value === false):
                case (value <= 0):
                case (value === '0'):
                case (value === ''):
                    return false;
                default:
                    return true;
            }
        }
    });

    return Boolean;
});
define('jzform/filter/int',[
    'jzform/filter/filter'
], function(Filter) {
    var Int = Filter;

    Int.extend(Int.prototype, {
        filter: function(value) {
            return parseInt(value) || 0;
        }
    });

    return Int;
});
define('jzform/filter/stringToLower',[
    'jzform/filter/filter'
], function(Filter) {
    var StringToLower = Filter;

    StringToLower.extend(StringToLower.prototype, {
        filter: function(value) {
            return value.toLowerCase();
        }
    });

    return StringToLower;
});
define('jzform/filter/stringToUpper',[
    'jzform/filter/filter'
], function(Filter) {
    var StringToUpper = Filter;

    StringToUpper.extend(StringToUpper.prototype, {
        filter: function(value) {
            return value.toUpperCase();
        }
    });

    return StringToUpper;
});
define('jzform/filter/stringTrim',[
    'jzform/filter/filter'
], function(Filter) {
    var StringTrim = Filter;

    StringTrim.extend(StringTrim.prototype, {
        filter: function(value) {
            return value.trim();
        }
    });

    return StringTrim;
});