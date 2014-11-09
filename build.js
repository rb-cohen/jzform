({
    baseUrl: '.',
    out: 'js/jzform.min.js',
    exclude: [
        'require',
        'underscore',
        'jquery',
        'backbone'
    ],
    paths: {
        'jzform': 'js/src/jzform',
        'underscore': 'empty:',
        'jquery': 'empty:',
        'backbone': 'empty:'
    },
    name: 'jzform/jzform',
    include: [
        'jzform/jzform',
        'jzform/jzformElement',
        'jzform/jzformFieldset',
        'jzform/validator/alnum',
        'jzform/validator/between',
        'jzform/validator/fileExtension',
        'jzform/validator/fileSize',
        'jzform/validator/float',
        'jzform/validator/greaterThan',
        'jzform/validator/inArray',
        'jzform/validator/int',
        'jzform/validator/lessThan',
        'jzform/validator/matchElement',
        'jzform/validator/notEmpty',
        'jzform/validator/regex',
        'jzform/validator/step',
        'jzform/validator/stringLength',
        'jzform/validator/validator',
        'jzform/filter/boolean',
        'jzform/filter/filter',
        'jzform/filter/float',
        'jzform/filter/int',
        'jzform/filter/stringToLower',
        'jzform/filter/stringToUpper',
        'jzform/filter/stringTrim'
    ]
})