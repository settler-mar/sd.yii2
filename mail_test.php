<?php

require_once 'vendor/autoload.php';

// Create the Transport
$transport = (new Swift_SmtpTransport('smtp-pulse.com', 465))
    ->setUsername('admin@secretdiscounter.com')
    ->setPassword('7J8jamL9TMtB')
    ->setEncryption("ssl")
;

// Create the Mailer using your created Transport
$mailer = new Swift_Mailer($transport);

// Create a message
$message = (new Swift_Message('Wonderful Subject'))
    ->setFrom(['admin@secretdiscounter.com'])
    ->setTo(['matuhinmax@mail.ru'])
    ->setBody('Here is the message itself')
;

// Send the message
$result = $mailer->send($message);