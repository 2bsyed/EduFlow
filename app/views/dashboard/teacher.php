<?php $pageTitle = 'Teacher Dashboard'; $currentRoute = 'teacher.dashboard'; ?>
<div class="p-10">
    <div class="flex justify-between items-end mb-8">
        <div>
            <h2 class="text-4xl font-extrabold text-on-surface tracking-tight mb-2">Teacher Portal</h2>
            <p class="text-on-surface-variant">Welcome back, <?= htmlspecialchars($user['name']) ?>.</p>
        </div>
    </div>

    <!-- Analytics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Batches -->
        <div class="bg-primary-container text-on-primary-container rounded-2xl p-6 relative overflow-hidden group">
            <div class="relative z-10 flex flex-col items-start gap-4">
                <div class="p-3 bg-white/20 rounded-xl">
                    <span class="material-symbols-outlined text-3xl">class</span>
                </div>
                <div>
                    <h3 class="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">My Batches</h3>
                    <p class="text-4xl font-extrabold"><?= number_format($batchCount) ?></p>
                </div>
            </div>
            <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
        </div>

        <!-- Students -->
        <div class="bg-secondary-container text-on-secondary-container rounded-2xl p-6 relative overflow-hidden group">
            <div class="relative z-10 flex flex-col items-start gap-4">
                <div class="p-3 bg-white/30 rounded-xl">
                    <span class="material-symbols-outlined text-3xl">school</span>
                </div>
                <div>
                    <h3 class="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">My Students</h3>
                    <p class="text-4xl font-extrabold"><?= number_format($studentCount) ?></p>
                </div>
            </div>
            <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-all"></div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Recent Classes (Attendance) -->
        <div class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-6">
            <h3 class="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">event_available</span> Recent Classes
            </h3>
            <?php if (empty($recentClasses)): ?>
                <p class="text-on-surface-variant text-sm">No recent classes recorded.</p>
            <?php else: ?>
                <div class="space-y-4">
                    <?php 
                    // process raw data to group by date+batch
                    $grouped = [];
                    foreach ($recentClasses as $rc) {
                        $key = $rc['batch_name'] . '|' . $rc['date'];
                        if (!isset($grouped[$key])) {
                            $grouped[$key] = ['batch_name' => $rc['batch_name'], 'date' => $rc['date'], 'present' => 0, 'absent' => 0];
                        }
                        if ($rc['status'] === 'present') {
                            $grouped[$key]['present'] = $rc['count'];
                        } elseif ($rc['status'] === 'absent') {
                            $grouped[$key]['absent'] = $rc['count'];
                        }
                    }
                    ?>
                    <?php foreach (array_slice($grouped, 0, 5) as $classRec): ?>
                        <div class="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                            <div>
                                <p class="font-bold text-sm text-on-surface"><?= htmlspecialchars($classRec['batch_name']) ?></p>
                                <p class="text-xs text-on-surface-variant mt-1"><?= date('l, M d', strtotime($classRec['date'])) ?></p>
                            </div>
                            <div class="text-right flex gap-3 text-sm font-bold">
                                <span class="text-green-600"><?= $classRec['present'] ?> Present</span>
                                <span class="text-red-600"><?= $classRec['absent'] ?> Absent</span>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
        
        <!-- Assigned Batches -->
        <div class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-6">
            <h3 class="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">books</span> Batches Directory
            </h3>
            <?php if (empty($batches)): ?>
                <p class="text-on-surface-variant text-sm">You have no assigned batches.</p>
            <?php else: ?>
                <div class="space-y-4">
                    <?php foreach ($batches as $batch): ?>
                        <div class="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                            <div>
                                <p class="font-bold text-sm text-on-surface"><?= htmlspecialchars($batch['name']) ?></p>
                                <p class="text-xs text-on-surface-variant mt-1"><?= htmlspecialchars($batch['subject']) ?></p>
                            </div>
                            <div class="text-right">
                                <span class="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                                    <?= htmlspecialchars($batch['student_count']) ?> Students
                                </span>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>
