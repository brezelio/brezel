<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Brezel;

$brezel = new Brezel();
$brezel->setBasePath(realpath(__DIR__ . '/..'));
return $brezel;
