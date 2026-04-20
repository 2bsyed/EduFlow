<?php $pageTitle = 'Enter Results'; $currentRoute = 'results'; ?>
<div class="p-10 max-w-4xl">
    <div class="mb-8">
        <a href="<?= APP_URL ?>/index.php?route=results"
           class="text-sm text-on-surface-variant hover:text-primary flex items-center gap-1 mb-4">
            <span class="material-symbols-outlined text-sm">arrow_back</span> Back to Results
        </a>
        <h2 class="text-3xl font-extrabold text-on-surface">Enter Exam Results</h2>
        <p class="text-on-surface-variant mt-1">Enter marks for all students in a batch at once.</p>
    </div>

    <!-- Step 1: Select batch (reload page) -->
    <div class="form-card mb-6">
        <h3 class="form-section-title">Select Batch</h3>
        <form method="GET" action="<?= APP_URL ?>/index.php" class="flex gap-4 items-end flex-wrap">
            <input type="hidden" name="route" value="results.entry"/>
            <div class="flex-1 min-w-[200px]">
                <label class="form-label" for="batch_select">Batch *</label>
                <select id="batch_select" name="batch_id" class="form-input searchable-select">
                    <option value="">Select batch...</option>
                    <?php foreach ($batches as $batch): ?>
                    <option value="<?= $batch['id'] ?>" <?= ($selectedBatch == $batch['id']) ? 'selected' : '' ?>>
                        <?= htmlspecialchars($batch['name'] . ' — ' . $batch['subject']) ?>
                    </option>
                    <?php endforeach; ?>
                </select>
            </div>
            <button type="submit" class="btn-primary px-6 py-2.5">Load Students</button>
        </form>
    </div>

    <?php if ($selectedBatch && !empty($students)): ?>
    <!-- Step 2: Enter marks -->
    <form method="POST" action="<?= APP_URL ?>/index.php?route=results.store" class="space-y-6">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>
        <input type="hidden" name="batch_id" value="<?= $selectedBatch ?>"/>

        <div class="form-card">
            <h3 class="form-section-title">Exam Details</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div class="form-group">
                    <label class="form-label" for="subject">Subject *</label>
                    <input type="text" id="subject" name="subject" class="form-input"
                           placeholder="Mathematics" required/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="exam_name">Exam Name *</label>
                    <input type="text" id="exam_name" name="exam_name" class="form-input"
                           value="Unit Test" required/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="marks_total">Total Marks</label>
                    <input type="number" id="marks_total" name="marks_total" class="form-input"
                           value="100" min="1"/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="exam_date">Exam Date *</label>
                    <input type="date" id="exam_date" name="exam_date" class="form-input"
                           value="<?= date('Y-m-d') ?>" required/>
                </div>
            </div>
        </div>

        <!-- Student marks table -->
        <div class="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
            <div class="p-5 bg-surface-container-low">
                <h3 class="font-bold text-on-surface">Enter Marks (<?= count($students) ?> students)</h3>
            </div>
            <table class="w-full">
                <thead class="bg-surface-container-highest/50">
                    <tr>
                        <th class="table-th">Student</th>
                        <th class="table-th">Roll No</th>
                        <th class="table-th w-40">Marks Obtained</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant/10">
                    <?php foreach ($students as $i => $student): ?>
                    <tr class="hover:bg-surface-container-low/50">
                        <td class="px-6 py-3">
                            <input type="hidden" name="student_id[]" value="<?= $student['id'] ?>"/>
                            <p class="text-sm font-bold text-on-surface"><?= htmlspecialchars($student['full_name']) ?></p>
                        </td>
                        <td class="px-6 py-3 text-sm text-on-surface-variant">
                            <?= htmlspecialchars($student['roll_no']) ?>
                        </td>
                        <td class="px-6 py-3">
                            <input type="number" name="marks_obtained[]"
                                   class="form-input py-1.5 text-sm w-28"
                                   min="0" max="100" step="0.5" placeholder="0"/>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <div class="flex gap-4">
            <button type="submit" class="btn-primary px-8 py-3 flex items-center gap-2">
                <span class="material-symbols-outlined text-lg">save</span>
                Save All Results
            </button>
            <a href="<?= APP_URL ?>/index.php?route=results" class="btn-ghost px-6 py-3">Cancel</a>
        </div>
    </form>
    <?php elseif ($selectedBatch): ?>
    <div class="form-card text-center py-10 text-on-surface-variant">
        <span class="material-symbols-outlined text-5xl opacity-30 block mb-3">group</span>
        <p>No active students in this batch.</p>
    </div>
    <?php endif; ?>
</div>
