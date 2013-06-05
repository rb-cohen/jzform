<?php

namespace JzForm\Render\Json;

use JzForm\Render\Exception;
use Zend\Form\ElementInterface;
use Zend\InputFilter\InputProviderInterface;
use Zend\InputFilter\InputFilterInterface;

class Element extends RenderAbstract {

    public function render(ElementInterface $element) {
        $data = array(
            'type' => $element->getAttribute('type'),
            'name' => $element->getName(),
            'label' => $element->getLabel(),
            'attributes' => $this->renderAttributes($element, array('name', 'type')),
            'spec' => array(
                'filters' => $this->getFilters($element),
                'validators' => $this->getValidators($element),
            )
        );

        return $data;
    }

    public function getFilters(ElementInterface $element) {
        if ($element instanceof InputProviderInterface) {
            $spec = $element->getInputSpecification();
            return array_map(array($this, 'buildFilter'), $spec['filters']);
        }

        return array();
    }

    public function getValidators(ElementInterface $element) {
        if ($element instanceof InputProviderInterface) {
            $spec = $element->getInputSpecification();

            if ($spec['required']) {
                array_push($spec['validators'], array(
                    'name' => 'Required',
                ));
            }

            return array_map(array($this, 'buildValidator'), $spec['validators']);
        }

        return array();
    }

    public function buildFilter($filter) {
        switch (true) {
            case ($filter instanceof InputFilterInterface):
                return array(
                    'name' => get_class($filter),
                );
            case is_string($filter):
                return array(
                    'name' => $filter,
                );
            case is_array($filter):
                return $filter;
            default:
                throw new Exception('Invalid filter');
        }
    }

    public function buildValidator($validator) {
        switch (true) {
            case ($validator instanceof \Zend\Validator\ValidatorInterface):
                return array(
                    'name' => get_class($validator),
                );
            case is_string($validator):
                return array(
                    'name' => $validator,
                );
            case is_array($validator):
                return $validator;
            default:
                throw new Exception('Invalid validator');
        }
    }

}