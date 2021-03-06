<?php

namespace JzForm\Render\Json;

use Zend\Form\FormInterface;
use Zend\Form\FieldsetInterface;
use Zend\InputFilter\InputFilter as ZfInputFilter;

class Form extends Fieldset {

    public function render(FieldsetInterface $form, ZfInputFilter $inputFilter = null) {
        if (method_exists($form, 'prepare')) {
            $form->prepare();
        }

        $formData = array(
            'form' => array(
                'attributes' => $this->renderAttributes($form),
                'elements' => $this->renderElements($form),
            )
        );

        if ($inputFilter) {
            $inputData = $this->renderInputFilter($form, $inputFilter);
            foreach ($inputData as $name => $spec) {
                $original = empty($formData['form']['elements'][$name]) ? array() : $formData['form']['elements'][$name];
                $formData['form']['elements'][$name] = array_merge($original, $spec);
            }
        }

        return $formData;
    }

}