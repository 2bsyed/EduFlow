<?php $pageTitle = 'Students'; $currentRoute = 'students'; ?>
<div class="p-10">

    <!-- Page Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
            <h2 class="text-4xl font-extrabold text-on-surface tracking-tight mb-1">Students</h2>
            <p class="text-on-surface-variant">
                Manage enrollments, fees, and performance across <?= count($batches) ?> active batches.
            </p>
        </div>
        <a href="<?= APP_URL ?>/index.php?route=students.create"
           class="btn-primary flex items-center gap-2 px-6 py-2.5">
            <span class="material-symbols-outlined text-lg">add</span>
            Add Student
        </a>
    </div>

    <!-- Filter Bar -->
    <div class="bg-surface-container-lowest rounded-xl p-5 flex flex-wrap gap-4 items-end mb-6 shadow-sm">
        <form method="GET" action="<?= APP_URL ?>/index.php" class="flex flex-wrap gap-4 items-end flex-1">
            <input type="hidden" name="route" value="students"/>

            <!-- Search -->
            <div class="flex-1 min-w-[220px]">
                <label class="filter-label">Search</label>
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
                    <input type="text" name="search" id="student-search"
                           class="filter-input pl-10"
                           placeholder="Name, roll no, phone..."
                           value="<?= htmlspecialchars($filters['search']) ?>"
                           autocomplete="off"/>
                </div>
            </div>

            <!-- Filter by Batch -->
            <div class="min-w-[180px]">
                <label class="filter-label">Batch</label>
                <select name="batch_id" class="filter-input">
                    <option value="">All Batches</option>
                    <?php foreach ($batches as $batch): ?>
                    <option value="<?= $batch['id'] ?>"
                            <?= ($filters['batch_id'] == $batch['id']) ? 'selected' : '' ?>>
                        <?= htmlspecialchars($batch['name']) ?>
                    </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <!-- Status filter -->
            <div>
                <label class="filter-label">Status</label>
                <div class="flex gap-2">
                    <?php foreach (['active' => 'Active', 'inactive' => 'Inactive', 'archived' => 'Archived'] as $val => $label): ?>
                    <button type="submit" name="status" value="<?= $val ?>"
                            class="status-btn <?= ($filters['status'] === $val) ? 'status-btn--active' : '' ?>">
                        <?= $label ?>
                    </button>
                    <?php endforeach; ?>
                </div>
            </div>
        </form>
    </div>

    <!-- Table -->
    <div class="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
        <table class="w-full text-left">
            <thead class="bg-surface-container-low sticky top-0 z-10">
                <tr>
                    <th class="table-th">Student</th>
                    <th class="table-th">Batch</th>
                    <th class="table-th">Phone</th>
                    <th class="table-th">Fees</th>
                    <th class="table-th">Status</th>
                    <th class="table-th text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/10">
                <?php if (empty($result['data'])): ?>
                <tr>
                    <td colspan="6" class="px-6 py-16 text-center">
                        <div class="flex flex-col items-center gap-3 text-on-surface-variant">
                            <span class="material-symbols-outlined text-5xl opacity-30">group</span>
                            <p class="text-sm font-medium">No students found.</p>
                            <a href="<?= APP_URL ?>/index.php?route=students.create"
                               class="text-primary text-sm font-bold hover:underline">Add your first student →</a>
                        </div>
                    </td>
                </tr>
                <?php else: ?>
                <?php foreach ($result['data'] as $student): ?>
                <tr class="table-row group">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="relative flex-shrink-0">
                                <div class="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm">
                                    <?= strtoupper(substr($student['full_name'], 0, 1)) ?>
                                </div>
                                <?php if ($student['status'] === 'active'): ?>
                                <div class="absolute -left-0.5 top-1 h-8 w-1 bg-secondary rounded-full"></div>
                                <?php endif; ?>
                            </div>
                            <div>
                                <p class="font-bold text-on-surface text-sm">
                                    <?= htmlspecialchars($student['full_name']) ?>
                                </p>
                                <p class="text-xs text-on-surface-variant">
                                    <?= htmlspecialchars($student['roll_no']) ?>
                                </p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-on-surface-variant">
                        <?= htmlspecialchars($student['batch_name'] ?? '—') ?>
                    </td>
                    <td class="px-6 py-4 text-sm text-on-surface-variant">
                        <?= htmlspecialchars($student['phone'] ?? '—') ?>
                    </td>
                    <td class="px-6 py-4">
                        <span class="status-badge status-badge--neutral">N/A</span>
                    </td>
                    <td class="px-6 py-4">
                        <?php if ($student['status'] === 'active'): ?>
                            <div class="flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                <span class="text-xs font-medium text-secondary">Active</span>
                            </div>
                        <?php elseif ($student['status'] === 'inactive'): ?>
                            <div class="flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 rounded-full bg-outline"></span>
                                <span class="text-xs font-medium text-on-surface-variant">Inactive</span>
                            </div>
                        <?php else: ?>
                            <div class="flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 rounded-full bg-error"></span>
                                <span class="text-xs font-medium text-error">Archived</span>
                            </div>
                        <?php endif; ?>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a href="<?= APP_URL ?>/index.php?route=students.edit&id=<?= $student['id'] ?>"
                               class="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                               title="Edit">
                                <span class="material-symbols-outlined text-lg">edit</span>
                            </a>
                            <form method="POST" action="<?= APP_URL ?>/index.php?route=students.delete" class="inline" onsubmit="return confirm('Archive this student?');">
                                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>
                                <input type="hidden" name="id" value="<?= $student['id'] ?>"/>
                                <button type="submit"
                                        class="p-2 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-lg transition-colors inline-block"
                                        title="Archive">
                                    <span class="material-symbols-outlined text-[20px]">archive</span>
                                </button>
                            </form>
                            <form method="POST" action="<?= APP_URL ?>/index.php?route=students.destroy" class="inline" onsubmit="return confirm('WARNING: This action is permanent and irrevocably deletes all linked records for this student! Are you absolutely sure?');">
                                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>
                                <input type="hidden" name="id" value="<?= $student['id'] ?>"/>
                                <button type="submit"
                                        class="p-2 text-error hover:bg-error/10 rounded-lg transition-colors inline-block"
                                        title="Permanently Delete">
                                    <span class="material-symbols-outlined text-[20px]">delete_forever</span>
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>
                <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>

        <!-- Pagination -->
        <?php if ($result['total_pages'] > 1): ?>
        <div class="bg-surface-container-low px-6 py-4 flex items-center justify-between">
            <p class="text-xs font-medium text-on-surface-variant">
                Showing <span class="text-on-surface font-bold">
                    <?= ($result['current_page'] - 1) * $result['per_page'] + 1 ?>–<?= min($result['current_page'] * $result['per_page'], $result['total']) ?>
                </span> of <span class="text-on-surface font-bold"><?= number_format($result['total']) ?></span> students
            </p>
            <div class="flex items-center gap-1">
                <?php for ($p = 1; $p <= min(5, $result['total_pages']); $p++): ?>
                <a href="?route=students&page=<?= $p ?>&status=<?= $filters['status'] ?>&batch_id=<?= $filters['batch_id'] ?>"
                   class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                          <?= $p === $result['current_page'] ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-highest' ?>">
                    <?= $p ?>
                </a>
                <?php endfor; ?>
            </div>
        </div>
        <?php endif; ?>
    </div>

    <!-- Stats cards below table -->
    <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-primary/5 rounded-xl p-5 border border-primary/10">
            <div class="flex justify-between items-start mb-3">
                <div class="p-2 bg-primary rounded-lg text-white">
                    <span class="material-symbols-outlined">trending_up</span>
                </div>
            </div>
            <h4 class="text-sm font-bold text-on-surface mb-1">Total Enrolled</h4>
            <p class="text-3xl font-extrabold text-primary"><?= number_format($result['total']) ?></p>
        </div>
        <div class="bg-secondary/5 rounded-xl p-5 border border-secondary/10">
            <div class="p-2 bg-secondary rounded-lg text-white w-fit mb-3">
                <span class="material-symbols-outlined">verified</span>
            </div>
            <h4 class="text-sm font-bold text-on-surface mb-1">Active Students</h4>
            <p class="text-3xl font-extrabold text-secondary">
                <?= count(array_filter($result['data'] ?? [], fn($s) => $s['status'] === 'active')) ?>
            </p>
        </div>
        <div class="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/10">
            <a href="<?= APP_URL ?>/index.php?route=fees" class="block">
                <h4 class="text-sm font-bold text-on-surface mb-1">View Pending Fees</h4>
                <p class="text-xs text-on-surface-variant mt-1">Track overdue & upcoming payments</p>
                <span class="mt-3 text-xs font-bold text-primary flex items-center gap-1">
                    View details <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
            </a>
        </div>
    </div>
</div>

<?php $pageScripts = ['students.js']; ?>
