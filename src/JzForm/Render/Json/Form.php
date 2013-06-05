<?php

namespace JzForm\Render\Json;

use Zend\Form\FormInterface;
use Zend\Form\ElementInterface;

class Form extends RenderAbstract {

    public function render(FormInterface $form) {
        $json = array(
            'form' => array(
                'attributes' => $this->renderAttributes($form),
                'elements' => $this->renderElements($form),
            )
        );

        return $json;
    }

    public function renderElements(FormInterface $form) {
        foreach ($form->getElements() as $key => $value) {
            $data[$key] = $this->renderElement($value);
        }

        return $data;
    }

    public function renderElement(ElementInterface $element) {
        $render = new Element;
        return $render->render($element);
    }

}