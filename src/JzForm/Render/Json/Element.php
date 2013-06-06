<?php

namespace JzForm\Render\Json;

use JzForm\Render\Exception;
use JzForm\Render\FilterMap;
use JzForm\Render\ValidatorMap;
use Zend\Form\ElementInterface;
use Zend\InputFilter\InputProviderInterface;
use Zend\InputFilter\InputFilter as ZfInputFilter;
use Zend\Filter\FilterInterface;
use Zend\Validator\ValidatorInterface;

class Element extends RenderAbstract {

    public function render(ElementInterface $element) {
        $elementData = array(
            'type' => $element->getAttribute('type'),
            'name' => $element->getName(),
            'label' => $element->getLabel(),
            'value' => $element->getValue(),
            'attributes' => $this->renderAttributes($element, array('name', 'type')),
        );

        $specData = $this->getSpec($element);

        return array_merge($elementData, $specData);
    }

    public function getSpec(ElementInterface $element) {
        if ($element instanceof InputProviderInterface) {
            $inputFilter = new ZfInputFilter();
            $inputFilter->add($element->getInputSpecification());

            $inputFilterRender = new InputFilter();
            $data = $inputFilterRender->render($inputFilter);
            return $data[$element->getName()];
        }

        return array(
            'filters' => array(),
            'validators' => array(),
        );
    }

}