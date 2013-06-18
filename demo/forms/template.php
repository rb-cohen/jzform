<?php

use Zend\Form\Form;
use Zend\Form\Fieldset;
use Zend\Form\Element\Email;
use Zend\Form\Element\Password;
use Zend\Form\Element\Radio;
use Zend\Form\Element\Submit;
use JzForm\Element\TemplateCollection;

class TemplateForm extends Form {

    public function prepare() {
        if ($this->isPrepared) {
            return $this;
        }

        $email = new Email('email');
        $email->setLabel('Email');

        $password = new Password('password');
        $password->setLabel('P2assword');
        
        $member = new Radio('memberOf');
        $member->setValueOptions(array(
                    '__model.id__' => '__model.name__'
                ));
        
        $memberOfTemplate = new TemplateCollection('memberOfTemplate');
        $memberOfTemplate->setTargetElement($member);
        
        $memberOf = new Fieldset('memberOfGroup');
        $memberOf->setLabel('Member of')
                ->add($memberOfTemplate);

        $submit = new Submit('register');
        $submit->setValue('Register');

        $this/*->add($email)
                ->add($password)*/
                ->add($memberOf)
                ->add($submit);

        return parent::prepare();
    }

}

return new TemplateForm('template-form');