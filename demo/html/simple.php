<?php

use Zend\View\Renderer\PhpRenderer;
use Zend\Form\View\Helper\Form as FormHelper;
use Zend\Form\View\HelperConfig as FormHelperConfig;

require(__DIR__ . '/../autoloader.php');
$form = require(__DIR__ . '/../forms/simple.php');

$view = new PhpRenderer;

$formHelperConfig = new FormHelperConfig;
$formHelperConfig->configureServiceManager($view->getHelperPluginManager());

$formHelper = new FormHelper;
$formHelper->setView($view);
?>
<html>
    <head>
        <title>Simple test</title>
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
        <?php echo $formHelper->render($form); ?>

        <script type="text/javascript">
            require(['jzform'], function(jzForm) {
                var form = new jzForm('#simple-form');
            });
        </script>
    </body>
</html>