<?php

namespace JzForm\Element;

class TemplateCollection extends Template {

    const DEFAULT_TEMPLATE_PLACEHOLDER = '__index__';

    public function __construct($name = null, $options = array()) {
        parent::__construct($name, $options);

        $this->setAttribute('class', 'template collection');
    }

}