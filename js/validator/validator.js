define([
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