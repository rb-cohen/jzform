define([
    'jzform/validator/validator'
], function(Validator) {
    var MatchElement = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
        this.firstValidation = true;
    };

    Validator.extend(MatchElement.prototype, Validator, {
        listenForTokenChange: function() {
            if (this.params.element && this.params.token) {
                var element = this.params.element;
                var token = this.params.token;
                element.listenTo(element.form, 'change:' + token, element.validate);
            }
        },
        isValid: function(value, context) {
            if (!context || typeof context.getValues !== 'function') {
                this.error('noContext');
                return false;
            }

            var token = this.params.token;
            if (!token) {
                this.error('missingToken');
                return false;
            }

            if (this.firstValidation) {
                this.listenForTokenChange();
                this.firstValidation = false;
            }

            var values = context.getValues();

            if (value !== values[token]) {
                this.error('notSame');
                return false;
            }

            return true;
        }
    });

    return MatchElement;
});