<?php
class Expense extends Model
{
    protected string $table = 'expenses';

    private function baseQuery(): string
    {
        return "SELECT e.*, u.name AS teacher_name
                FROM expenses e
                LEFT JOIN users u ON e.teacher_id = u.id";
    }

    public function getAllPaginated(int $instituteId, array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $params = [$instituteId];
        $where  = ["e.institute_id = ?"];

        if (!empty($filters['category'])) {
            $where[]  = "e.category = ?";
            $params[] = $filters['category'];
        }

        if (!empty($filters['status'])) {
            $where[]  = "e.status = ?";
            $params[] = $filters['status'];
        }

        if (!empty($filters['search'])) {
            $where[]  = "(e.title LIKE ? OR e.description LIKE ?)";
            $term     = '%' . $filters['search'] . '%';
            $params[] = $term;
            $params[] = $term;
        }

        $sql = $this->baseQuery() . " WHERE " . implode(' AND ', $where) . " ORDER BY e.due_date DESC";

        return $this->paginate($sql, $params, $page, $perPage);
    }

    public function findById(int $id, int $instituteId): ?array
    {
        return $this->queryOne(
            $this->baseQuery() . " WHERE e.id = ? AND e.institute_id = ?",
            [$id, $instituteId]
        );
    }

    public function create(array $data): int
    {
        return $this->insert(
            "INSERT INTO expenses
             (institute_id, category, title, description, amount, teacher_id,
              due_date, payment_date, is_recurring, recurring_interval, next_due_date,
              payment_mode, reference_no, status, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $data['institute_id'],
                $data['category'],
                $data['title'],
                $data['description'] ?? '',
                $data['amount'],
                $data['teacher_id'] ?: null,
                $data['due_date'],
                $data['payment_date'] ?: null,
                $data['is_recurring'] ?? 0,
                $data['recurring_interval'] ?: null,
                $data['next_due_date'] ?: null,
                $data['payment_mode'] ?: null,
                $data['reference_no'] ?? '',
                $data['status'] ?? 'pending',
                $data['created_by'] ?? null,
            ]
        );
    }

    public function update(int $id, int $instituteId, array $data): bool
    {
        return $this->execute(
            "UPDATE expenses SET
             category = ?, title = ?, description = ?, amount = ?, teacher_id = ?,
             due_date = ?, payment_date = ?, is_recurring = ?, recurring_interval = ?,
             next_due_date = ?, payment_mode = ?, reference_no = ?, status = ?
             WHERE id = ? AND institute_id = ?",
            [
                $data['category'],
                $data['title'],
                $data['description'] ?? '',
                $data['amount'],
                $data['teacher_id'] ?: null,
                $data['due_date'],
                $data['payment_date'] ?: null,
                $data['is_recurring'] ?? 0,
                $data['recurring_interval'] ?: null,
                $data['next_due_date'] ?: null,
                $data['payment_mode'] ?: null,
                $data['reference_no'] ?? '',
                $data['status'] ?? 'pending',
                $id,
                $instituteId,
            ]
        ) > 0;
    }

    public function delete(int $id, int $instituteId): bool
    {
        return $this->execute(
            "DELETE FROM expenses WHERE id = ? AND institute_id = ?",
            [$id, $instituteId]
        ) > 0;
    }

    // ── Summary methods ────────────────────────────────────────

    public function getSummary(int $instituteId): array
    {
        $row = $this->queryOne(
            "SELECT
                COALESCE(SUM(amount), 0) AS total_expenses,
                COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS total_paid,
                COALESCE(SUM(CASE WHEN status IN ('pending','overdue') THEN amount ELSE 0 END), 0) AS total_pending,
                COUNT(CASE WHEN status = 'overdue' THEN 1 END) AS overdue_count
             FROM expenses WHERE institute_id = ?",
            [$instituteId]
        );
        return $row ?: ['total_expenses' => 0, 'total_paid' => 0, 'total_pending' => 0, 'overdue_count' => 0];
    }

    public function getMonthlyTotal(int $instituteId): float
    {
        return (float)$this->queryScalar(
            "SELECT COALESCE(SUM(amount), 0) FROM expenses
             WHERE institute_id = ? AND MONTH(due_date) = MONTH(CURDATE()) AND YEAR(due_date) = YEAR(CURDATE())",
            [$instituteId]
        );
    }

    public function getSalaryByTeacher(int $instituteId): array
    {
        return $this->query(
            "SELECT u.id AS teacher_id, u.name AS teacher_name,
                    COALESCE(SUM(e.amount), 0) AS total_salary,
                    COALESCE(SUM(CASE WHEN e.status = 'paid' THEN e.amount ELSE 0 END), 0) AS paid_salary,
                    COALESCE(SUM(CASE WHEN e.status IN ('pending','overdue') THEN e.amount ELSE 0 END), 0) AS pending_salary,
                    MAX(CASE WHEN e.status = 'paid' THEN e.payment_date END) AS last_paid_date
             FROM users u
             LEFT JOIN expenses e ON e.teacher_id = u.id AND e.category = 'teacher_salary' AND e.institute_id = ?
             WHERE u.institute_id = ? AND u.role = 'teacher' AND u.status = 'active'
             GROUP BY u.id, u.name
             ORDER BY u.name",
            [$instituteId, $instituteId]
        );
    }

    public function getRecurringDue(int $instituteId): array
    {
        return $this->query(
            $this->baseQuery() . " WHERE e.institute_id = ? AND e.is_recurring = 1
             AND e.status IN ('pending','overdue')
             ORDER BY e.due_date ASC",
            [$instituteId]
        );
    }

    public function getCategoryBreakdown(int $instituteId): array
    {
        return $this->query(
            "SELECT category,
                    COUNT(*) AS count,
                    COALESCE(SUM(amount), 0) AS total
             FROM expenses WHERE institute_id = ?
             GROUP BY category ORDER BY total DESC",
            [$instituteId]
        );
    }

    /**
     * Renew a recurring expense: mark current as paid, create next cycle
     */
    public function renewRecurring(int $id, int $instituteId, string $paymentMode, string $referenceNo): ?int
    {
        $expense = $this->findById($id, $instituteId);
        if (!$expense || !$expense['is_recurring']) return null;

        // Mark current as paid
        $this->execute(
            "UPDATE expenses SET status = 'paid', payment_date = CURDATE(),
             payment_mode = ?, reference_no = ? WHERE id = ? AND institute_id = ?",
            [$paymentMode, $referenceNo, $id, $instituteId]
        );

        // Calculate next due date
        $interval = $expense['recurring_interval'];
        $currentDue = $expense['due_date'];
        switch ($interval) {
            case 'monthly':   $nextDue = date('Y-m-d', strtotime($currentDue . ' +1 month')); break;
            case 'quarterly': $nextDue = date('Y-m-d', strtotime($currentDue . ' +3 months')); break;
            case 'yearly':    $nextDue = date('Y-m-d', strtotime($currentDue . ' +1 year')); break;
            default:          $nextDue = date('Y-m-d', strtotime($currentDue . ' +1 month'));
        }

        // Create next cycle
        return $this->create([
            'institute_id'       => $instituteId,
            'category'           => $expense['category'],
            'title'              => $expense['title'],
            'description'        => $expense['description'],
            'amount'             => $expense['amount'],
            'teacher_id'         => $expense['teacher_id'],
            'due_date'           => $nextDue,
            'is_recurring'       => 1,
            'recurring_interval' => $interval,
            'status'             => 'pending',
            'created_by'         => $expense['created_by'],
        ]);
    }
}
