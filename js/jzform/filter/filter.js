define([
    'underscore'
], function(_) {
    var Filter = function(params) {
        this.params = params;
    };

    Filter.extend = _.extend;

    return Filter;
});