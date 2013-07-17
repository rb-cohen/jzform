define([
    './validator.js'
], function(Validator) {
    var Step = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(Step.prototype, Validator, {
        isValid: function(value) {
            value = parseFloat(value);

            var fmod = this.fmod(value - this.params.baseValue, this.params.step);
            if (fmod !== 0.0 && fmod !== this.params.step) {
                this.error('notStep');
                return false;
            }

            return true;
        },
        fmod: function(x, y) {
            if (y == 0.0) {
                return 1.0;
            }

            var precision = x.substr(x.indexOf('.') + 1).length + y.substr(y.indexOf('.') + 1).length;
            return Math.round(x - y * Math.floor(x / y), precision);
        }
    });

    return Step;
});