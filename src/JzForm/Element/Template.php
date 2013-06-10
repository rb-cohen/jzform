<?php

namespace JzForm\Element;

use Zend\Form\Element\Collection;

class Template extends Collection {

    const DEFAULT_TEMPLATE_PLACEHOLDER = '__remove__';

    public function __construct($name = null, $options = array()) {
        $defaults = array(
            'count' => 0,
        );
        $options = array_merge($defaults, $options);

        $this->setAttribute('class', 'template');

        parent::__construct($name, $options);
        $this->setShouldCreateTemplate(true);
    }

}