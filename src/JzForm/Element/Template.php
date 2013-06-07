<?php

namespace JzForm\Element;

use Zend\Form\Element\Collection;

class Template extends Collection{
    
    public function __construct($name = null, $options = array()) {
        $defaults = array('count' => 1);
        $options = array_merge($defaults, $options);
        
        parent::__construct($name, $options);
        $this->setShouldCreateTemplate(true);
    }
    
}