<?php $pageTitle = 'Daily Attendance'; $currentRoute = 'attendance'; ?>
<div class="p-10">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
            <h2 class="text-[2.75rem] font-extrabold text-on-surface leading-none tracking-tight">Daily Attendance</h2>
            <p class="text-on-surface-variant font-medium mt-1">Record student participation for the active session.</p>
        </div>
        <div class="flex items-end gap-4 flex-wrap">
            <form method="GET" action="<?= APP_URL ?>/index.php" class="flex items-end gap-3 flex-wrap"
                  id="attendance-filter-form">
                <input type="hidden" name="route" value="attendance"/>
                <div class="flex flex-col gap-1">
                    <label class="filter-label">Select Date</label>
                    <input type="date" name="date" id="attendance-date"
                           class="form-input font-semibold text-primary min-w-[140px]"
                           value="<?= htmlspecialchars($date) ?>"/>
                </div>
                <div class="flex flex-col gap-1">
                    <label class="filter-label">Batch</label>
                    <select name="batch_id" id="attendance-batch"
                            class="form-input font-semibold text-primary min-w-[200px]">
                        <?php foreach ($batches as $batch): ?>
                        <option value="<?= $batch['id'] ?>"
                                <?= ($batchId == $batch['id']) ? 'selected' : '' ?>>
                            <?= htmlspecialchars($batch['name'] . ' — ' . $batch['subject']) ?>
                        </option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </form>
        </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div class="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-secondary flex flex-col">
            <span class="stat-label">Present</span>
            <div class="flex items-baseline gap-2 mt-2">
                <span class="text-4xl font-extrabold text-secondary" id="count-present"><?= $summary['present'] ?></span>
                <span class="text-sm font-medium bg-secondary text-white px-2 py-0.5 rounded-full" id="pct-present">
                    <?= $summary['total'] > 0 ? round($summary['present']/$summary['total']*100) : 0 ?>%
                </span>
            </div>
        </div>
        <div class="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-error flex flex-col">
            <span class="stat-label">Absent</span>
            <div class="flex items-baseline gap-2 mt-2">
                <span class="text-4xl font-extrabold text-error" id="count-absent"><?= $summary['absent'] ?></span>
                <span class="text-sm font-medium bg-error/10 text-error px-2 py-0.5 rounded-full" id="pct-absent">
                    <?= $summary['total'] > 0 ? round($summary['absent']/$summary['total']*100) : 0 ?>%
                </span>
            </div>
        </div>
        <div class="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-amber-500 flex flex-col">
            <span class="stat-label">Late</span>
            <div class="flex items-baseline gap-2 mt-2">
                <span class="text-4xl font-extrabold text-amber-500" id="count-late"><?= $summary['late'] ?></span>
                <span class="text-sm font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full" id="pct-late">
                    <?= $summary['total'] > 0 ? round($summary['late']/$summary['total']*100) : 0 ?>%
                </span>
            </div>
        </div>
        <div class="bg-primary p-6 rounded-xl text-on-primary flex flex-col justify-center items-center text-center">
            <span class="material-symbols-outlined text-3xl mb-2">cloud_done</span>
            <p class="text-xs font-medium opacity-80 mb-3">AJAX — auto saved</p>
            <p class="text-sm font-bold">
                Total: <?= $summary['total'] ?> students
            </p>
        </div>
    </div>

    <!-- Student Roster -->
    <div class="bg-surface-container-low rounded-2xl overflow-hidden">
        <div class="p-6 bg-surface-container-highest/50 flex items-center justify-between">
            <h3 class="text-lg font-bold text-on-surface">
                Student Roster
                <span class="text-on-surface-variant font-normal text-sm ml-1">(<?= count($students) ?> enrolled)</span>
            </h3>
            <div class="flex items-center gap-4">
                <?php if ($batchId && !empty($students)): ?>
                <button class="text-xs font-bold text-primary hover:underline"
                        id="mark-all-present"
                        data-batch="<?= $batchId ?>"
                        data-date="<?= htmlspecialchars($date) ?>">
                    Mark all Present
                </button>
                <?php endif; ?>
                <span class="text-xs text-on-surface-variant italic" id="last-saved-time">
                    <?= date('g:i A') ?>
                </span>
            </div>
        </div>

        <?php if (empty($students)): ?>
        <div class="p-16 text-center text-on-surface-variant">
            <span class="material-symbols-outlined text-5xl opacity-30 block mb-3">event_busy</span>
            <p class="text-sm font-medium">No students in this batch or no batch selected.</p>
        </div>
        <?php else: ?>
        <div class="divide-y divide-outline-variant/10" id="student-roster">
            <?php foreach ($students as $student): ?>
            <div class="attendance-row flex items-center justify-between p-6 bg-surface-container-lowest transition-colors"
                 data-student-id="<?= $student['student_id'] ?>"
                 data-batch-id="<?= $batchId ?>"
                 data-date="<?= htmlspecialchars($date) ?>">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                        <?= strtoupper(substr($student['full_name'], 0, 1)) ?>
                    </div>
                    <div>
                        <p class="text-sm font-bold text-on-surface"><?= htmlspecialchars($student['full_name']) ?></p>
                        <p class="text-[11px] font-semibold text-on-surface-variant/70"><?= htmlspecialchars($student['roll_no']) ?></p>
                    </div>
                </div>

                <!-- Attendance Toggle -->
                <div class="flex items-center gap-1.5 bg-surface-container p-1 rounded-xl" role="group"
                     aria-label="Attendance for <?= htmlspecialchars($student['full_name']) ?>">
                    <?php
                    $curStatus = $student['attendance_status'] ?? 'not_marked';
                    $btns = [
                        'present' => ['label' => 'Present', 'icon' => 'check_circle', 'activeClass' => 'bg-secondary text-white'],
                        'absent'  => ['label' => 'Absent',  'icon' => 'cancel',       'activeClass' => 'bg-error text-white'],
                        'late'    => ['label' => 'Late',    'icon' => 'schedule',      'activeClass' => 'bg-amber-500 text-white'],
                    ];
                    foreach ($btns as $statusVal => $btn):
                        $isActive = ($curStatus === $statusVal);
                    ?>
                    <button type="button"
                            class="attendance-btn flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all
                                   <?= $isActive ? $btn['activeClass'] . ' shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high' ?>"
                            data-status="<?= $statusVal ?>"
                            <?= $isActive ? 'aria-pressed="true"' : '' ?>>
                        <?php if ($isActive): ?>
                        <span class="material-symbols-outlined text-sm"><?= $btn['icon'] ?></span>
                        <?php endif; ?>
                        <?= $btn['label'] ?>
                    </button>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>
    </div>
</div>

<!-- AJAX data injected for attendance.js -->
<script>
window.ATTENDANCE_CONFIG = {
    batchId: <?= (int)$batchId ?>,
    date: '<?= htmlspecialchars($date, ENT_QUOTES) ?>',
    csrfToken: window.CSRF_TOKEN,
    markUrl: '<?= APP_URL ?>/index.php?route=attendance.mark'
};
</script>
<?php $pageScripts = ['attendance.js']; ?>
