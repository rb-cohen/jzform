define([
    'jzform/validator/validator'
], function(Validator) {
    var StringLength = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(StringLength.prototype, Validator, {
        isValid: function(value) {
            var tooShort = (value && this.params.min !== null && value.length < this.params.min);
            var tooLong = (value && this.params.max !== null && value.length > this.params.max);

            if (tooShort) {
                this.error('stringLengthTooShort');
            }

            if (tooLong) {
                this.error('stringLengthTooLong');
            }

            return (!tooShort && !tooLong);
        }
    });

    return StringLength;
});