<?php

namespace JzForm\Render\Html;

use Zend\Form\FormInterface;
use Zend\Form\FieldsetInterface;
use Zend\Form\ElementInterface;
use Zend\View\Renderer\PhpRenderer;
use Zend\Form\View\HelperConfig as FormHelperConfig;

class Form extends RenderAbstract {

    protected $renderer;
    protected $templatePath;
    protected $templateElement = 'element.phtml';

    public function __construct(PhpRenderer $renderer = null) {
        if ($renderer !== null) {
            $this->setRenderer($renderer);
        }
    }

    public function render(FormInterface $form) {
        if (method_exists($form, 'prepare')) {
            $form->prepare();
        }

        $renderer = $this->getRenderer();

        $html = $renderer->plugin('form')->openTag($form);
        $html .= $this->renderElements($form);
        $html .= $renderer->plugin('form')->closeTag();

        return $html;
    }

    public function renderElements(FormInterface $form) {
        $html = null;
        foreach ($form as $element) {
            if ($element instanceof FieldsetInterface) {
                $html.= $this->renderCollection($element);
            } else {
                $html .= $this->renderElement($element);
            }
        }

        return $html;
    }

    public function renderCollection(FieldsetInterface $element) {
        $formCollection = $this->getRenderer()->plugin('formCollection');

        $html = $formCollection->render($element);
        return $html;
    }

    public function renderElement(ElementInterface $element) {
        $formRow = $this->getRenderer()->plugin('formRow');
        $formRow->setPartial($this->templateElement);

        $html = $formRow->render($element);
        return $html;
    }

    public function getRenderer() {
        if ($this->renderer === null) {
            $this->renderer = new PhpRenderer;

            // register view helpers
            $formHelperConfig = new FormHelperConfig;
            $formHelperConfig->configureServiceManager($this->renderer->getHelperPluginManager());

            // set base path
            $path = ($this->templatePath)? : __DIR__ . '/view/scripts';
            $this->renderer->resolver()->addPath($path);
        }

        return $this->renderer;
    }

}