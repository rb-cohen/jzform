define([
    'underscore',
    'jquery',
    'backbone',
    './jzformElement'
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
                } else if (typeof(values[index]) !== 'undefined' && typeof(value) !== 'undefined') {
                    values[index] = [values[index], value];
                } else if (typeof(values[index]) !== 'undefined') {
                    values[index] = [values[index]];
                } else {
                    values[index] = value;
                }
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
            var template = $fieldset.find('span').attr('data-template');
            template = template.replace(/\[__remove__\]/g, '');
            var that = this;
            collection.each(function(resource, index) {
                var data = {
                    index: index,
                    model: resource.toJSON()
                };
                var html = _.template(template, data, {
                    interpolate: /__(.+?)__/g
                });
                $fieldset.append(html);
                var input = $fieldset.find('.element:last *[name]');
                var name = that.params.name + '_' + index;
                var options = {
                    name: that.params.name
                };
                var element = new Element(that.getForm(), options);
                element.setInput(input);
                that.addElement(name, element);
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