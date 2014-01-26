define([
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
                model[options.method].call(model, values, saveOptions);
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
