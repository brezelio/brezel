<?php

declare(strict_types=1);

$cfg['blowfish_secret'] = getenv('PMA_BLOWFISH_SECRET') ?: 'brezel-local-phpmyadmin-secret';

$i = 0;
$i++;

$cfg['Servers'][$i]['auth_type'] = 'config';
$cfg['Servers'][$i]['host'] = getenv('PMA_HOST') ?: 'mariadb';
$cfg['Servers'][$i]['port'] = (int) (getenv('PMA_PORT') ?: '2042');
$cfg['Servers'][$i]['compress'] = false;
$cfg['Servers'][$i]['AllowNoPassword'] = false;
$cfg['Servers'][$i]['user'] = getenv('PMA_USER') ?: 'brezel';
$cfg['Servers'][$i]['password'] = getenv('PMA_PASSWORD') ?: 'secret';
