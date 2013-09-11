define([
    'jzform/filter/filter'
], function(Filter) {
    var StringToLower = Filter;

    StringToLower.extend(StringToLower.prototype, {
        filter: function(value) {
            return value.toLowerCase();
        }
    });

    return StringToLower;
});