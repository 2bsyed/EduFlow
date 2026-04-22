<?php
class User extends Model
{
    protected string $table = 'users';

    public function findByUsername(string $username, int $instituteId): ?array
    {
        return $this->queryOne(
            "SELECT * FROM users WHERE username = ? AND institute_id = ? AND status = 'active'",
            [$username, $instituteId]
        );
    }

    public function findById(int $id, int $instituteId): ?array
    {
        return $this->queryOne(
            "SELECT id, institute_id, name, email, username, role, phone, status, created_at
             FROM users WHERE id = ? AND institute_id = ?",
            [$id, $instituteId]
        );
    }

    public function getTeachersByInstitute(int $instituteId): array
    {
        return $this->query(
            "SELECT id, name, email, username, phone, status, created_at FROM users
             WHERE institute_id = ? AND role = 'teacher' AND status != 'inactive'
             ORDER BY name",
            [$instituteId]
        );
    }
    
    public function getTeachersPaginated(int $instituteId, array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $params = [$instituteId, 'teacher'];
        $where  = ["institute_id = ?", "role = ?"];

        if (!empty($filters['search'])) {
            $where[]  = "(name LIKE ? OR username LIKE ? OR phone LIKE ?)";
            $term     = '%' . $filters['search'] . '%';
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql = "SELECT id, name, email, username, phone, status, created_at 
                FROM users WHERE " . implode(' AND ', $where) . " ORDER BY created_at DESC";
                
        return $this->paginate($sql, $params, $page, $perPage);
    }

    public function create(array $data): int
    {
        return $this->insert(
            "INSERT INTO users (institute_id, name, email, username, password_hash, role, phone, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'active')",
            [
                $data['institute_id'],
                $data['name'],
                empty($data['email']) ? null : $data['email'],
                $data['username'],
                password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]),
                $data['role'] ?? 'student',
                empty($data['phone']) ? null : $data['phone'],
            ]
        );
    }

    public function update(int $id, int $instituteId, array $data): bool
    {
        return $this->execute(
            "UPDATE users SET name = ?, email = ?, phone = ?, status = ?
             WHERE id = ? AND institute_id = ?",
            [
                $data['name'],
                empty($data['email']) ? null : $data['email'],
                empty($data['phone']) ? null : $data['phone'],
                $data['status'] ?? 'active',
                $id,
                $instituteId
            ]
        ) > 0;
    }

    public function softDelete(int $id, int $instituteId): bool
    {
        return $this->execute(
            "UPDATE users SET status = 'inactive' WHERE id = ? AND institute_id = ?",
            [$id, $instituteId]
        ) > 0;
    }

    public function destroy(int $id, int $instituteId): bool
    {
        // This is a hard delete. In MySQL without foreign keys, we'd need to manually clean up.
        // Wait, does the DB have foreign keys with CASCADE? Let's assume we clean up students manually.
        // Wait, the Student model should have a `destroyByUserId` method but doing it here is fine or in controller.
        return $this->execute(
            "DELETE FROM users WHERE id = ? AND institute_id = ?",
            [$id, $instituteId]
        ) > 0;
    }

    public function updateLastLogin(int $id): void
    {
        $this->execute(
            "UPDATE users SET last_login_at = NOW() WHERE id = ?",
            [$id]
        );
    }

    public function usernameExists(string $username, int $instituteId, int $excludeId = 0): bool
    {
        $count = (int)$this->queryScalar(
            "SELECT COUNT(*) FROM users
             WHERE username = ? AND institute_id = ? AND id != ?",
            [$username, $instituteId, $excludeId]
        );
        return $count > 0;
    }

    public function emailExists(string $email, int $instituteId, int $excludeId = 0): bool
    {
        if (empty($email)) return false;
        $count = (int)$this->queryScalar(
            "SELECT COUNT(*) FROM users
             WHERE email = ? AND institute_id = ? AND id != ?",
            [$email, $instituteId, $excludeId]
        );
        return $count > 0;
    }
    
    public function updateCredentials(int $id, string $username, ?string $newPasswordHash = null): bool
    {
        if ($newPasswordHash) {
            return $this->execute(
                "UPDATE users SET username = ?, password_hash = ? WHERE id = ?",
                [$username, $newPasswordHash, $id]
            ) > 0;
        } else {
            return $this->execute(
                "UPDATE users SET username = ? WHERE id = ?",
                [$username, $id]
            ) > 0;
        }
    }
}
