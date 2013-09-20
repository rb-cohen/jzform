define([
    'jzform/validator/validator'
], function(Validator) {
    var InArray = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(InArray.prototype, Validator, {
        isValid: function(value) {
            value = value.toString();
            var haystack = this.params.haystack;
            for (i = 0; i < haystack.length; i++) {
                if (value == haystack[i]) {
                    return true;
                }
            }

            this.error('notInArray');
            return false;
        }
    });

    return InArray;
});