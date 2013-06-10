define([
    './validator.js'
], function(Validator) {
    var StringLength = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(StringLength.prototype, Validator, {
        isValid: function(value) {
            var tooShort = (!value || value.length < this.params.min)
            var tooLong = (value && value.length > this.params.max);

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