define([
    'jzform/filter/filter'
], function(Filter) {
    var Boolean = Filter;

    Boolean.extend(Boolean.prototype, {
        filter: function(value) {
            switch (true) {
                case (value === false):
                case (value <= 0):
                case (value === '0'):
                case (value === ''):
                    return false;
                default:
                    return true;
            }
        }
    });

    return Boolean;
});