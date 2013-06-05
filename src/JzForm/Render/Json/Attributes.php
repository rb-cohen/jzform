<?php

namespace JzForm\Render\Json;

use JzForm\Render\Exception;

class Attributes {

    public function render($element, array $skip = array()) {
        if (!method_exists($element, 'getAttributes')) {
            throw new Exception('Invalid element for attribute render');
        }

        $data = array();
        foreach ($element->getAttributes() as $key => $value) {
            if (in_array($key, $skip) === false) {
                $data[$key] = (string) $value;
            }
        }

        return $data;
    }

}