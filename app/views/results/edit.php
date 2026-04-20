<?php $pageTitle = 'Edit Result'; $currentRoute = 'results'; ?>
<div class="p-10 max-w-2xl">
    <div class="mb-8">
        <a href="<?= APP_URL ?>/index.php?route=results"
           class="text-sm text-on-surface-variant hover:text-primary flex items-center gap-1 mb-4">
            <span class="material-symbols-outlined text-sm">arrow_back</span> Back to Results
        </a>
        <h2 class="text-3xl font-extrabold text-on-surface">Edit Exam Result</h2>
        <p class="text-on-surface-variant mt-1">Update marks and details for <?= htmlspecialchars($res['student_name']) ?>.</p>
    </div>

    <?php if (!empty($flash['error'])): ?>
    <div class="form-error-banner mb-6"><?= htmlspecialchars($flash['error']) ?></div>
    <?php endif; ?>

    <form method="POST" action="<?= APP_URL ?>/index.php?route=results.update" class="space-y-6">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>
        <input type="hidden" name="id" value="<?= $res['id'] ?>"/>

        <div class="form-card">
            <h3 class="form-section-title">Result Details</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="form-group md:col-span-2">
                    <label class="form-label">Student</label>
                    <input type="text" class="form-input bg-surface-container-high text-on-surface-variant cursor-not-allowed" 
                           value="<?= htmlspecialchars($res['student_name'] . ' (' . $res['roll_no'] . ')') ?>" readonly disabled/>
                </div>
                <div class="form-group md:col-span-2">
                    <label class="form-label">Batch</label>
                    <input type="text" class="form-input bg-surface-container-high text-on-surface-variant cursor-not-allowed" 
                           value="<?= htmlspecialchars($res['batch_name'] . ' — ' . $res['batch_subject']) ?>" readonly disabled/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="subject">Subject *</label>
                    <input type="text" id="subject" name="subject" class="form-input"
                           value="<?= htmlspecialchars($res['subject']) ?>" required/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="exam_name">Exam Name *</label>
                    <input type="text" id="exam_name" name="exam_name" class="form-input"
                           value="<?= htmlspecialchars($res['exam_name']) ?>" required/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="marks_obtained">Marks Obtained</label>
                    <input type="number" id="marks_obtained" name="marks_obtained" class="form-input"
                           min="0" max="<?= htmlspecialchars($res['marks_total']) ?>" step="0.5"
                           value="<?= htmlspecialchars($res['marks_obtained']) ?>" />
                </div>
                <div class="form-group">
                    <label class="form-label" for="marks_total">Total Marks</label>
                    <input type="number" id="marks_total" name="marks_total" class="form-input"
                           min="1" step="0.5"
                           value="<?= htmlspecialchars($res['marks_total']) ?>" />
                </div>
                <div class="form-group md:col-span-2">
                    <label class="form-label" for="exam_date">Exam Date *</label>
                    <input type="date" id="exam_date" name="exam_date" class="form-input"
                           value="<?= htmlspecialchars($res['exam_date']) ?>" required/>
                </div>
            </div>
        </div>

        <div class="flex gap-4">
            <button type="submit" class="btn-primary px-8 py-3 flex items-center gap-2">
                <span class="material-symbols-outlined text-lg">save</span>
                Save Changes
            </button>
            <a href="<?= APP_URL ?>/index.php?route=results" class="btn-ghost px-6 py-3">Cancel</a>
        </div>
    </form>
</div>
