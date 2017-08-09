<?php

namespace commot\components;

/**
 * Class Help
 * @package frontend\components
 */
class Help
{
    /**
     * Shielding the transmitted data
     * @param mixed
     * @return string
     */
    public static function shieldingData($data)
    {
        if ($data === null) {
            return null;
        }
        $data = strip_tags($data);
        $data = htmlentities($data, ENT_QUOTES, "UTF-8");
        $data = htmlspecialchars($data, ENT_QUOTES);
        $data = trim($data);

        return $data;
    }

}
