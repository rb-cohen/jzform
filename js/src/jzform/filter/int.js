define([
    'jzform/filter/filter'
], function(Filter) {
    var Int = Filter;

    Int.extend(Int.prototype, {
        filter: function(value) {
            return parseInt(value) || 0;
        }
    });

    return Int;
});