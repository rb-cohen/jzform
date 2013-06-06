<?php

namespace JzForm\Render;

use Zend\Filter\FilterInterface;

class FilterMap {

    public $names = array(
        'Zend\\Filter\\StringTrim' => 'StringTrim',
    );
    public $options = array(
    );

    public function mapName($filter) {
        return $this->getName($filter);
    }

    public function mapOptions($filter) {
        $name = $this->getName($filter);
        if ($filter instanceof FilterInterface && array_key_exists($name, $this->options)) {
            $defaults = array(
                'methods' => array(),
                'properties' => array()
            );

            $options = array_merge($defaults, $this->options[$name]);
            foreach ($options['methods'] as $key => $method) {
                $data[$key] = call_user_func_array(array($filter, $method), array());
            }

            return $data;
        }

        return array();
    }

    public function getName($filter) {
        switch (true) {
            case is_string($filter):
                $name = $filter;
                break;
            case ($filter instanceof FilterInterface):
                $name = get_class($filter);
                break;
            default:
                throw new Exception('Could not resolve validator name');
        }

        if (array_key_exists($name, $this->names)) {
            return $this->names[$name];
        }

        throw new Exception('Unknown filter ' . $name);
    }

}