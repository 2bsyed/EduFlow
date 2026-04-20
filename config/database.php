<?php
/**
 * EduFlow — Database Configuration
 * Uses PDO with prepared statements only.
 * No credentials hardcoded — define via constants or environment.
 */

define('DB_HOST',    getenv('DB_HOST')    ?: 'localhost');
define('DB_NAME',    getenv('DB_NAME')    ?: 'eduflow_db');
define('DB_USER',    getenv('DB_USER')    ?: 'root');
define('DB_PASS',    getenv('DB_PASS')    ?: '');
define('DB_CHARSET', 'utf8mb4');

define('APP_NAME',     'EduFlow');
define('APP_URL',      'http://localhost/eduflow');
define('APP_CURRENCY', '৳ ');
define('APP_TIMEZONE', 'Asia/Kolkata');

date_default_timezone_set(APP_TIMEZONE);

class Database
{
    private static ?PDO $instance = null;

    private function __construct() {}
    private function __clone() {}

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;dbname=%s;charset=%s',
                DB_HOST,
                DB_NAME,
                DB_CHARSET
            );

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
            ];

            try {
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                // Log error — never expose credentials in output
                error_log('[EduFlow DB Error] ' . $e->getMessage());
                http_response_code(500);
                die(json_encode([
                    'error' => 'Database connection failed. Please check configuration.'
                ]));
            }
        }

        return self::$instance;
    }
}
