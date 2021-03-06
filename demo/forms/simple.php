<?php

use Zend\Form\Form;
use Zend\Form\Fieldset;
use Zend\Form\Element\Email;
use Zend\Form\Element\Password;
use Zend\Form\Element\Submit;

class SimpleForm extends Form {

    public function prepare() {
        if ($this->isPrepared) {
            return $this;
        }

        $email = new Email('email');
        $email->setLabel('Email');

        $password = new Password('password');
        $password->setLabel('Password');

        $submit = new Submit('login');
        $submit->setValue('Login');

        $this->add($email)
                ->add($password)
                ->add($submit);

        return parent::prepare();
    }

}

return new SimpleForm('simple-form');