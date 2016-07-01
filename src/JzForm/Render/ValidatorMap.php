<?php

namespace JzForm\Render;

use Zend\Validator\ValidatorInterface;

class ValidatorMap {

    public $names = array(
        'Zend\I18n\Validator\Alnum' => 'alnum',
        'Zend\I18n\Validator\IsInt' => 'int',
        'Zend\I18n\Validator\Int' => 'int',
        'Zend\I18n\Validator\Float' => 'float',
        'Zend\\Validator\\Between' => 'between',
        'Zend\\Validator\\Csrf' => 'notEmpty',
        'Zend\\Validator\\EmailAddress' => 'regex',
        'Zend\\Validator\\Explode' => 'explode',
        'Zend\\Validator\\File\\Extension' => 'fileExtension',
        'Zend\\Validator\\File\\Size' => 'fileSize',
        'Zend\\Validator\\GreaterThan' => 'greaterThan',
        'Zend\\Validator\\Identical' => 'matchElement',
        'Zend\\Validator\\InArray' => 'inArray',
        'Zend\\Validator\\LessThan' => 'lessThan',
        'Zend\\Validator\\NotEmpty' => 'notEmpty',
        'Zend\\Validator\\Regex' => 'regex',
        'Zend\\Validator\\Step' => 'step',
        'Zend\\Validator\\StringLength' => 'stringLength',
    );
    public $options = array(
        'between' => array(
            'methods' => array(
                'min' => 'getMin',
                'max' => 'getMax',
            ),
        ),
        'explode' => array(
            'methods' => array(
                'validator' => 'getValidator'
            ),
        ),
        'fileExtension' => array(
            'methods' => array(
                'extension' => 'getExtension'
            ),
        ),
        'fileSize' => array(
            'methods' => array(
                'min' => 'getMin',
                'max' => 'getMax'
            ),
        ),
        'inArray' => array(
            'methods' => array(
                'haystack' => 'getHaystack',
            )
        ),
        'matchElement' => array(
            'methods' => array(
                'token' => 'getToken'
            ),
        ),
        'regex' => array(
            'methods' => array(
                'pattern' => 'getPattern'
            ),
        ),
        'stringLength' => array(
            'methods' => array(
                'min' => 'getMin',
                'max' => 'getMax',
            ),
        )
    );
    protected $instanceCache = array();

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

    public function mapMessages($validator) {
        if ($validator instanceof ValidatorInterface) {
            return $validator->getMessageTemplates();
        } elseif ($instance = $this->getValidatorInstanceForMeta($validator)) {
            return $instance->getMessageTemplates();
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

    protected function getValidatorInstanceForMeta($validator) {
        if (array_key_exists($validator, $this->instanceCache)) {
            return $this->instanceCache[$validator];
}

        if (array_key_exists($validator, $this->names)) {
            $this->instanceCache[$validator] = new $validator;
            return $this->instanceCache[$validator];
        }

        return false;
    }

}
