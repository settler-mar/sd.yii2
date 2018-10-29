<?php

namespace common\components;

use yii;
use DOMDocument;
use DOMElement;

class SdXmlResponseFormatter extends yii\web\XmlResponseFormatter
{
    public $rootAttributes = [];

    /**
     * @param $response
     */
    public function format($response)
    {
        $charset = $this->encoding === null ? $response->charset : $this->encoding;
        if (stripos($this->contentType, 'charset') === false) {
            $this->contentType .= '; charset=' . $charset;
        }
        $response->getHeaders()->set('Content-Type', $this->contentType);
        if ($response->data !== null) {
            $dom = new DOMDocument($this->version, $charset);
            if (!empty($this->rootTag)) {
                $root = new DOMElement($this->rootTag);
                $dom->appendChild($root);
                foreach ($this->rootAttributes as $key => $attribute) {
                    $root->setAttribute($key, $attribute);
                }
                $this->buildXml($root, $response->data);
            } else {
                $this->buildXml($dom, $response->data);
            }
            $response->content = $dom->saveXML();
        }
    }
}