define([
    'jzform/validator/validator'
], function(Validator) {
    var Between = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(Between.prototype, Validator, {
        isValid: function(value) {
            value = parseFloat(value);

            if (value < parseFloat(this.params.min)) {
                this.error('notBetween');
                return false;
            }

            if (value > parseFloat(this.params.max)) {
                this.error('notBetween');
                return false;
            }

            return true;
        }
    });

    return Between;
});