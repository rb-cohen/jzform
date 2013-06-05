<?php

if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    $autoloader = require(__DIR__ . '/../vendor/autoload.php');
} else {
    throw new Exception('No autoload.php. Have you run composer install?');
}