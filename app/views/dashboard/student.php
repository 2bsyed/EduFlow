<?php $pageTitle = 'Student Dashboard'; $currentRoute = 'student.dashboard'; ?>
<div class="p-10">
    <div class="flex justify-between items-end mb-8">
        <div>
            <h2 class="text-4xl font-extrabold text-on-surface tracking-tight mb-2">My Dashboard</h2>
            <p class="text-on-surface-variant">Welcome back, <?= htmlspecialchars($user['name']) ?>.</p>
        </div>
    </div>

    <?php if (!$myStudent): ?>
        <div class="bg-error-container text-on-error-container p-4 rounded-xl border border-error/20">
            <strong>Error:</strong> Your student profile could not be found. Please contact the administrator.
        </div>
    <?php else: ?>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <!-- Results Section -->
            <div class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-6">
                <h3 class="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">analytics</span> Recent Results
                </h3>
                <?php if (empty($results)): ?>
                    <p class="text-on-surface-variant text-sm">No exam records found.</p>
                <?php else: ?>
                    <div class="space-y-4">
                        <?php foreach (array_slice($results, 0, 5) as $res): ?>
                            <div class="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                                <div>
                                    <p class="font-bold text-sm text-on-surface"><?= htmlspecialchars($res['subject']) ?> - <?= htmlspecialchars($res['exam_name']) ?></p>
                                    <p class="text-xs text-on-surface-variant mt-1"><?= htmlspecialchars($res['exam_date']) ?></p>
                                </div>
                                <div class="text-right">
                                    <p class="text-lg font-bold <?= $res['grade'] === 'F' ? 'text-error' : 'text-primary' ?>">
                                        <?= (float)$res['marks_obtained'] ?> / <?= (float)$res['marks_total'] ?>
                                    </p>
                                    <p class="text-xs font-bold text-on-surface-variant">Grade: <?= htmlspecialchars($res['grade']) ?></p>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Fees Section -->
            <div class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-6">
                <h3 class="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-secondary">payments</span> Fee Status
                </h3>
                <?php if (empty($fees)): ?>
                    <p class="text-on-surface-variant text-sm">No fee records found.</p>
                <?php else: ?>
                    <div class="space-y-4">
                        <?php foreach (array_slice($fees, 0, 5) as $fee): ?>
                            <div class="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                                <div>
                                    <p class="font-bold text-sm text-on-surface">Due: <?= htmlspecialchars($fee['due_date']) ?></p>
                                    <p class="text-xs text-on-surface-variant mt-1">Amount: ৳<?= number_format($fee['amount'], 2) ?></p>
                                </div>
                                <div class="text-right">
                                    <?php if ($fee['status'] === 'paid'): ?>
                                        <span class="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                                            Paid
                                        </span>
                                    <?php else: ?>
                                        <span class="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                                            Pending
                                        </span>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
        
        <!-- Attendance Trends -->
        <div class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-6">
            <h3 class="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">calendar_today</span> Recent Attendance
            </h3>
            <?php if (empty($attendance)): ?>
                <p class="text-on-surface-variant text-sm">No attendance records found.</p>
            <?php else: ?>
                <div class="flex gap-2 flex-wrap text-center">
                    <?php foreach ($attendance as $att): ?>
                        <div class="px-3 py-2 rounded-lg <?= $att['status'] === 'present' ? 'bg-primary/10 text-primary' : ($att['status'] === 'absent' ? 'bg-error/10 text-error' : 'bg-orange-100 text-orange-800') ?>">
                            <p class="text-[10px] font-bold uppercase tracking-wider"><?= date('M d', strtotime($att['date'])) ?></p>
                            <p class="text-sm font-extrabold capitalize"><?= htmlspecialchars($att['status']) ?></p>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    <?php endif; ?>
</div>
