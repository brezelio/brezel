<?php

require_once __DIR__ . '/../vendor/autoload.php';

use App\Brezel;

$brezel = new Brezel();
$brezel->setBasePath(realpath('..'));
$brezel->handle();
