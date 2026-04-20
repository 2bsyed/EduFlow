<?php $pageTitle = 'Batches'; $currentRoute = 'batches'; ?>
<div class="p-10">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
            <h2 class="text-4xl font-extrabold text-on-surface tracking-tight mb-1">Batches</h2>
            <p class="text-on-surface-variant">Manage classes, schedules, and teacher assignments.</p>
        </div>
        <?php if (($_SESSION['user']['role'] ?? '') === 'owner'): ?>
        <a href="<?= APP_URL ?>/index.php?route=batches.create"
           class="btn-primary flex items-center gap-2 px-6 py-2.5">
            <span class="material-symbols-outlined text-lg">add</span>
            Create Batch
        </a>
        <?php endif; ?>
    </div>

    <!-- Batch Cards Grid -->
    <?php if (empty($result['data'])): ?>
    <div class="text-center py-20 text-on-surface-variant">
        <span class="material-symbols-outlined text-6xl opacity-20 block mb-4">groups</span>
        <?php if (($_SESSION['user']['role'] ?? '') === 'owner'): ?>
        <p class="text-lg font-medium">No batches yet</p>
        <a href="<?= APP_URL ?>/index.php?route=batches.create"
           class="mt-4 inline-flex btn-primary px-6 py-2.5 items-center gap-2">
            <span class="material-symbols-outlined text-sm">add</span> Create your first batch
        </a>
        <?php else: ?>
        <p class="text-lg font-medium">No batches assigned to you</p>
        <p class="text-sm mt-2">Ask the institute owner to assign batches to your account.</p>
        <?php endif; ?>
    </div>
    <?php else: ?>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <?php foreach ($result['data'] as $batch):
            $statusColors = [
                'active'    => 'text-secondary bg-secondary/10 border-secondary/20',
                'completed' => 'text-primary bg-primary/10 border-primary/20',
                'cancelled' => 'text-error bg-error/10 border-error/20',
            ];
            $sc = $statusColors[$batch['status']] ?? $statusColors['active'];
        ?>
        <div class="batch-card bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:translate-y-[-4px] transition-transform duration-200">
            <!-- Color accent bar -->
            <div class="h-1.5 bg-gradient-to-r from-primary to-primary-container"></div>

            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="font-bold text-on-surface text-lg leading-tight">
                            <?= htmlspecialchars($batch['name']) ?>
                        </h3>
                        <p class="text-sm text-primary font-semibold mt-0.5">
                            <?= htmlspecialchars($batch['subject']) ?>
                        </p>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border <?= $sc ?>">
                        <?= ucfirst($batch['status']) ?>
                    </span>
                </div>

                <div class="space-y-2 mb-5">
                    <?php if ($batch['teacher_name']): ?>
                    <div class="flex items-center gap-2 text-sm text-on-surface-variant">
                        <span class="material-symbols-outlined text-base">person</span>
                        <?= htmlspecialchars($batch['teacher_name']) ?>
                    </div>
                    <?php endif; ?>
                    <?php if ($batch['schedule']): ?>
                    <div class="flex items-center gap-2 text-sm text-on-surface-variant">
                        <span class="material-symbols-outlined text-base">schedule</span>
                        <?= htmlspecialchars($batch['schedule']) ?>
                    </div>
                    <?php endif; ?>
                    <?php if ($batch['room']): ?>
                    <div class="flex items-center gap-2 text-sm text-on-surface-variant">
                        <span class="material-symbols-outlined text-base">room</span>
                        <?= htmlspecialchars($batch['room']) ?>
                    </div>
                    <?php endif; ?>
                </div>

                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-base text-on-surface-variant">group</span>
                            <span class="text-sm font-bold text-on-surface"><?= $batch['student_count'] ?></span>
                            <span class="text-xs text-on-surface-variant">/ <?= $batch['capacity'] ?></span>
                        </div>
                        <?php if ($batch['fee_amount'] > 0 && ($_SESSION['user']['role'] ?? '') === 'owner'): ?>
                        <div class="text-xs font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                            <?= APP_CURRENCY ?><?= number_format($batch['fee_amount'], 0) ?>/mo
                        </div>
                        <?php endif; ?>
                    </div>

                    <?php if (($_SESSION['user']['role'] ?? '') === 'owner'): ?>
                    <div class="flex gap-1">
                        <a href="<?= APP_URL ?>/index.php?route=batches.edit&id=<?= $batch['id'] ?>"
                           class="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
                           title="Edit">
                            <span class="material-symbols-outlined text-lg">edit</span>
                        </a>
                        <form method="POST" action="<?= APP_URL ?>/index.php?route=batches.delete"
                              onsubmit="return confirm('Cancel this batch?')">
                            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>
                            <input type="hidden" name="id" value="<?= $batch['id'] ?>"/>
                            <button type="submit"
                                    class="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/5 transition-colors"
                                    title="Cancel batch">
                                <span class="material-symbols-outlined text-lg">block</span>
                            </button>
                        </form>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        <?php endforeach; ?>
    </div>

    <!-- Pagination -->
    <?php if ($result['total_pages'] > 1): ?>
    <div class="mt-8 flex justify-center gap-2">
        <?php for ($p = 1; $p <= $result['total_pages']; $p++): ?>
        <a href="?route=batches&page=<?= $p ?>"
           class="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-colors
                  <?= $p === $result['current_page'] ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high' ?>">
            <?= $p ?>
        </a>
        <?php endfor; ?>
    </div>
    <?php endif; ?>
    <?php endif; ?>
</div>
