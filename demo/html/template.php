<?php

use JzForm\Render\Html\Form as HtmlForm;
use JzForm\Render\Json\Form as JsonForm;

require_once(__DIR__ . '/../autoloader.php');
$form = require_once(__DIR__ . '/../forms/template.php');
$filter = require(__DIR__ . '/../filters/simple.php');

$renderJson = new JsonForm();
$json = $renderJson->render($form, $filter);

$renderHtml = new HtmlForm();
$html = $renderHtml->render($form);
?>
<html>
    <head>
        <title>Template test</title>
        <script type="text/javascript" src="../../js/require.js"></script>
        <script type="text/javascript">
            require.config({
                baseUrl: '../../js/',
                paths: {
                    backbone: 'backbone.min',
                    underscore: 'underscore.min',
                    jquery: 'jquery.min'
                },
                shim: {
                    'backbone': {
                        deps: ['underscore'],
                        exports: 'Backbone'
                    },
                    'underscore': {
                        exports: '_'
                    },
                    'jquery': {
                        exports: '$'
                    }
                }
            });
        </script>
    </head>
    <body>
        <?php echo $html; ?>

        <script type="text/javascript">
            require(['jzform'], function(jzForm) {
                var simpleFormConfig = <?php echo json_encode($json); ?>;
                var form = new jzForm('#simple-form', simpleFormConfig);
            });
        </script>
    </body>
</html>