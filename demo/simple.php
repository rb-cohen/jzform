<?php

use JzForm\Render\Json\Form as JsonForm;

require('autoloader.php');

$form = require('forms/simple.php');
$filter = require('filters/simple.php');

$render = new JsonForm();
$json = $render->render($form, $filter);

$string = \Zend\Json\Json::encode($json);
echo \Zend\Json\Json::prettyPrint($string);
