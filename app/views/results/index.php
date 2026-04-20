<?php $pageTitle = 'Exam Results'; $currentRoute = 'results'; ?>
<div class="p-10">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
            <h2 class="text-4xl font-extrabold text-on-surface tracking-tight mb-1">Results & Performance</h2>
            <p class="text-on-surface-variant">Manage exam marks, grades, and student progress.</p>
        </div>
        <?php if (in_array($_SESSION['user']['role'] ?? '', ['owner', 'teacher'])): ?>
        <a href="<?= APP_URL ?>/index.php?route=results.entry"
           class="btn-primary flex items-center gap-2 px-6 py-2.5">
            <span class="material-symbols-outlined text-lg">add</span>
            Enter Results
        </a>
        <?php endif; ?>
    </div>

    <!-- Top Performers & Batch Avg -->
    <?php if (($_SESSION['user']['role'] ?? '') !== 'student'): ?>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
            <h3 class="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">emoji_events</span>
                Top Performers
            </h3>
            <?php if (empty($topStudents)): ?>
            <p class="text-sm text-on-surface-variant">No result data yet.</p>
            <?php else: ?>
            <div class="space-y-3">
                <?php foreach ($topStudents as $i => $s): ?>
                <div class="flex items-center gap-3">
                    <span class="w-6 h-6 rounded-full bg-primary-fixed text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                        <?= $i + 1 ?>
                    </span>
                    <div class="flex-1">
                        <p class="text-sm font-bold text-on-surface"><?= htmlspecialchars($s['full_name']) ?></p>
                        <div class="w-full h-1.5 bg-surface-container-highest rounded-full mt-1 overflow-hidden">
                            <div class="h-full bg-secondary rounded-full" style="width:<?= min(100, (float)$s['avg_pct']) ?>%"></div>
                        </div>
                    </div>
                    <span class="text-sm font-extrabold text-secondary"><?= $s['avg_pct'] ?>%</span>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>

        <div class="lg:col-span-2 bg-surface-container-lowest rounded-xl p-6 shadow-sm">
            <h3 class="text-base font-bold text-on-surface mb-4">Batch Performance Avg</h3>
            <?php if (empty($batchAvg)): ?>
            <p class="text-sm text-on-surface-variant">No batch data yet.</p>
            <?php else: ?>
            <?php foreach ($batchAvg as $b): ?>
            <div class="flex items-center gap-3 mb-3">
                <p class="text-sm text-on-surface-variant w-40 truncate flex-shrink-0">
                    <?= htmlspecialchars($b['batch_name']) ?>
                </p>
                <div class="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all"
                         style="width:<?= min(100, (float)$b['avg_pct']) ?>%;
                                background: <?= (float)$b['avg_pct'] >= 80 ? '#006c49' : ((float)$b['avg_pct'] >= 60 ? '#3525cd' : '#950029') ?>">
                    </div>
                </div>
                <span class="text-sm font-bold text-on-surface w-12 text-right"><?= $b['avg_pct'] ?>%</span>
            </div>
            <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
    <?php endif; ?>

    <!-- Filters + Table -->
    <div class="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <?php if (($_SESSION['user']['role'] ?? '') !== 'student'): ?>
        <div class="p-5 bg-surface-container-low flex flex-wrap gap-4 items-end">
            <form method="GET" action="<?= APP_URL ?>/index.php" class="flex flex-wrap gap-4 items-end">
                <input type="hidden" name="route" value="results"/>
                <div>
                    <label class="filter-label">Search</label>
                    <input type="text" name="search" class="filter-input"
                           placeholder="Student name or roll no..."
                           value="<?= htmlspecialchars($filters['search']) ?>"/>
                </div>
                <div>
                    <label class="filter-label">Batch</label>
                    <select name="batch_id" class="filter-input">
                        <option value="">All Batches</option>
                        <?php foreach ($batches as $batch): ?>
                        <option value="<?= $batch['id'] ?>" <?= ($filters['batch_id'] == $batch['id']) ? 'selected' : '' ?>>
                            <?= htmlspecialchars($batch['name']) ?>
                        </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <button type="submit" class="btn-primary px-4 py-2 text-sm">Filter</button>
            </form>
        </div>
        <?php endif; ?>

        <table class="w-full text-left">
            <thead class="bg-surface-container-low">
                <tr>
                    <th class="table-th">Student</th>
                    <th class="table-th">Subject / Exam</th>
                    <th class="table-th">Marks</th>
                    <th class="table-th">Grade</th>
                    <th class="table-th">Date</th>
                    <?php if (in_array($_SESSION['user']['role'] ?? '', ['owner'])): ?>
                    <th class="table-th text-right">Actions</th>
                    <?php endif; ?>
                </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/10">
                <?php if (empty($result['data'])): ?>
                <tr>
                    <td colspan="6" class="px-6 py-16 text-center text-on-surface-variant">
                        <span class="material-symbols-outlined text-5xl opacity-30 block mb-3">assignment_turned_in</span>
                        <p class="text-sm">No results yet. Enter exam marks to get started.</p>
                    </td>
                </tr>
                <?php else: ?>
                <?php foreach ($result['data'] as $res):
                    $gradeColors = ['A+'=>'text-green-700 bg-green-100','A'=>'text-secondary bg-secondary/10','B+'=>'text-primary bg-primary/10','B'=>'text-primary bg-primary/10','C'=>'text-amber-700 bg-amber-100','D'=>'text-orange-700 bg-orange-100','F'=>'text-error bg-error-container'];
                    $gc = $gradeColors[$res['grade']] ?? 'text-on-surface-variant bg-surface-container-high';
                    $pct = $res['marks_total'] > 0 ? round($res['marks_obtained'] / $res['marks_total'] * 100, 1) : 0;
                ?>
                <tr class="table-row group">
                    <td class="px-6 py-4">
                        <p class="font-bold text-sm text-on-surface"><?= htmlspecialchars($res['student_name']) ?></p>
                        <p class="text-xs text-on-surface-variant"><?= htmlspecialchars($res['roll_no']) ?></p>
                    </td>
                    <td class="px-6 py-4">
                        <p class="text-sm font-medium text-on-surface"><?= htmlspecialchars($res['subject']) ?></p>
                        <p class="text-xs text-on-surface-variant"><?= htmlspecialchars($res['exam_name']) ?></p>
                    </td>
                    <td class="px-6 py-4">
                        <p class="text-sm font-bold text-on-surface">
                            <?= number_format($res['marks_obtained'], 0) ?> / <?= number_format($res['marks_total'], 0) ?>
                        </p>
                        <div class="w-20 h-1.5 bg-surface-container-highest rounded-full mt-1 overflow-hidden">
                            <div class="h-full bg-secondary rounded-full" style="width:<?= $pct ?>%"></div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold <?= $gc ?>">
                            <?= htmlspecialchars($res['grade']) ?>
                        </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-on-surface-variant">
                        <?= date('M j, Y', strtotime($res['exam_date'])) ?>
                    </td>
                    <?php if (($_SESSION['user']['role'] ?? '') === 'owner'): ?>
                    <td class="px-6 py-4 text-right">
                        <div class="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                            <a href="<?= APP_URL ?>/index.php?route=results.edit&id=<?= $res['id'] ?>"
                               class="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/5"
                               title="Edit Result">
                                <span class="material-symbols-outlined text-lg">edit</span>
                            </a>
                            <form method="POST" action="<?= APP_URL ?>/index.php?route=results.delete"
                                  class="inline"
                              onsubmit="return confirm('Delete this result?')">
                            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>
                            <input type="hidden" name="id" value="<?= $res['id'] ?>"/>
                            <button type="submit" class="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/5">
                                <span class="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </form>
                        </div>
                    </td>
                    <?php endif; ?>
                </tr>
                <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
