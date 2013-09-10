define([
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