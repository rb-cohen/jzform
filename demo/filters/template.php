<?php

use Zend\InputFilter\InputFilter;

$filter = new InputFilter;
$filter->add(array(
    'name' => 'password',
    'required' => true,
    'validators' => array(
        array(
            'name' => 'StringLength',
            'options' => array(
                'min' => 6,
                'max' => 255,
            ),
        )
    )
));

return $filter;