<?php
/**
 * EduFlow — Base Controller
 * Provides render, redirect, CSRF, JSON helpers.
 */
abstract class Controller
{
    // -------------------------------------------------------
    // View rendering
    // -------------------------------------------------------

    /**
     * Render a view file within the master layout.
     * $data keys become local variables in the view.
     */
    protected function render(string $view, array $data = [], bool $useLayout = true): void
    {
        extract($data, EXTR_SKIP);

        $viewFile = APP_PATH . '/views/' . $view . '.php';

        if (!file_exists($viewFile)) {
            error_log("[EduFlow] View not found: $viewFile");
            http_response_code(500);
            echo '<h1>View not found: ' . htmlspecialchars($view) . '</h1>';
            return;
        }

        if ($useLayout) {
            $content = $viewFile; // path passed to layout
            require_once APP_PATH . '/views/layout/layout.php';
        } else {
            require $viewFile;
        }
    }

    /**
     * Output JSON and terminate. Used for AJAX endpoints.
     */
    protected function json(array $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    // -------------------------------------------------------
    // Redirects
    // -------------------------------------------------------

    protected function redirect(string $route): void
    {
        $url = APP_URL . '/index.php' . ($route ? '?route=' . $route : '');
        header('Location: ' . $url);
        exit;
    }

    protected function redirectBack(): void
    {
        $ref = $_SERVER['HTTP_REFERER'] ?? APP_URL . '/index.php?route=dashboard';
        header('Location: ' . $ref);
        exit;
    }

    // -------------------------------------------------------
    // CSRF Protection
    // -------------------------------------------------------

    protected function generateCsrfToken(): string
    {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    protected function validateCsrf(): void
    {
        $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        if (!hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
            http_response_code(403);
            die(json_encode(['error' => 'CSRF validation failed']));
        }
    }

    // -------------------------------------------------------
    // Input helpers
    // -------------------------------------------------------

    protected function input(string $key, string $default = ''): string
    {
        return htmlspecialchars(trim($_POST[$key] ?? $_GET[$key] ?? $default), ENT_QUOTES, 'UTF-8');
    }

    protected function inputRaw(string $key, $default = null)
    {
        return $_POST[$key] ?? $_GET[$key] ?? $default;
    }

    protected function isAjax(): bool
    {
        return (
            (isset($_SERVER['HTTP_X_REQUESTED_WITH']) &&
             strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') ||
            (isset($_SERVER['HTTP_ACCEPT']) &&
             str_contains($_SERVER['HTTP_ACCEPT'], 'application/json'))
        );
    }

    // -------------------------------------------------------
    // Session flash messages
    // -------------------------------------------------------

    protected function flash(string $type, string $message): void
    {
        $_SESSION['flash'][$type] = $message;
    }

    protected function getFlash(): array
    {
        $flash = $_SESSION['flash'] ?? [];
        unset($_SESSION['flash']);
        return $flash;
    }

    // -------------------------------------------------------
    // Auth shortcuts
    // -------------------------------------------------------

    protected function auth(): ?array
    {
        return $_SESSION['user'] ?? null;
    }

    protected function instituteId(): int
    {
        return (int)($_SESSION['user']['institute_id'] ?? 0);
    }
}
