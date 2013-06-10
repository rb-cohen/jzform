<?php

namespace JzForm\Render\Html;

use Zend\Form\ElementInterface;
use Zend\View\Renderer\PhpRenderer;
use Zend\Form\View\HelperConfig as ZendFormHelperConfig;
use JzForm\View\HelperConfig as FormHelperConfig;

class RenderAbstract {

    protected $renderer;

    /**
     * 
     * @param \Zend\View\Renderer\PhpRenderer $renderer
     */
    public function __construct(PhpRenderer $renderer = null) {
        if ($renderer !== null) {
            $this->setRenderer($renderer);
        }
    }

    /**
     * 
     * @param \Zend\View\Renderer\PhpRenderer $renderer
     * @return \JzForm\Render\Html\RenderAbstract
     */
    public function setRenderer(PhpRenderer $renderer) {
        $this->renderer = $renderer;
        return $this;
    }

    /**
     * 
     * @return \Zend\View\Renderer\PhpRenderer
     */
    public function getRenderer() {
        if ($this->renderer === null) {
            $renderer = new PhpRenderer;

            // register view helpers
            $formHelperConfig = new ZendFormHelperConfig;
            $formHelperConfig->configureServiceManager($renderer->getHelperPluginManager());

            // register view helpers
            $formHelperConfig = new FormHelperConfig;
            $formHelperConfig->configureServiceManager($renderer->getHelperPluginManager());

            // set base path
            $path = ($this->templatePath)? : __DIR__ . '/view/scripts';
            $renderer->resolver()->addPath($path);

            $this->setRenderer($renderer);
        }

        return $this->renderer;
    }

    /**
     * 
     * @param \Zend\Form\ElementInterface $element
     * @param array $skip
     * @return string
     */
    public function renderAttributes(ElementInterface $element, array $skip = array()) {
        $render = new Attributes;
        return $render->render($element, $skip);
    }

}