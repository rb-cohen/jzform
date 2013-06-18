define([
    'underscore',
    'jquery',
    'backbone',
    './jzformElement',
    './jzformFieldset'
], function(_, $, Backbone, Element, Fieldset) {
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

    jzForm.extend = Backbone.View.extend;
    jzForm.Element = Element;
    jzForm.Fieldset = Fieldset;

    _.extend(jzForm.prototype, Backbone.Events);
    _.extend(jzForm.prototype, {
        elements: null,
        messages: [],
        initialize: function() {
            this.prepareElements();
            this.bindEvents();
        },
        prepareElements: function() {
            var that = this;
            this.elements = {};

            $.each(that.params.form.elements, function(name, params) {
                var options = $.extend(that.params.element, params);
                that.elements[name] = new jzForm.Element(that, options);
            });
        },
        getElement: function(name) {
            return this.elements[name];
        },
        bindEvents: function() {
            var that = this;
            this.$el.bind('submit', function(e) {
                that.submit.call(that, e);
            });

            this.on('submit', function() {
                this.changeSubmitValue('loading');
            }, this);
            this.on('submit:success', function() {
                this.changeSubmitValue('success');
            }, this);
            this.on('submit:error', function() {
                this.changeSubmitValue('error');
            }, this);
        },
        getValues: function() {
            var values = {};
            $.each(this.elements, function(name, element) {
                values[name] = element.getValue();
            });
            return values;
        },
        validate: function() {
            var isValid = this.isValid();
            this.$el.toggleClass('invalid', !isValid);
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
        reset: function() {
            this.$el.get(0).reset();
        },
        submit: function(e) {
            this.messages = [];
            this.trigger('before:submit');
            if (this.validate()) {
                var data = this.getValues();
                this.trigger('submit', e, data);
            } else {
                e.preventDefault();
            }
        },
        buildElementsFromCollection: function(fieldset, collection) {
            var $fieldset = $(fieldset);
            var template = $fieldset.find('span').attr('data-template');
            template = template.replace(/\[__remove__\]/g, '');
            collection.each(function(resource, index) {
                var data = {
                    index: index,
                    model: resource.toJSON()
                };
                var html = _.template(template, data, {
                    interpolate: /__(.+?)__/g
                });
                $fieldset.append(html);
            });
        },
        bindModel: function(model) {
            this.model = model;
            this.bindModelPopulate(model);
            this.bindModelSubmit(model);
        },
        bindModelPopulate: function(model) {
            model.on('change', function() {
                this.populate(model.toJSON());
            }, this);
            this.populate(model.toJSON());
        },
        bindModelSubmit: function(model, options, saveOptions) {
            var that = this;
            var defaults = {
                method: 'save',
                isNew: model.isNew()
            };
            options = $.extend(defaults, options);

            var saveDefaults = {
                success: function() {
                    that.trigger('submit:success');

                    if (options.isNew) {
                        Copia.notice('success', 'Successfully created __model__', 10);
                        that.reset();
                    } else {
                        Copia.notice('success', 'Successfully updated __model__', 10);
                    }
                },
                error: function(model, fail) {
                    that.trigger('submit:error');

                    var response = JSON.parse(fail.responseText);
                    if (response['error-message']) {
                        that.addMessage(response['error-message']);
                        that.renderMessages();
                    } else if (response['messages']) {
                        $.each(response['messages'], function() {
                            that.addMessage(this);
                        });

                        that.renderMessages();
                    } else {
                        Copia.notice('fail', 'Failed saving __model__');
                        console.log('response', response);
                    }
                }
            };
            saveOptions = $.extend(saveDefaults, saveOptions);
            this.on('submit', function(e) {
                e.preventDefault();
                model[options.method].call(model, this.getValues(), saveOptions);
            }, this);
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
            if (typeof(this.messages) !== 'array') {
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
        }
    });

    return jzForm;
});