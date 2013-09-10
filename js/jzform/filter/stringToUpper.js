define([
    'jzform/filter/filter'
], function(Filter) {
    var StringToUpper = Filter;

    StringToUpper.extend(StringToUpper.prototype, {
        filter: function(value) {
            return value.toUpperCase();
        }
    });

    return StringToUpper;
});