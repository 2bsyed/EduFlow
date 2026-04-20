<?php $pageTitle = 'Add Fee Record'; $currentRoute = 'fees'; ?>
<div class="p-10 max-w-2xl">
    <div class="mb-8">
        <a href="<?= APP_URL ?>/index.php?route=fees"
           class="text-sm text-on-surface-variant hover:text-primary flex items-center gap-1 mb-4">
            <span class="material-symbols-outlined text-sm">arrow_back</span> Back to Fees
        </a>
        <h2 class="text-3xl font-extrabold text-on-surface">Add Fee Record</h2>
        <p class="text-on-surface-variant mt-1">Create a fee record and assign it to a student.</p>
    </div>

    <?php if (!empty($flash['error'])): ?>
    <div class="form-error-banner mb-6"><?= htmlspecialchars($flash['error']) ?></div>
    <?php endif; ?>

    <form method="POST" action="<?= APP_URL ?>/index.php?route=fees.store" class="space-y-6">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>

        <div class="form-card">
            <h3 class="form-section-title">Fee Details</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="form-group md:col-span-2">
                    <label class="form-label" for="student_id">Student *</label>
                    <select id="student_id" name="student_id" class="form-input searchable-select" required>
                        <option value="">Select student...</option>
                        <?php foreach ($students as $student): ?>
                        <option value="<?= $student['id'] ?>">
                            <?= htmlspecialchars($student['full_name'] . ' (' . $student['roll_no'] . ')') ?>
                        </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="batch_id">Batch</label>
                    <select id="batch_id" name="batch_id" class="form-input">
                        <option value="">— None —</option>
                        <?php foreach ($batches as $batch): ?>
                        <option value="<?= $batch['id'] ?>">
                            <?= htmlspecialchars($batch['name']) ?>
                        </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="amount">Amount (<?= APP_CURRENCY ?>) *</label>
                    <input type="number" id="amount" name="amount" class="form-input"
                           min="0" step="0.01" placeholder="2500.00" required/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="due_date">Due Date *</label>
                    <input type="date" id="due_date" name="due_date" class="form-input"
                           value="<?= date('Y-m-d', strtotime('+30 days')) ?>" required/>
                </div>
            </div>
        </div>

        <div class="flex gap-4">
            <button type="submit" class="btn-primary px-8 py-3 flex items-center gap-2">
                <span class="material-symbols-outlined text-lg">add</span>
                Create Fee Record
            </button>
            <a href="<?= APP_URL ?>/index.php?route=fees" class="btn-ghost px-6 py-3">Cancel</a>
        </div>
    </form>
</div>
