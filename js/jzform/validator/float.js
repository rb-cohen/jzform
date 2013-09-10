define([
    'jzform/validator/validator'
], function(Validator) {
    var Float = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(Float.prototype, Validator, {
        isValid: function(value) {
            var match = (value === parseFloat(value));

            if (match) {
                this.error('notFloat');
                return false;
            }

            return true;
        }
    });

    return Float;
});