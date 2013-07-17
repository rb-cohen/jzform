define([
    './validator.js'
], function(Validator) {
    var LessThan = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(LessThan.prototype, Validator, {
        isValid: function(value) {
            value = parseFloat(value);

            if (value > parseFloat(this.params.max)) {
                this.error('notLessThan');
                return false;
            }

            return true;
        }
    });

    return LessThan;
});