define([
    'underscore',
    'jquery',
    'backbone'
], function(_, $, Backbone) {
    var jzFormElement = function(element, params) {
        var defaults = {
            basePath: './'
        };

        this.$el = $(element);
        this.params = $.extend(defaults, params);
        this.initialize();
    };

    _.extend(jzFormElement.prototype, Backbone.Events, {
        filters: null,
        validators: null,
        initialize: function() {
            this.prepareFilters();
            this.prepareValidators();
            this.bindEvents();
        },
        prepareFilters: function() {
            var that = this;

            this.filters = [];
            $.each(this.params.filters, function(index, params) {
                var name = that.params.basePath + 'filter/' + params.name + '.js';
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
                var name = that.params.basePath + 'validator/' + params.name + '.js';
                require([name], function(Validator) {
                    var validator = new Validator(params.options, params.messages);
                    that.validators.push(validator);
                });
            });
        },
        bindEvents: function() {
            var that = this;
            this.$el.bind('focus blur change keydown keyup paste', function(e) {
                that.trigger(e.type, e);
            });

            this.on('change', this.filter, this);
            this.on('change', this.validate, this);
        },
        filter: function() {
            var currentValue = this.$el.val();
            var filteredValue = currentValue;

            $.each(this.filters, function(index, filter) {
                filteredValue = filter.filter(filteredValue);
            });

            this.$el.val(filteredValue);
        },
        validate: function() {
            var isValid = this.isValid();
            this.getTarget().toggleClass('invalid', !isValid);
            this.renderMessages();

            return isValid;
        },
        renderMessages: function() {
            if (!this.params.renderMessages) {
                return;
            }

            var target = this.getTarget();
            var messages = target.find('.messages');
            if (messages.length === 0) {
                target.append('<div class="messages"></div>');
                messages = target.find('.messages');
            }

            messages.empty();
            $.each(this.messages, function(index, message) {
                messages.append('<p>' + message + '</p>');
            });
        },
        isValid: function() {
            this.messages = [];
            var currentValue = this.$el.val();
            var valid = true;

            var that = this;
            $.each(this.validators, function(index, validator) {
                valid = (valid && validator.isValid(currentValue));

                if (!valid && validator.message) {
                    that.messages.push(validator.message);
                }
            });

            return valid;
        },
        getTarget: function() {
            return this.$el.parent('label, fieldset');
        }
    });

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

    _.extend(jzForm.prototype, Backbone.Events, {
        elements: {},
        initialize: function() {
            this.prepareElements();
            this.bindEvents();
        },
        prepareElements: function() {
            var that = this;
            $.each(this.params.form.elements, function(name, params) {
                var $element = that.$el.find('*[name="' + name + '"]');
                var options = $.extend(that.params.element, params);

                var element = that.elements[name] = new jzFormElement($element, options);
                that.listenToElementEvents.call(that, element);
            });
        },
        bindEvents: function() {
            var that = this;
            this.$el.bind('submit', function(e) {
                that.submit.call(that, e);
            });
        },
        listenToElementEvents: function(element) {
            element.on('all', function(name) {
                var args = $.makeArray(arguments);
                args.shift();
                args.unshift(element);
                args.unshift('element:' + name);
                this.trigger.apply(this, args);
            }, this);
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
        submit: function(e) {
            this.trigger('before:submit');

            if (this.validate()) {
                this.trigger('submit');
            } else {
                e.preventDefault();
            }
        }
    });

    return jzForm;
});