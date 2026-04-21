<?php
class Institute extends Model
{
    protected string $table = 'institutes';

    public function findById(int $id): ?array
    {
        return $this->queryOne("SELECT * FROM institutes WHERE id = ?", [$id]);
    }

    public function findBySubdomain(string $subdomain): ?array
    {
        return $this->queryOne(
            "SELECT * FROM institutes WHERE subdomain = ? AND status = 'active'",
            [$subdomain]
        );
    }

    public function updateLogo(int $id, string $logoPath): bool
    {
        return $this->execute(
            "UPDATE institutes SET logo_path = ? WHERE id = ?",
            [$logoPath, $id]
        ) > 0;
    }

    public function getFirst(): ?array
    {
        return $this->queryOne("SELECT * FROM institutes WHERE status = 'active' ORDER BY id ASC LIMIT 1");
    }

    public function create(array $data): int
    {
        return $this->insert(
            "INSERT INTO institutes (name, subdomain, plan, address, phone, status)
             VALUES (?, ?, ?, ?, ?, 'active')",
            [
                $data['name'],
                $data['subdomain'],
                $data['plan'] ?? 'starter',
                $data['address'] ?? '',
                $data['phone'] ?? '',
            ]
        );
    }
}
