<?php

use JzForm\Render\Json\Form as JsonForm;

require_once('autoloader.php');

$form = require('forms/template.php');
$filter = require('filters/template.php');

$render = new JsonForm();
$json = $render->render($form, $filter);

$string = \Zend\Json\Json::encode($json);
echo \Zend\Json\Json::prettyPrint($string);