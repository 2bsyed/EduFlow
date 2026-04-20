<?php
/**
 * EduFlow — Front Controller
 * All requests routed through here.
 */

define('ROOT_PATH', __DIR__);
define('APP_PATH',  ROOT_PATH . '/app');

// Autoload core framework + config
require_once ROOT_PATH . '/config/database.php';
require_once APP_PATH  . '/core/Model.php';
require_once APP_PATH  . '/core/Controller.php';
require_once APP_PATH  . '/core/Middleware.php';
require_once APP_PATH  . '/core/Router.php';

// Start session securely
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => false, // set true in production HTTPS
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

// Autoload all Models
foreach (glob(APP_PATH . '/models/*.php') as $model) {
    require_once $model;
}

// Autoload all Controllers
foreach (glob(APP_PATH . '/controllers/*.php') as $controller) {
    require_once $controller;
}

// Load routes and dispatch
require_once ROOT_PATH . '/routes/web.php';

$router = new Router($routes);
$router->dispatch();
