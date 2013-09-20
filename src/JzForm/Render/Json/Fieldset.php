<?php

namespace JzForm\Render\Json;

use Zend\Form\FormInterface;
use Zend\Form\FieldsetInterface;
use Zend\Form\ElementInterface;
use Zend\InputFilter\InputFilter as ZfInputFilter;

class Fieldset extends RenderAbstract {

    public function render(FieldsetInterface $element) {
        $data = array(
            'name' => $element->getName(),
            'type' => 'fieldset',
            'elements' => $this->renderElements($element),
        );

        $inputFilter = $element->getOption('inputFilter');
        if ($inputFilter) {
            $inputData = $this->renderInputFilter($element, $inputFilter);
            foreach ($inputData as $name => $spec) {
                $original = empty($data['elements'][$name]) ? array() : $data['elements'][$name];
                $data['elements'][$name] = array_merge($original, $spec);
            }
        }

        return $data;
    }

    public function renderElements(FieldsetInterface $form) {
        $data = array();
        foreach ($form as $element) {
            if ($element instanceof FieldsetInterface) {
                $data[$element->getName()] = $this->renderFieldset($element);
            } else {
                $data[$element->getName()] = $this->renderElement($element);
            }
        }

        return $data;
    }

    public function renderFieldset(FieldsetInterface $element) {
        $render = new Fieldset;
        return $render->render($element);
    }

    public function renderElement(ElementInterface $element) {
        $render = new Element;
        return $render->render($element);
    }

    public function renderInputFilter(FormInterface $form, ZfInputFilter $inputFilter = null) {
        $data = array();

        $filterRender = new InputFilter();
        $filterData = $filterRender->render($inputFilter);

        foreach ($form as $element) {
            $name = $element->getName();
            if (array_key_exists($name, $filterData)) {
                $spec = $filterData[$name];
                $data[$name] = $spec;
            }
        }

        return $data;
    }

}