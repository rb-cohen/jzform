define([
    './validator.js'
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