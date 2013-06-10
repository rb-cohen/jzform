define([
    './validator.js'
], function(Validator) {
    var Alnum = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(Alnum.prototype, Validator, {
        isValid: function(value) {
            var regex = new RegExp('[^a-zA-Z0-9]');
            var match = regex.test(value);

            if (match) {
                this.error('notAlnum');
                return false;
            }

            return true;
        }
    });

    return Alnum;
});