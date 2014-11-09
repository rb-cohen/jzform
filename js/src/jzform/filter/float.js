define([
    'jzform/filter/filter'
], function(Filter) {
    var Float = Filter;

    Float.extend(Float.prototype, {
        filter: function(value) {
            return +value || 0;
        }
    });

    return Float;
});