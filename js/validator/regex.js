define([
    './validator.js'
], function(Validator) {
    var Regex = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(Regex.prototype, Validator, {
        isValid: function(value) {
            var pattern = this.params.pattern;
            if (pattern.substr(0, 1) === '/' && pattern.substr(pattern.length - 1, 1) === '/') {
                pattern = pattern.substr(1, pattern.length - 2);
            }

            var regex = new RegExp(pattern);
            var match = regex.test(value);

            if (!match) {
                this.error('regexNotMatch');
            }

            return match;
        }
    });

    return Regex;
});