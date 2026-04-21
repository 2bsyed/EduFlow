<?php
/**
 * EduFlow — Router
 * Dispatches ?route= parameter to the correct Controller@method.
 */
class Router
{
    private array $routes;

    public function __construct(array $routes)
    {
        $this->routes = $routes;
    }

    public function dispatch(): void
    {
        $route  = trim($_GET['route'] ?? '', '/');
        $method = $_SERVER['REQUEST_METHOD'];

        // POST form override via _method field
        if ($method === 'POST' && isset($_POST['_method'])) {
            $method = strtoupper($_POST['_method']);
        }

        if (!array_key_exists($route, $this->routes)) {
            $this->notFound();
            return;
        }

        [$controllerClass, $action, $allowedMethods] = $this->routes[$route];

        if (!in_array($method, $allowedMethods, true)) {
            $this->methodNotAllowed();
            return;
        }

        if (!class_exists($controllerClass)) {
            error_log("[EduFlow Router] Controller not found: $controllerClass");
            $this->serverError();
            return;
        }

        $controller = new $controllerClass();

        if (!method_exists($controller, $action)) {
            error_log("[EduFlow Router] Action not found: $controllerClass::$action");
            $this->serverError();
            return;
        }

        $controller->$action();
    }

    private function notFound(): void
    {
        http_response_code(404);
        echo '<h1>404 — Page not found</h1>';
    }

    private function methodNotAllowed(): void
    {
        http_response_code(405);
        echo '<h1>405 — Method not allowed</h1>';
    }

    private function serverError(): void
    {
        http_response_code(500);
        echo '<h1>500 — Internal server error</h1>';
    }
}
