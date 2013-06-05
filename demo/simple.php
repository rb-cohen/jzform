<?php

use JzForm\Render\Json\Form as JsonForm;
use Zend\Form\Form;
use Zend\Form\Element\Email;
use Zend\Form\Element\Password;
use Zend\Form\Element\Submit;

require('autoloader.php');

$email = new Email('email');
$email->setLabel('Email');

$password = new Password('password');
$password->setLabel('Password');

$submit = new Submit('login');
$submit->setLabel('Login');

$form = new Form();
$form->add($email)
        ->add($password)
        ->add($submit);

$render = new JsonForm();
$json = $render->render($form);

var_dump($json);
