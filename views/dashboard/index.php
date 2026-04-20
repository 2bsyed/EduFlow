<?php
$pageTitle   = 'Dashboard';
$currentRoute = 'dashboard';
$chartData = [
    'revenue'    => array_values(array_map(fn($r) => ['label' => $r['month'], 'value' => (float)$r['revenue']], $monthlyRevenue)),
    'attendance' => array_values(array_map(fn($r) => ['label' => $r['month'], 'value' => (float)$r['pct']], $attendanceTrend)),
];
?>
<div class="p-10">
    <!-- Hero Header -->
    <header class="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <p class="text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-2">
                Welcome back, <?= htmlspecialchars($user['role'] ?? 'Director') ?>
            </p>
            <h2 class="text-[2.75rem] font-extrabold text-on-surface leading-none tracking-tight">Academy Overview</h2>
        </div>
        <a href="<?= APP_URL ?>/index.php?route=students.create"
           class="btn-primary flex items-center gap-2 px-6 py-3">
            <span class="material-symbols-outlined text-sm">add</span>
            Enroll New Student
        </a>
    </header>

    <!-- Stats Grid (Bento) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Students -->
        <a href="<?= APP_URL ?>/index.php?route=students" class="block stat-card group hover:ring-2 hover:ring-primary/20 transition-all">
            <div class="flex justify-between items-start mb-4">
                <div class="p-2 bg-primary-fixed rounded-lg text-primary">
                    <span class="material-symbols-outlined">school</span>
                </div>
                <span class="stat-badge stat-badge--green">
                    <span class="material-symbols-outlined text-xs">trending_up</span>
                    +<?= $stats['new_this_month'] ?> this month
                </span>
            </div>
            <h3 class="stat-label">Total Students</h3>
            <p class="stat-value"><?= number_format($stats['total_students']) ?></p>
        </a>

        <!-- Revenue -->
        <a href="<?= APP_URL ?>/index.php?route=fees" class="block stat-card group hover:ring-2 hover:ring-secondary/20 transition-all">
            <div class="flex justify-between items-start mb-4">
                <div class="p-2 bg-secondary-container/30 text-secondary rounded-lg">
                    <span class="material-symbols-outlined">payments</span>
                </div>
                <span class="stat-badge stat-badge--green">
                    <span class="material-symbols-outlined text-xs">trending_up</span>
                    Collected
                </span>
            </div>
            <h3 class="stat-label">Total Revenue</h3>
            <p class="stat-value"><?= APP_CURRENCY ?><?= number_format($stats['total_revenue'], 0) ?></p>
        </a>

        <!-- Attendance -->
        <a href="<?= APP_URL ?>/index.php?route=attendance" class="block stat-card group hover:ring-2 hover:ring-tertiary/20 transition-all">
            <div class="flex justify-between items-start mb-4">
                <div class="p-2 bg-tertiary-fixed text-tertiary rounded-lg">
                    <span class="material-symbols-outlined">how_to_reg</span>
                </div>
                <span class="stat-badge stat-badge--neutral">STABLE</span>
            </div>
            <h3 class="stat-label">Avg Attendance</h3>
            <p class="stat-value"><?= $stats['avg_attendance'] ?>%</p>
            <div class="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
                <div class="bg-secondary h-full rounded-full" style="width:<?= min(100, $stats['avg_attendance']) ?>%"></div>
            </div>
        </a>

        <!-- Active Batches -->
        <a href="<?= APP_URL ?>/index.php?route=batches" class="block stat-card group hover:ring-2 hover:ring-primary/20 transition-all">
            <div class="flex justify-between items-start mb-4">
                <div class="p-2 bg-primary-fixed-dim text-on-primary-fixed-variant rounded-lg">
                    <span class="material-symbols-outlined">layers</span>
                </div>
            </div>
            <h3 class="stat-label">Active Batches</h3>
            <p class="stat-value"><?= $stats['active_batches'] ?></p>
            <p class="text-[11px] text-on-surface-variant mt-2 font-medium">
                Pending fees: <?= APP_CURRENCY ?><?= number_format($stats['pending_fees'], 0) ?>
            </p>
        </a>
    </div>

    <!-- Chart Section -->
    <div class="bg-surface-container-lowest rounded-xl p-8 mb-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h3 class="text-xl font-bold text-on-surface">Revenue & Attendance Trend</h3>
                <p class="text-sm text-on-surface-variant">Performance metrics across the last 6 months</p>
            </div>
            <div class="flex gap-4">
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-primary inline-block"></span>
                    <span class="text-[11px] font-bold uppercase tracking-tight text-on-surface-variant">Revenue</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-secondary inline-block"></span>
                    <span class="text-[11px] font-bold uppercase tracking-tight text-on-surface-variant">Attendance %</span>
                </div>
            </div>
        </div>
        <div class="relative h-72">
            <canvas id="dashboardChart" aria-label="Revenue and Attendance Chart"></canvas>
        </div>
    </div>

    <!-- Two Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Recent Activity -->
        <div class="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-on-surface">Recent Activity</h3>
                <a href="<?= APP_URL ?>/index.php?route=students"
                   class="text-sm font-bold text-primary hover:underline">View All</a>
            </div>
            <div class="space-y-5">
                <?php if (empty($recentActivity)): ?>
                    <p class="text-sm text-on-surface-variant text-center py-8">No recent activity yet.</p>
                <?php else: ?>
                    <?php foreach ($recentActivity as $log):
                        $iconMap = [
                            'student_enrolled' => ['icon' => 'person_add', 'bg' => 'bg-secondary-container/20', 'color' => 'text-secondary'],
                            'fee_received'     => ['icon' => 'payment',    'bg' => 'bg-primary-fixed-dim/30', 'color' => 'text-primary'],
                            'attendance_marked'=> ['icon' => 'event_available', 'bg' => 'bg-surface-container-highest', 'color' => 'text-on-surface-variant'],
                            'result_entered'   => ['icon' => 'assignment_turned_in', 'bg' => 'bg-tertiary-fixed/30', 'color' => 'text-tertiary'],
                        ];
                        $ic = $iconMap[$log['action']] ?? ['icon' => 'info', 'bg' => 'bg-surface-container-highest', 'color' => 'text-on-surface-variant'];
                    ?>
                    <div class="flex gap-4">
                        <div class="w-10 h-10 rounded-full flex-shrink-0 <?= $ic['bg'] ?> flex items-center justify-center <?= $ic['color'] ?>">
                            <span class="material-symbols-outlined text-sm"><?= $ic['icon'] ?></span>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-on-surface">
                                <?= htmlspecialchars($log['description'] ?? '') ?>
                            </p>
                            <p class="text-[11px] text-on-surface-variant mt-0.5">
                                <?= date('M j, g:i A', strtotime($log['created_at'])) ?>
                            </p>
                        </div>
                    </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>

        <!-- Upcoming Classes -->
        <div class="bg-surface-container-lowest rounded-xl p-8">
            <h3 class="text-xl font-bold text-on-surface mb-6">Active Batches</h3>
            <div class="space-y-3">
                <?php if (empty($upcomingClasses)): ?>
                    <p class="text-sm text-on-surface-variant text-center py-6">No active batches.</p>
                <?php else: ?>
                    <?php foreach (array_slice($upcomingClasses, 0, 4) as $i => $batch):
                        $borderColor = $i % 2 === 0 ? 'border-primary' : 'border-secondary';
                    ?>
                    <div class="p-4 rounded-lg bg-surface-container-low border-l-4 <?= $borderColor ?> hover:bg-surface-container transition-colors">
                        <div class="flex justify-between items-start mb-1">
                            <span class="text-[10px] font-bold text-<?= $i % 2 === 0 ? 'primary' : 'secondary' ?> uppercase tracking-tighter">
                                <?= htmlspecialchars($batch['subject']) ?>
                            </span>
                            <?php if ($batch['room']): ?>
                            <span class="bg-white px-2 py-0.5 rounded text-[10px] font-bold text-on-surface shadow-sm">
                                <?= htmlspecialchars($batch['room']) ?>
                            </span>
                            <?php endif; ?>
                        </div>
                        <h4 class="font-bold text-on-surface text-sm"><?= htmlspecialchars($batch['name']) ?></h4>
                        <p class="text-xs text-on-surface-variant mt-0.5">
                            <?= htmlspecialchars($batch['teacher_name'] ?? 'No Teacher') ?>
                            • <?= $batch['student_count'] ?> Students
                        </p>
                    </div>
                    <?php endforeach; ?>
                <?php endif; ?>
                <a href="<?= APP_URL ?>/index.php?route=batches"
                   class="block text-center text-xs font-bold text-primary hover:underline pt-2">
                    View all batches →
                </a>
            </div>
        </div>
    </div>
</div>

<?php
// Inject chart data
$pageScripts = ['charts.js'];
?>
