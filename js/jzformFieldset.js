define([
    'require',
    'underscore',
    'jquery',
    'backbone',
    './jzformElement'
], function(require, _, $, Backbone, Element) {
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
                console.log('add', form, options);

                switch (options.type) {
                    case 'fieldset':
                        that.elements[name] = new Fieldset(form, options);
                        break;
                    case 'element':
                    default:
                        that.elements[name] = new Element(form, options);
                        break;
                }

            });
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
        clearElements: function(selector) {
            selector = selector || '.element';
            this.getInput().find(selector).remove();
        },
        buildElementsFromCollection: function(collection) {
            var $fieldset = this.getInput();
            console.log('build', $fieldset, collection);

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
        populate: function(data) {
            var that = this;
            $.each(data, function(key, value) {
                var element = that.getElement(key);
                if (element) {
                    element.setValue(value);
                }
            });
        }
    });

    return Fieldset;
});