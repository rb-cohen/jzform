define([
    './validator.js'
], function(Validator) {
    var FileSize = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(FileSize.prototype, Validator, {
        isValid: function(value, context) {
            console.log('implement file size validator');
            return true;
        }
    });

    return FileSize;
});