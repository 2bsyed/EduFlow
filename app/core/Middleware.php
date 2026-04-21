<?php
/**
 * EduFlow — Middleware
 * Provides role-based access guards.
 */
class Middleware
{
    /**
     * Require authenticated session.
     * Redirects to login if not authenticated.
     */
    public static function requireAuth(): void
    {
        if (empty($_SESSION['user'])) {
            $_SESSION['flash']['error'] = 'Please sign in to continue.';
            header('Location: ' . APP_URL . '/index.php?route=login');
            exit;
        }
    }

    /**
     * Require a specific role (or array of roles).
     * @param string|array $roles
     */
    public static function requireRole($roles): void
    {
        self::requireAuth();

        $roles    = (array)$roles;
        $userRole = $_SESSION['user']['role'] ?? '';

        if (!in_array($userRole, $roles, true)) {
            http_response_code(403);
            include APP_PATH . '/views/errors/403.php';
            exit;
        }
    }

    /**
     * Ensure the accessed resource belongs to the current institute.
     */
    public static function requireInstituteAccess(int $resourceInstituteId): void
    {
        self::requireAuth();

        $sessionInstituteId = (int)($_SESSION['user']['institute_id'] ?? 0);

        if ($sessionInstituteId !== $resourceInstituteId) {
            http_response_code(403);
            include APP_PATH . '/views/errors/403.php';
            exit;
        }
    }

    /**
     * Guard AJAX requests — return JSON error instead of redirect.
     */
    public static function requireAuthAjax(): void
    {
        if (empty($_SESSION['user'])) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Unauthenticated']);
            exit;
        }
    }

    /**
     * Guard AJAX requests by role.
     */
    public static function requireRoleAjax($roles): void
    {
        self::requireAuthAjax();

        $roles    = (array)$roles;
        $userRole = $_SESSION['user']['role'] ?? '';

        if (!in_array($userRole, $roles, true)) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Forbidden']);
            exit;
        }
    }
}
