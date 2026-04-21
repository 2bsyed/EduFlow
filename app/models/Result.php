<?php
class Result extends Model
{
    protected string $table = 'results';

    private function baseQuery(): string
    {
        return "SELECT r.*, s.full_name AS student_name, s.roll_no,
                       b.name AS batch_name, b.subject AS batch_subject
                FROM results r
                JOIN students s ON r.student_id = s.id
                JOIN batches  b ON r.batch_id  = b.id";
    }

    public function getAllPaginated(int $instituteId, array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $params = [$instituteId];
        $where  = ["r.institute_id = ?"];

        if (!empty($filters['batch_id'])) {
            $where[]  = "r.batch_id = ?";
            $params[] = (int)$filters['batch_id'];
        }

        if (!empty($filters['student_id'])) {
            $where[]  = "r.student_id = ?";
            $params[] = (int)$filters['student_id'];
        }

        if (!empty($filters['teacher_id'])) {
            $where[]  = "b.teacher_id = ?";
            $params[] = (int)$filters['teacher_id'];
        }

        if (!empty($filters['search'])) {
            $where[]  = "(s.full_name LIKE ? OR s.roll_no LIKE ?)";
            $term     = '%' . $filters['search'] . '%';
            $params[] = $term;
            $params[] = $term;
        }

        $sql = $this->baseQuery() . " WHERE " . implode(' AND ', $where) . " ORDER BY r.exam_date DESC";
        return $this->paginate($sql, $params, $page, $perPage);
    }

    public function getByStudent(int $studentId, int $instituteId): array
    {
        return $this->query(
            $this->baseQuery() . " WHERE r.student_id = ? AND r.institute_id = ? ORDER BY r.exam_date DESC",
            [$studentId, $instituteId]
        );
    }

    public function create(array $data): int
    {
        $grade = $this->calculateGrade(
            (float)$data['marks_obtained'],
            (float)$data['marks_total']
        );

        return $this->insert(
            "INSERT INTO results
             (institute_id, student_id, batch_id, subject, exam_name,
              marks_obtained, marks_total, grade, remarks, exam_date, entered_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $data['institute_id'],
                $data['student_id'],
                $data['batch_id'],
                $data['subject'],
                $data['exam_name'] ?? 'Unit Test',
                $data['marks_obtained'],
                $data['marks_total'],
                $grade,
                $data['remarks'] ?? '',
                $data['exam_date'],
                $data['entered_by'],
            ]
        );
    }

    public function delete(int $id, int $instituteId): bool
    {
        return $this->execute(
            "DELETE FROM results WHERE id = ? AND institute_id = ?",
            [$id, $instituteId]
        ) > 0;
    }

    public function findById(int $id, int $instituteId): ?array
    {
        return $this->queryOne(
            $this->baseQuery() . " WHERE r.id = ? AND r.institute_id = ?",
            [$id, $instituteId]
        );
    }

    public function updateRecord(int $id, array $data, int $instituteId): bool
    {
        $grade = $this->calculateGrade(
            (float)$data['marks_obtained'],
            (float)$data['marks_total']
        );

        return $this->execute(
            "UPDATE results SET 
                subject = ?, 
                exam_name = ?, 
                marks_obtained = ?, 
                marks_total = ?, 
                grade = ?, 
                exam_date = ? 
             WHERE id = ? AND institute_id = ?",
            [
                $data['subject'],
                $data['exam_name'],
                $data['marks_obtained'],
                $data['marks_total'],
                $grade,
                $data['exam_date'],
                $id,
                $instituteId
            ]
        ) > 0;
    }

    public function getTopPerformers(int $instituteId, int $limit = 5): array
    {
        return $this->query(
            "SELECT s.full_name, s.roll_no,
                    ROUND(AVG(r.marks_obtained / r.marks_total * 100), 1) AS avg_pct
             FROM results r
             JOIN students s ON r.student_id = s.id
             WHERE r.institute_id = ?
             GROUP BY r.student_id
             ORDER BY avg_pct DESC LIMIT ?",
            [$instituteId, $limit]
        );
    }

    public function getAverageByBatch(int $instituteId): array
    {
        return $this->query(
            "SELECT b.name AS batch_name,
                    ROUND(AVG(r.marks_obtained / r.marks_total * 100), 1) AS avg_pct
             FROM results r
             JOIN batches b ON r.batch_id = b.id
             WHERE r.institute_id = ?
             GROUP BY r.batch_id
             ORDER BY avg_pct DESC",
            [$instituteId]
        );
    }

    private function calculateGrade(float $obtained, float $total): string
    {
        if ($total == 0) return 'N/A';
        $pct = ($obtained / $total) * 100;
        if ($pct >= 90) return 'A+';
        if ($pct >= 80) return 'A';
        if ($pct >= 70) return 'B+';
        if ($pct >= 60) return 'B';
        if ($pct >= 50) return 'C';
        if ($pct >= 40) return 'D';
        return 'F';
    }
}
