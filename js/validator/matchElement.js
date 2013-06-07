define([
    './validator.js'
], function(Validator) {
    var MatchElement = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(MatchElement.prototype, Validator, {
        isValid: function(value, context) {
            if (!context || typeof context.getValues !== 'function') {
                this.error('noContext');
                return false;
            }

            var token = this.params.token;
            if (!token) {
                this.error('missingToken');
                return false;
            }

            var values = context.getValues();

            if (value !== values[token]) {
                this.error('notSame');
                return false;
            }

            return true;
        }
    });

    return MatchElement;
});