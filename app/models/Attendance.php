<?php
class Attendance extends Model
{
    protected string $table = 'attendance';

    public function getByBatchAndDate(int $batchId, string $date, int $instituteId): array
    {
        return $this->query(
            "SELECT a.*, s.full_name AS student_name, s.roll_no
             FROM attendance a
             JOIN students s ON a.student_id = s.id
             WHERE a.batch_id = ? AND a.date = ? AND a.institute_id = ?
             ORDER BY s.full_name",
            [$batchId, $date, $instituteId]
        );
    }

    /**
     * Upsert attendance record (mark or update)
     */
    public function markOrUpdate(
        int    $studentId,
        int    $batchId,
        string $date,
        string $status,
        int    $markedBy,
        int    $instituteId
    ): bool {
        $affected = $this->execute(
            "INSERT INTO attendance (institute_id, student_id, batch_id, date, status, marked_by)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by)",
            [$instituteId, $studentId, $batchId, $date, $status, $markedBy]
        );
        return $affected >= 0;
    }

    public function getStudentWithStatus(int $batchId, string $date, int $instituteId): array
    {
        return $this->query(
            "SELECT s.id AS student_id, s.full_name, s.roll_no,
                    COALESCE(a.status, 'not_marked') AS attendance_status
             FROM students s
             JOIN student_batches sb ON s.id = sb.student_id
             LEFT JOIN attendance a
               ON a.student_id = s.id AND a.batch_id = ? AND a.date = ? AND a.institute_id = ?
             WHERE sb.batch_id = ? AND s.institute_id = ? AND s.status = 'active'
             ORDER BY s.full_name",
            [$batchId, $date, $instituteId, $batchId, $instituteId]
        );
    }

    public function getSummaryByDate(int $batchId, string $date, int $instituteId): array
    {
        $rows = $this->query(
            "SELECT status, COUNT(*) AS cnt
             FROM attendance
             WHERE batch_id = ? AND date = ? AND institute_id = ?
             GROUP BY status",
            [$batchId, $date, $instituteId]
        );

        $summary = ['present' => 0, 'absent' => 0, 'late' => 0, 'total' => 0];
        foreach ($rows as $row) {
            $summary[$row['status']] = (int)$row['cnt'];
        }
        // total enrolled in batch
        $summary['total'] = (int)$this->queryScalar(
            "SELECT COUNT(*) FROM students s 
             JOIN student_batches sb ON s.id = sb.student_id 
             WHERE sb.batch_id = ? AND s.institute_id = ? AND s.status = 'active'",
            [$batchId, $instituteId]
        );
        return $summary;
    }

    public function getAverageAttendance(int $instituteId): float
    {
        $result = $this->queryOne(
            "SELECT
                SUM(status = 'present') AS present,
                COUNT(*) AS total
             FROM attendance
             WHERE institute_id = ?",
            [$instituteId]
        );
        if (!$result || (int)$result['total'] === 0) return 0.0;
        return round(($result['present'] / $result['total']) * 100, 1);
    }

    public function getMonthlyTrend(int $instituteId, int $months = 6): array
    {
        return $this->query(
            "SELECT
                DATE_FORMAT(date, '%b') AS month,
                DATE_FORMAT(date, '%Y-%m') AS ym,
                ROUND(SUM(status='present') / COUNT(*) * 100, 1) AS pct
             FROM attendance
             WHERE institute_id = ?
               AND date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
             GROUP BY DATE_FORMAT(date, '%Y-%m')
             ORDER BY ym ASC",
            [$instituteId, $months]
        );
    }

    public function getStudentHistory(int $studentId, int $instituteId, int $page = 1, int $perPage = 15): array
    {
        $sql = "SELECT a.*, b.name AS batch_name, b.subject 
                FROM attendance a
                JOIN batches b ON a.batch_id = b.id
                WHERE a.student_id = ? AND a.institute_id = ?
                ORDER BY a.date DESC";
        return $this->paginate($sql, [$studentId, $instituteId], $page, $perPage);
    }
}
