define([
    './validator.js'
], function(Validator) {
    var GreaterThan = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(GreaterThan.prototype, Validator, {
        isValid: function(value) {
            value = parseFloat(value);

            if (value > parseFloat(this.params.max)) {
                this.error('notGreaterThan');
                return false;
            }

            return true;
        }
    });

    return GreaterThan;
});