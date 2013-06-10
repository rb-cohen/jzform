<?php

namespace JzForm\Render\Html;

use Zend\Form\FieldsetInterface;

class Collection extends RenderAbstract {

    /**
     * 
     * @param \Zend\Form\FieldsetInterface $element
     * @return string
     */
    public function render(FieldsetInterface $element) {
        $formCollection = $this->getRenderer()->plugin('formCollection');
        $formCollection->setShouldWrap(false);

        $element->setAttribute('id', $element->getAttribute('name') . '-fieldset');

        $attributeHelper = new Attributes();
        $attributes = $attributeHelper->render($element, array('name'));

        $html = '<fieldset ' . $attributes . '>';

        $label = $element->getLabel();
        if ($label) {
            $html .= '<legend>' . $label . '</legend>';
        }

        $html .= $formCollection->render($element);
        $html .= '</fieldset>';

        return $html;
    }

}