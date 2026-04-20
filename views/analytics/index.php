<?php
$pageTitle = 'Analytics';
$currentRoute = 'analytics';

// Prepare chart data for JS
$chartData = [
    'revenue' => array_map(fn($r) => ['label' => $r['month'], 'value' => (float)$r['revenue']], $monthlyRevenue),
    'attendance' => array_map(fn($r) => ['label' => $r['month'], 'value' => (float)$r['pct']], $attendanceTrend),
    'batchPerformance' => array_map(fn($b) => ['label' => $b['batch_name'], 'value' => (float)$b['avg_pct']], $batchAvg),
];
?>
<div class="p-10">
    <div class="mb-10">
        <h2 class="text-[2.75rem] font-extrabold text-on-surface leading-none tracking-tight">Analytics</h2>
        <p class="text-on-surface-variant font-medium mt-1">Performance, revenue, and growth insights.</p>
    </div>

    <!-- KPI Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <a href="<?= APP_URL ?>/index.php?route=students" class="block stat-card hover:ring-2 hover:ring-primary/20 transition-all">
            <div class="p-2 bg-primary-fixed rounded-lg text-primary w-fit mb-3">
                <span class="material-symbols-outlined">school</span>
            </div>
            <h3 class="stat-label">Total Students</h3>
            <p class="stat-value"><?= number_format($totalStudents) ?></p>
        </a>
        <a href="<?= APP_URL ?>/index.php?route=fees" class="block stat-card hover:ring-2 hover:ring-secondary/20 transition-all">
            <div class="p-2 bg-secondary-container/30 text-secondary rounded-lg w-fit mb-3">
                <span class="material-symbols-outlined">payments</span>
            </div>
            <h3 class="stat-label">Total Revenue</h3>
            <p class="stat-value"><?= APP_CURRENCY ?><?= number_format($totalRevenue, 0) ?></p>
        </a>
        <a href="<?= APP_URL ?>/index.php?route=attendance" class="block stat-card hover:ring-2 hover:ring-tertiary/20 transition-all">
            <div class="p-2 bg-tertiary-fixed text-tertiary rounded-lg w-fit mb-3">
                <span class="material-symbols-outlined">event_available</span>
            </div>
            <h3 class="stat-label">Avg Attendance</h3>
            <p class="stat-value"><?= $avgAttendance ?>%</p>
        </a>
        <a href="<?= APP_URL ?>/index.php?route=fees" class="block stat-card hover:ring-2 hover:ring-error/20 transition-all">
            <div class="p-2 bg-error-container text-error rounded-lg w-fit mb-3">
                <span class="material-symbols-outlined">warning</span>
            </div>
            <h3 class="stat-label">Pending Fees</h3>
            <p class="stat-value text-error"><?= APP_CURRENCY ?><?= number_format($totalPending, 0) ?></p>
        </a>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Revenue Chart -->
        <div class="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
            <h3 class="text-lg font-bold text-on-surface mb-1">Monthly Revenue</h3>
            <p class="text-sm text-on-surface-variant mb-6">Fee collection over the last 6 months</p>
            <div class="relative h-60">
                <canvas id="revenueChart" aria-label="Monthly Revenue Chart"></canvas>
            </div>
        </div>

        <!-- Attendance Chart -->
        <div class="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
            <h3 class="text-lg font-bold text-on-surface mb-1">Attendance Trend</h3>
            <p class="text-sm text-on-surface-variant mb-6">Average attendance % per month</p>
            <div class="relative h-60">
                <canvas id="attendanceChart" aria-label="Attendance Trend Chart"></canvas>
            </div>
        </div>

        <!-- Batch Performance -->
        <div class="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
            <h3 class="text-lg font-bold text-on-surface mb-1">Batch Performance</h3>
            <p class="text-sm text-on-surface-variant mb-6">Average exam score by batch</p>
            <div class="relative h-60">
                <canvas id="batchChart" aria-label="Batch Performance Chart"></canvas>
            </div>
        </div>

        <!-- Fee Status Donut -->
        <div class="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
            <h3 class="text-lg font-bold text-on-surface mb-1">Fee Status Distribution</h3>
            <p class="text-sm text-on-surface-variant mb-6">Breakdown of payment statuses</p>
            <div class="relative h-60">
                <canvas id="feeStatusChart" aria-label="Fee Status Chart"></canvas>
            </div>
        </div>
    </div>

    <!-- Top Performers Table -->
    <?php if (!empty($topStudents)): ?>
    <div class="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
        <h3 class="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">emoji_events</span>
            Top 10 Students
        </h3>
        <div class="space-y-3">
            <?php foreach ($topStudents as $i => $s): ?>
            <div class="flex items-center gap-4">
                <span class="w-7 h-7 rounded-full <?= $i < 3 ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant' ?> text-xs font-bold flex items-center justify-center flex-shrink-0">
                    <?= $i + 1 ?>
                </span>
                <p class="text-sm font-bold text-on-surface w-48 truncate"><?= htmlspecialchars($s['full_name']) ?></p>
                <div class="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div class="h-full bg-secondary rounded-full" style="width:<?= min(100, (float)$s['avg_pct']) ?>%"></div>
                </div>
                <span class="text-sm font-extrabold text-secondary w-12 text-right"><?= $s['avg_pct'] ?>%</span>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
    <?php endif; ?>
</div>

<?php
$feeStatusData = [
    ['label' => 'Paid',    'value' => (int)($feeStatus['paid']['cnt']    ?? 0), 'color' => '#006c49'],
    ['label' => 'Due',     'value' => (int)($feeStatus['due']['cnt']     ?? 0), 'color' => '#3525cd'],
    ['label' => 'Overdue', 'value' => (int)($feeStatus['overdue']['cnt'] ?? 0), 'color' => '#950029'],
];
$chartData['feeStatus'] = $feeStatusData;
$pageScripts = ['charts.js'];
?>
