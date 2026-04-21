<?php
class Fee extends Model
{
    protected string $table = 'fees';

    private function baseQuery(): string
    {
        return "SELECT f.*, s.full_name AS student_name, s.roll_no,
                       b.name AS batch_name, b.subject AS batch_subject
                FROM fees f
                JOIN students s ON f.student_id = s.id
                LEFT JOIN batches b ON f.batch_id = b.id";
    }

    public function getAllPaginated(int $instituteId, array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $params = [$instituteId];
        $where  = ["f.institute_id = ?"];

        if (!empty($filters['status'])) {
            $where[]  = "f.status = ?";
            $params[] = $filters['status'];
        }

        if (!empty($filters['student_id'])) {
            $where[]  = "f.student_id = ?";
            $params[] = (int)$filters['student_id'];
        }

        if (!empty($filters['search'])) {
            $where[]  = "(s.full_name LIKE ? OR s.roll_no LIKE ?)";
            $term     = '%' . $filters['search'] . '%';
            $params[] = $term;
            $params[] = $term;
        }

        $sql = $this->baseQuery() . " WHERE " . implode(' AND ', $where) . " ORDER BY f.due_date DESC";
        return $this->paginate($sql, $params, $page, $perPage);
    }

    public function findById(int $id, int $instituteId): ?array
    {
        return $this->queryOne(
            $this->baseQuery() . " WHERE f.id = ? AND f.institute_id = ?",
            [$id, $instituteId]
        );
    }

    public function getTotalRevenue(int $instituteId, int $studentId = 0): float
    {
        $sql = "SELECT COALESCE(SUM(paid_amount), 0) FROM fees WHERE institute_id = ? AND status = 'paid'";
        $params = [$instituteId];
        if ($studentId > 0) {
            $sql .= " AND student_id = ?";
            $params[] = $studentId;
        }
        return (float)$this->queryScalar($sql, $params);
    }

    public function getTotalPending(int $instituteId, int $studentId = 0): float
    {
        $sql = "SELECT COALESCE(SUM(amount - paid_amount), 0) FROM fees WHERE institute_id = ? AND status IN ('due','overdue','partial')";
        $params = [$instituteId];
        if ($studentId > 0) {
            $sql .= " AND student_id = ?";
            $params[] = $studentId;
        }
        return (float)$this->queryScalar($sql, $params);
    }

    public function getMonthlyRevenue(int $instituteId, int $months = 6): array
    {
        return $this->query(
            "SELECT DATE_FORMAT(paid_date, '%b') AS month,
                    DATE_FORMAT(paid_date, '%Y-%m') AS ym,
                    SUM(paid_amount) AS revenue
             FROM fees
             WHERE institute_id = ? AND status = 'paid'
               AND paid_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
             GROUP BY DATE_FORMAT(paid_date, '%Y-%m')
             ORDER BY ym ASC",
            [$instituteId, $months]
        );
    }

    public function markAsPaid(int $id, int $instituteId, float $amount, string $mode): bool
    {
        $receiptNo = 'REC-' . strtoupper(uniqid());
        return $this->execute(
            "UPDATE fees SET status = 'paid', paid_amount = ?, paid_date = CURDATE(),
             payment_mode = ?, receipt_no = ? WHERE id = ? AND institute_id = ?",
            [$amount, $mode, $receiptNo, $id, $instituteId]
        ) > 0;
    }

    public function create(array $data): int
    {
        return $this->insert(
            "INSERT INTO fees (institute_id, student_id, batch_id, amount, due_date, status, created_by)
             VALUES (?, ?, ?, ?, ?, 'due', ?)",
            [
                $data['institute_id'],
                $data['student_id'],
                $data['batch_id'] ?: null,
                $data['amount'],
                $data['due_date'],
                $data['created_by'],
            ]
        );
    }

    public function getStatusSummary(int $instituteId, int $studentId = 0): array
    {
        $sql = "SELECT status, COUNT(*) AS cnt, COALESCE(SUM(amount), 0) AS total_amount
                FROM fees WHERE institute_id = ?";
        $params = [$instituteId];
        
        if ($studentId > 0) {
            $sql .= " AND student_id = ?";
            $params[] = $studentId;
        }
        
        $sql .= " GROUP BY status";
        
        $rows = $this->query($sql, $params);
        $summary = [];
        foreach ($rows as $row) {
            $summary[$row['status']] = $row;
        }
        return $summary;
    }
}
