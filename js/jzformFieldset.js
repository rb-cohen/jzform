define([
    'require',
    'underscore',
    'jquery',
    'backbone'
], function(require, _, $, Backbone) {
    var Fieldset = function(form, params) {
        var defaults = {
        };
        this.form = form;
        this.params = $.extend(defaults, params);
        this.initialize();
    };

    return Fieldset;
});