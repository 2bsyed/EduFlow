<?php
/**
 * EduFlow — Base Model
 * PDO wrapper. All queries use prepared statements.
 * Every concrete model MUST filter by institute_id.
 */
abstract class Model
{
    protected PDO $db;
    protected string $table = '';

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    // -------------------------------------------------------
    // Generic CRUD helpers
    // -------------------------------------------------------

    /**
     * Execute a prepared statement and return all rows.
     */
    protected function query(string $sql, array $params = []): array
    {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Execute and return a single row.
     */
    protected function queryOne(string $sql, array $params = []): ?array
    {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Execute and return a single scalar value.
     */
    protected function queryScalar(string $sql, array $params = [])
    {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchColumn();
    }

    /**
     * Execute an INSERT and return the new row's ID.
     */
    protected function insert(string $sql, array $params = []): int
    {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$this->db->lastInsertId();
    }

    /**
     * Execute UPDATE/DELETE and return affected rows.
     */
    protected function execute(string $sql, array $params = []): int
    {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    // -------------------------------------------------------
    // Timestamp helper
    // -------------------------------------------------------

    protected function now(): string
    {
        return date('Y-m-d H:i:s');
    }

    // -------------------------------------------------------
    // Pagination helper
    // -------------------------------------------------------

    protected function paginate(
        string $sql,
        array $params,
        int $page,
        int $perPage = 15
    ): array {
        $offset    = ($page - 1) * $perPage;
        $countSql  = 'SELECT COUNT(*) FROM (' . $sql . ') AS _count_query';
        $total     = (int)$this->queryScalar($countSql, $params);
        $totalPages = (int)ceil($total / $perPage);

        $rows = $this->query($sql . " LIMIT $perPage OFFSET $offset", $params);

        return [
            'data'        => $rows,
            'total'       => $total,
            'per_page'    => $perPage,
            'current_page'=> $page,
            'total_pages' => $totalPages,
        ];
    }
}
