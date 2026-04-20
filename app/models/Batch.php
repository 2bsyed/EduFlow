<?php
class Batch extends Model
{
    protected string $table = 'batches';

    private function baseQuery(): string
    {
        return "SELECT b.*, u.name AS teacher_name, u.email AS teacher_email,
                       COUNT(s.id) AS student_count
                FROM batches b
                LEFT JOIN users u ON b.teacher_id = u.id
                LEFT JOIN student_batches sb ON sb.batch_id = b.id
                LEFT JOIN students s ON sb.student_id = s.id AND s.status = 'active'";
    }

    public function getAll(int $instituteId, string $status = ''): array
    {
        $params = [$instituteId];
        $where  = "b.institute_id = ?";

        if ($status) {
            $where   .= " AND b.status = ?";
            $params[] = $status;
        }

        return $this->query(
            $this->baseQuery() . " WHERE $where GROUP BY b.id ORDER BY b.name",
            $params
        );
    }

    public function getAllPaginated(int $instituteId, array $filters = [], int $page = 1, int $perPage = 12): array
    {
        $params = [$instituteId];
        $where  = ["b.institute_id = ?"];

        if (!empty($filters['teacher_id'])) {
            $where[]  = "b.teacher_id = ?";
            $params[] = (int)$filters['teacher_id'];
        }

        $sql = $this->baseQuery()
            . " WHERE " . implode(' AND ', $where) . " GROUP BY b.id ORDER BY b.created_at DESC";
        return $this->paginate($sql, $params, $page, $perPage);
    }

    public function getByTeacher(int $instituteId, int $teacherId, string $status = ''): array
    {
        $params = [$instituteId, $teacherId];
        $where  = "b.institute_id = ? AND b.teacher_id = ?";

        if ($status) {
            $where   .= " AND b.status = ?";
            $params[] = $status;
        }

        return $this->query(
            $this->baseQuery() . " WHERE $where GROUP BY b.id ORDER BY b.name",
            $params
        );
    }

    public function findById(int $id, int $instituteId): ?array
    {
        return $this->queryOne(
            $this->baseQuery()
            . " WHERE b.id = ? AND b.institute_id = ? GROUP BY b.id",
            [$id, $instituteId]
        );
    }

    public function countActive(int $instituteId): int
    {
        return (int)$this->queryScalar(
            "SELECT COUNT(*) FROM batches WHERE institute_id = ? AND status = 'active'",
            [$instituteId]
        );
    }

    public function create(array $data): int
    {
        return $this->insert(
            "INSERT INTO batches
             (institute_id, name, subject, teacher_id, schedule, room,
              capacity, start_date, end_date, fee_amount, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')",
            [
                $data['institute_id'],
                $data['name'],
                $data['subject'],
                $data['teacher_id'] ?: null,
                $data['schedule'] ?? '',
                $data['room'] ?? '',
                $data['capacity'] ?? 30,
                $data['start_date'] ?: null,
                $data['end_date'] ?: null,
                $data['fee_amount'] ?? 0,
            ]
        );
    }

    public function update(int $id, int $instituteId, array $data): bool
    {
        return $this->execute(
            "UPDATE batches SET
             name = ?, subject = ?, teacher_id = ?, schedule = ?, room = ?,
             capacity = ?, start_date = ?, end_date = ?, fee_amount = ?, status = ?
             WHERE id = ? AND institute_id = ?",
            [
                $data['name'],
                $data['subject'],
                $data['teacher_id'] ?: null,
                $data['schedule'] ?? '',
                $data['room'] ?? '',
                $data['capacity'] ?? 30,
                $data['start_date'] ?: null,
                $data['end_date'] ?: null,
                $data['fee_amount'] ?? 0,
                $data['status'] ?? 'active',
                $id,
                $instituteId,
            ]
        ) > 0;
    }

    public function delete(int $id, int $instituteId): bool
    {
        // Soft delete — mark cancelled
        return $this->execute(
            "UPDATE batches SET status = 'cancelled' WHERE id = ? AND institute_id = ?",
            [$id, $instituteId]
        ) > 0;
    }
}
