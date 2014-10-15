define([
    'require',
    'underscore',
    'jquery',
    'backbone'
], function(require, _, $, Backbone) {
    var Element = function(form, params) {
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
        initialize: function() {
            this._events = {};
            this.listenTo(this.form, 'before:close', this.destroy);

            this.prepareFilters();
            this.prepareValidators();
            this.getInput();
        },
        prepareFilters: function() {
            var that = this;
            this.filters = [];
            $.each(this.params.filters, function(index, params) {
                var name = 'jzform/filter/' + params.name;
                require([name], function(Filter) {
                    var filter = new Filter(params.options);
                    that.filters.push(filter);
                });
            });
        },
        prepareValidators: function() {
            var that = this;
            this.validators = [];
            $.each(this.params.validators, function(index, params) {
                var name = 'jzform/validator/' + params.name;
                params.options.element = that;
                require([name], function(Validator) {
                    var validator = new Validator(params.options, params.messages);
                    that.validators.push(validator);
                });
            });
        },
        getInput: function() {
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
        setInput: function(input) {
            this.input = input;
            // bind events if not already bound            
            if (this.input && !this.input.data('events-bound')) {
                this.bindEvents(this.input);
            }
        },
        bindEvents: function(input) {
            var that = this;
            input.data('events-bound', 1);
            input.bind('focus blur change keydown keyup paste', function(e) {
                that.trigger(e.type, e);
                that.form.trigger(e.type + ':' + that.params.name, that);
            });
            //this.listenTo(this, 'change', this.filter);
            this.listenTo(this, 'change', this.validate);
        },
        filter: function() {
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
        filterValue: function(value) {
            var filteredValue = value;
            $.each(this.filters, function(index, filter) {
                filteredValue = filter.filter(filteredValue);
            });

            return filteredValue;
        },
        validate: function() {
            var isValid = this.isValid();
            this.getTarget().toggleClass('invalid', !isValid);

            this.renderMessages();
            return isValid;
        },
        getValue: function() {
            var input = this.getInput();

            if (input && input.filter('[type=radio],[type=checkbox]').length > 0) {
                input = input.filter(':checked');
                if (input.length > 1) {
                    var values = [];
                    input.each(function(index, element) {
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
        setValue: function(value) {
            var input = this.getInput();
            var filtered = this.filterValue(value);

            input.each(function() {
                var $this = $(this);
                switch ($this.attr('type')) {
                    case 'checkbox':
                    case 'radio':
                        if (filtered instanceof Array) {
                            var values = filtered.map(function(x) {
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
            if (_.isObject(options)) {
                var normal = [];
                _.each(options, function (label, value) {
                    normal.push({label: label, value: value});
                });
                
                return normal;
            }

            return options;
        },
        renderMessages: function() {
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
            $.each(this.messages, function(index, message) {
                messages.append('<p>' + message + '</p>');
            });
        },
        isValid: function() {
            this.messages = [];
            var currentValue = this.getValue();
            var valid = true;
            var that = this;
            $.each(this.validators, function(index, validator) {
                valid = (valid && validator.isValid(currentValue, that.form));
                if (!valid && validator.message) {
                    that.addMessage(validator.message);
                }
            });
            return valid;
        },
        addMessage: function(message) {
            this.messages.push(message);
        },
        getTarget: function() {
            var input = this.getInput();
            return (input) ? input.parent('div.element, fieldset') : this.form.$el;
        },
        destroy: function() {
            this.trigger('before:destroy');
            this.stopListening();
            this.trigger('destroy');
        }
    });

    return Element;
});