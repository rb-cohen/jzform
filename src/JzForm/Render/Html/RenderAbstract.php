<?php

namespace JzForm\Render\Html;

use Zend\Form\ElementInterface;

class RenderAbstract {

    public function renderAttributes(ElementInterface $element, array $skip = array()) {
        $render = new Attributes;
        return $render->render($element, $skip);
    }

}