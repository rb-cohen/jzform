define([
    'underscore'
], function(_) {
    var Validator = {
        message: null,
        error: function(key, params) {
            params = params || this.params;

            if (this.messageTemplates && key in this.messageTemplates) {
                var template = this.messageTemplates[key];
            } else {
                var template = 'Value invalid';
            }

            this.message = template;
        }
    };

    Validator.extend = _.extend;

    return Validator;
});