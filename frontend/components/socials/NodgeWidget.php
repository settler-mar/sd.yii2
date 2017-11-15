<?php
/**
 * Widget class file.
 *
 * @author Maxim Zemskov <nodge@yandex.ru>
 * @link http://github.com/Nodge/yii2-eauth/
 * @license http://www.opensource.org/licenses/bsd-license.php
 */

namespace frontend\components\socials;

use Yii;

/**
 * The EAuthWidget widget prints buttons to authenticate user with OpenID and OAuth providers.
 *
 * @package application.extensions.eauth
 */
class NodgeWidget extends \nodge\eauth\Widget
{

	public $vertical = false;
	public $action = '/socials/login';
	
	public function run()
	{
//		parent::run();
		echo $this->render('/widgets/socials', [
			'id' => $this->getId(),
			'services' => $this->services,
			'action' => $this->action,
			'popup' => $this->popup,
			'assetBundle' => $this->assetBundle,
			'vertical' => $this->vertical,
		]);
	}
}
