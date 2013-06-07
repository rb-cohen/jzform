define([
    'filter/filter'
], function(Filter) {
    var StringTrim = Filter;

    StringTrim.extend(StringTrim.prototype, {
        filter: function(value) {
            return value.trim();
        }
    });

    return StringTrim;
});