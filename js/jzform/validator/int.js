define([
    'jzform/validator/validator'
], function(Validator) {
    var Int = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(Int.prototype, Validator, {
        isValid: function(value) {
            var match = (value === parseInt(value));

            if (match) {
                this.error('notInt');
                return false;
            }

            return true;
        }
    });

    return Int;
});