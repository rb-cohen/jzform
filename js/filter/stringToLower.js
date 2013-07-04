define([
    './filter.js'
], function(Filter) {
    var StringToLower = Filter;

    StringToLower.extend(StringToLower.prototype, {
        filter: function(value) {
            return value.toLowerCase();
        }
    });

    return StringToLower;
});