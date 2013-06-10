<?php

namespace JzForm\Render\Html;

use Zend\Form\FormInterface;
use Zend\Form\FieldsetInterface;
use Zend\Form\ElementInterface;

class Form extends RenderAbstract {

    protected $templatePath;
    protected $templateElement = 'element.phtml';

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
        $collectionHelper = new Collection($this->getRenderer());
        return $collectionHelper->render($element);
    }

    public function renderElement(ElementInterface $element) {
        $formRow = $this->getRenderer()->plugin('formRow');
        $formRow->setPartial($this->templateElement);

        $html = $formRow->render($element);
        return $html;
    }

}