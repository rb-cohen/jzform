define([
    './validator.js'
], function(Validator) {
    var FileExtension = function(params, messageTemplates) {
        this.params = params;
        this.messageTemplates = messageTemplates;
    };

    Validator.extend(FileExtension.prototype, Validator, {
        isValid: function(value, context) {
            console.log('implement file extension validator');
            return true;
        }
    });

    return FileExtension;
});