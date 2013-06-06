<?php

namespace JzForm\Render\Json;

use Zend\Form\FormInterface;
use Zend\Form\ElementInterface;
use Zend\InputFilter\InputFilter as ZfInputFilter;

class Form extends RenderAbstract {

    public function render(FormInterface $form, ZfInputFilter $inputFilter = null) {
        if (method_exists($form, 'prepare')) {
            $form->prepare();
        }

        $formData = array(
            'form' => array(
                'attributes' => $this->renderAttributes($form),
                'elements' => $this->renderElements($form),
            )
        );

        $filterData = ($inputFilter) ? $this->renderInputFilter($form, $inputFilter) : array();
        return array_merge_recursive($formData, $filterData);
    }

    public function renderElements(FormInterface $form) {
        $data = array();
        foreach ($form->getElements() as $key => $value) {
            $data[$key] = $this->renderElement($value);
        }

        return $data;
    }

    public function renderElement(ElementInterface $element) {
        $render = new Element;
        return $render->render($element);
    }

    public function renderInputFilter(FormInterface $form, ZfInputFilter $inputFilter = null) {
        $data = array();

        $filterRender = new InputFilter();
        $filterData = $filterRender->render($inputFilter);

        foreach ($form->getElements() as $name => $element) {
            if (array_key_exists($name, $filterData)) {
                $spec = $filterData[$name];
                $data['form']['elements'][$name] = $spec;
            }
        }

        return $data;
    }

}