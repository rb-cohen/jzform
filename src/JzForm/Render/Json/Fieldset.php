<?php

namespace JzForm\Render\Json;

use Zend\Form\FieldsetInterface;
use Zend\Form\ElementInterface;

class Fieldset extends RenderAbstract {

    public function render(FieldsetInterface $element) {
        $data = array(
            'name' => $element->getName(),
            'type' => 'fieldset',
            'elements' => $this->renderElements($element),
        );

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

}