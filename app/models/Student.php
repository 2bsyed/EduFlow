<?php
class Student extends Model
{
    protected string $table = 'students';

    // Base query with batch join using GROUP_CONCAT
    private function baseQuery(): string
    {
        return "SELECT s.*, 
                GROUP_CONCAT(b.name SEPARATOR ', ') AS batch_name, 
                GROUP_CONCAT(b.subject SEPARATOR ', ') AS batch_subject,
                GROUP_CONCAT(b.id SEPARATOR ',') AS batch_ids
                FROM students s
                LEFT JOIN student_batches sb ON s.id = sb.student_id
                LEFT JOIN batches b ON sb.batch_id = b.id";
    }

    public function getAllPaginated(int $instituteId, array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $params = [$instituteId];
        $where  = ["s.institute_id = ?"];

        if (!empty($filters['batch_id'])) {
            $where[]  = "EXISTS (SELECT 1 FROM student_batches sb2 WHERE sb2.student_id = s.id AND sb2.batch_id = ?)";
            $params[] = (int)$filters['batch_id'];
        }

        if (!empty($filters['teacher_id'])) {
            $where[]  = "EXISTS (SELECT 1 FROM student_batches sb3 JOIN batches b3 ON sb3.batch_id = b3.id WHERE sb3.student_id = s.id AND b3.teacher_id = ?)";
            $params[] = (int)$filters['teacher_id'];
        }

        if (!empty($filters['status'])) {
            $where[]  = "s.status = ?";
            $params[] = $filters['status'];
        }

        if (!empty($filters['search'])) {
            $where[]  = "(s.full_name LIKE ? OR s.roll_no LIKE ? OR s.phone LIKE ?)";
            $term     = '%' . $filters['search'] . '%';
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql = $this->baseQuery() . " WHERE " . implode(' AND ', $where) . " GROUP BY s.id ORDER BY s.created_at DESC";

        return $this->paginate($sql, $params, $page, $perPage);
    }

    public function findById(int $id, int $instituteId): ?array
    {
        return $this->queryOne(
            $this->baseQuery() . " WHERE s.id = ? AND s.institute_id = ? GROUP BY s.id",
            [$id, $instituteId]
        );
    }

    public function findByUserId(int $userId, int $instituteId): ?array
    {
        return $this->queryOne(
            $this->baseQuery() . " WHERE s.user_id = ? AND s.institute_id = ? GROUP BY s.id",
            [$userId, $instituteId]
        );
    }

    public function countByInstitute(int $instituteId): int
    {
        return (int)$this->queryScalar(
            "SELECT COUNT(*) FROM students WHERE institute_id = ? AND status != 'archived'",
            [$instituteId]
        );
    }

    public function countNewThisMonth(int $instituteId): int
    {
        return (int)$this->queryScalar(
            "SELECT COUNT(*) FROM students
             WHERE institute_id = ? AND MONTH(enrolled_at) = MONTH(CURDATE())
             AND YEAR(enrolled_at) = YEAR(CURDATE()) AND status != 'archived'",
            [$instituteId]
        );
    }

    public function getByBatch(int $batchId, int $instituteId): array
    {
        return $this->query(
            "SELECT s.* FROM students s 
             JOIN student_batches sb ON s.id = sb.student_id 
             WHERE sb.batch_id = ? AND s.institute_id = ? AND s.status = 'active' 
             ORDER BY s.full_name",
            [$batchId, $instituteId]
        );
    }

    public function searchJson(int $instituteId, string $term): array
    {
        return $this->query(
            "SELECT s.id, s.roll_no, s.full_name, s.phone, s.status, 
                    GROUP_CONCAT(b.name SEPARATOR ', ') AS batch_name
             FROM students s 
             LEFT JOIN student_batches sb ON s.id = sb.student_id
             LEFT JOIN batches b ON sb.batch_id = b.id
             WHERE s.institute_id = ? AND (s.full_name LIKE ? OR s.roll_no LIKE ?)
             GROUP BY s.id
             ORDER BY s.full_name LIMIT 20",
            [$instituteId, "%$term%", "%$term%"]
        );
    }

    public function create(array $data): int
    {
        $id = $this->insert(
            "INSERT INTO students
             (institute_id, user_id, roll_no, full_name, email, phone,
              date_of_birth, guardian_name, guardian_phone, address, status, enrolled_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', CURDATE())",
            [
                $data['institute_id'],
                $data['user_id'] ?? null,
                $data['roll_no'],
                $data['full_name'],
                $data['email'] ?? '',
                $data['phone'] ?? '',
                $data['date_of_birth'] ?: null,
                $data['guardian_name'] ?? '',
                $data['guardian_phone'] ?? '',
                $data['address'] ?? '',
            ]
        );
        
        $this->syncBatches($data['institute_id'], $id, $data['batch_ids'] ?? []);
        return $id;
    }

    public function update(int $id, int $instituteId, array $data): bool
    {
        $res = $this->execute(
            "UPDATE students SET
             roll_no = ?, full_name = ?, email = ?, phone = ?,
             date_of_birth = ?, guardian_name = ?, guardian_phone = ?,
             address = ?, status = ?
             WHERE id = ? AND institute_id = ?",
            [
                $data['roll_no'],
                $data['full_name'],
                $data['email'] ?? '',
                $data['phone'] ?? '',
                $data['date_of_birth'] ?: null,
                $data['guardian_name'] ?? '',
                $data['guardian_phone'] ?? '',
                $data['address'] ?? '',
                $data['status'] ?? 'active',
                $id,
                $instituteId,
            ]
        ) > 0;
        
        if (isset($data['batch_ids'])) {
            $this->syncBatches($instituteId, $id, $data['batch_ids']);
        }
        
        return $res;
    }

    private function syncBatches(int $instituteId, int $studentId, array $batchIds): void
    {
        $this->execute("DELETE FROM student_batches WHERE institute_id = ? AND student_id = ?", [$instituteId, $studentId]);
        foreach ($batchIds as $bId) {
            if ($bId > 0) {
                $this->execute(
                    "INSERT IGNORE INTO student_batches (institute_id, student_id, batch_id) VALUES (?, ?, ?)",
                    [$instituteId, $studentId, (int)$bId]
                );
            }
        }
    }

    public function softDelete(int $id, int $instituteId): bool
    {
        return $this->execute(
            "UPDATE students SET status = 'archived' WHERE id = ? AND institute_id = ?",
            [$id, $instituteId]
        ) > 0;
    }

    public function destroy(int $id, int $instituteId): bool
    {
        return $this->execute(
            "DELETE FROM students WHERE id = ? AND institute_id = ?",
            [$id, $instituteId]
        ) > 0;
    }

    public function rollNoExists(string $rollNo, int $instituteId, int $excludeId = 0): bool
    {
        return (int)$this->queryScalar(
            "SELECT COUNT(*) FROM students WHERE roll_no = ? AND institute_id = ? AND id != ?",
            [$rollNo, $instituteId, $excludeId]
        ) > 0;
    }

    public function generateRollNo(int $instituteId): string
    {
        $last = $this->queryScalar(
            "SELECT roll_no FROM students WHERE institute_id = ? ORDER BY id DESC LIMIT 1",
            [$instituteId]
        );
        if ($last && preg_match('/(\d+)$/', $last, $m)) {
            return 'ED-' . str_pad((int)$m[1] + 1, 4, '0', STR_PAD_LEFT);
        }
        return 'ED-1001';
    }
}
