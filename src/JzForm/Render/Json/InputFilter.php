<?php

namespace JzForm\Render\Json;

use Zend\InputFilter\InputFilter as ZfInputFilter;
use Zend\InputFilter\Input as ZfInput;
use Zend\Filter\FilterInterface;
use JzForm\Render\Exception;
use JzForm\Render\FilterMap;
use JzForm\Render\ValidatorMap;

class InputFilter extends RenderAbstract {

    protected $filterMap;
    protected $validatorMap;

    public function render(ZfInputFilter $inputFilter) {
        $data = array();

        foreach ($inputFilter->getInputs() as $key => $input) {
            $data[$key] = array(
                'filters' => $this->getFilters($input),
                'validators' => $this->getValidators($input),
            );
        }

        return $data;
    }

    public function getFilters(ZfInput $input) {
        $filters = $input->getFilterChain()->getFilters();
        return array_map(array($this, 'buildFilter'), $filters->toArray());
    }

    public function getValidators(ZfInput $input) {
        $validators = $input->getValidatorChain()->getValidators();
        return array_map(array($this, 'buildValidator'), $validators);
    }

    public function buildFilter($filter) {
        $map = $this->getFilterMap();
        switch (true) {
            case is_array($filter) && array_key_exists('data', $filter):
                $filter = $filter['data'];
            case ($filter instanceof FilterInterface):
            case is_string($filter):
                return array(
                    'name' => $map->mapName($filter),
                    'options' => $map->mapOptions($filter),
                );
            case is_array($filter) && array_key_exists('name', $filter):
                $filter['name'] = $map->mapName($filter['name']);
                return $filter;
            default:
                var_dump($filter);
                throw new Exception('Invalid filter');
        }
    }

    public function buildValidator($validator) {
        $map = $this->getValidatorMap();

        switch (true) {
            case is_array($validator) && array_key_exists('instance', $validator):
                $validator = $validator['instance'];
            case ($validator instanceof ValidatorInterface):
            case is_string($validator):
                return array(
                    'name' => $map->mapName($validator),
                    'options' => $map->mapOptions($validator),
                );
            case is_array($validator) && array_key_exists('name', $validator):
                $validator['name'] = $map->mapName($validator['name']);
                return $validator;
            default:
                throw new Exception('Invalid validator');
        }
    }

    public function getFilterMap() {
        if ($this->filterMap === null) {
            $this->filterMap = new FilterMap();
        }

        return $this->filterMap;
    }

    public function getValidatorMap() {
        if ($this->validatorMap === null) {
            $this->validatorMap = new ValidatorMap();
        }

        return $this->validatorMap;
    }

}