<?php

namespace console\jobs;

use yii\base\BaseObject;

class MailerJob extends BaseObject implements \yii\queue\JobInterface
{
  public $mailer;
  public $message;

  public function execute($queue)
  {
    //d('send mail...');
    $this->mailer->mast_send = true;
    $this->mailer->sendMessage($this->message);
  }
}