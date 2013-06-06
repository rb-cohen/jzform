define([
    'underscore',
    'jquery',
    'backbone',
], function(_, $, Backbone) {
    var jzForm = function(element) {
        this.el = element;
        this.$el = $(element);
        this.initialize();
    };

    _.extend(jzForm.prototype, Backbone.Events, {
        initialize: function() {
            console.log(this.$el);

            var that = this;
            this.$el.bind('submit', function(e) {
                that.submit.call(that, e);
            });
        },
        submit: function(e) {
            console.log('submitted');
            e.preventDefault();
        }
    });

    return jzForm;
});