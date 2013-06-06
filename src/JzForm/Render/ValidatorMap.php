<?php

namespace JzForm\Render;

use Zend\Validator\ValidatorInterface;

class ValidatorMap {

    public $names = array(
        'Zend\\Validator\\Regex' => 'Regex',
        'Zend\\Validator\\StringLength' => 'StringLength',
    );
    public $options = array(
        'Regex' => array(
            'methods' => array(
                'pattern' => 'getPattern'
            ),
        ),
        'StringLength' => array(
            'methods' => array(
                'min' => 'getMin',
                'max' => 'getMax',
            ),
        )
    );

    public function mapName($validator) {
        return $this->getName($validator);
    }

    public function mapOptions($validator) {
        $name = $this->getName($validator);
        if ($validator instanceof ValidatorInterface && array_key_exists($name, $this->options)) {
            $defaults = array(
                'methods' => array(),
                'properties' => array()
            );

            $options = array_merge($defaults, $this->options[$name]);
            foreach ($options['methods'] as $key => $method) {
                $data[$key] = call_user_func_array(array($validator, $method), array());
            }

            return $data;
        }

        return array();
    }

    public function getName($validator) {
        switch (true) {
            case is_string($validator):
                $name = $validator;
                break;
            case ($validator instanceof ValidatorInterface):
                $name = get_class($validator);
                break;
            default:
                throw new Exception('Could not resolve validator name');
        }

        if (array_key_exists($name, $this->names)) {
            return $this->names[$name];
        }

        throw new Exception('Unknown validator ' . $name);
    }

}