<?php

namespace JzForm\Element;

class TemplateCollection extends Template{
    
    public function __construct($name = null, $options = array()) {
        parent::__construct($name, $options);
        
        $this->setAttribute('class', 'template collection');
    }
    
}