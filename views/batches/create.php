<?php
$isEdit = !empty($batch);
$pageTitle = $isEdit ? 'Edit Batch' : 'Create Batch';
$currentRoute = 'batches';
$action = $isEdit ? APP_URL . '/index.php?route=batches.update' : APP_URL . '/index.php?route=batches.store';
?>
<div class="p-10 max-w-2xl">
    <div class="mb-8">
        <a href="<?= APP_URL ?>/index.php?route=batches"
           class="text-sm text-on-surface-variant hover:text-primary flex items-center gap-1 mb-4">
            <span class="material-symbols-outlined text-sm">arrow_back</span> Back to Batches
        </a>
        <h2 class="text-3xl font-extrabold text-on-surface">
            <?= $isEdit ? 'Edit: ' . htmlspecialchars($batch['name']) : 'Create New Batch' ?>
        </h2>
    </div>

    <?php if (!empty($flash['error'])): ?>
    <div class="form-error-banner mb-6"><?= htmlspecialchars($flash['error']) ?></div>
    <?php endif; ?>

    <form method="POST" action="<?= $action ?>" class="space-y-6">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>
        <?php if ($isEdit): ?>
        <input type="hidden" name="id" value="<?= $batch['id'] ?>"/>
        <?php endif; ?>

        <div class="form-card">
            <h3 class="form-section-title">Batch Details</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="form-group md:col-span-2">
                    <label class="form-label" for="name">Batch Name *</label>
                    <input type="text" id="name" name="name" class="form-input"
                           placeholder="e.g. Morning A-1"
                           value="<?= htmlspecialchars($batch['name'] ?? '') ?>" required/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="subject">Subject *</label>
                    <input type="text" id="subject" name="subject" class="form-input"
                           placeholder="e.g. Mathematics"
                           value="<?= htmlspecialchars($batch['subject'] ?? '') ?>" required/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="teacher_id">Assign Teacher</label>
                    <select id="teacher_id" name="teacher_id" class="form-input searchable-select">
                        <option value="">— No Teacher —</option>
                        <?php foreach ($teachers as $teacher): ?>
                        <option value="<?= $teacher['id'] ?>"
                                <?= (($batch['teacher_id'] ?? '') == $teacher['id']) ? 'selected' : '' ?>>
                            <?= htmlspecialchars($teacher['name']) ?>
                        </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="schedule">Schedule</label>
                    <input type="text" id="schedule" name="schedule" class="form-input"
                           placeholder="Mon-Fri 7:00–9:00 AM"
                           value="<?= htmlspecialchars($batch['schedule'] ?? '') ?>"/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="room">Room / Location</label>
                    <input type="text" id="room" name="room" class="form-input"
                           placeholder="Room 101 / Online"
                           value="<?= htmlspecialchars($batch['room'] ?? '') ?>"/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="capacity">Capacity</label>
                    <input type="number" id="capacity" name="capacity" class="form-input"
                           min="1" max="200"
                           value="<?= (int)($batch['capacity'] ?? 30) ?>"/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="fee_amount">Monthly Fee (<?= APP_CURRENCY ?>)</label>
                    <input type="number" id="fee_amount" name="fee_amount" class="form-input"
                           min="0" step="0.01"
                           value="<?= number_format((float)($batch['fee_amount'] ?? 0), 2, '.', '') ?>"/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="start_date">Start Date</label>
                    <input type="date" id="start_date" name="start_date" class="form-input"
                           value="<?= htmlspecialchars($batch['start_date'] ?? '') ?>"/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="end_date">End Date</label>
                    <input type="date" id="end_date" name="end_date" class="form-input"
                           value="<?= htmlspecialchars($batch['end_date'] ?? '') ?>"/>
                </div>
                <?php if ($isEdit): ?>
                <div class="form-group">
                    <label class="form-label" for="status">Status</label>
                    <select id="status" name="status" class="form-input">
                        <option value="active"    <?= ($batch['status'] === 'active') ? 'selected' : '' ?>>Active</option>
                        <option value="completed" <?= ($batch['status'] === 'completed') ? 'selected' : '' ?>>Completed</option>
                        <option value="cancelled" <?= ($batch['status'] === 'cancelled') ? 'selected' : '' ?>>Cancelled</option>
                    </select>
                </div>
                <?php endif; ?>
            </div>
        </div>

        <div class="flex gap-4">
            <button type="submit" class="btn-primary px-8 py-3 flex items-center gap-2">
                <span class="material-symbols-outlined text-lg"><?= $isEdit ? 'save' : 'add' ?></span>
                <?= $isEdit ? 'Save Changes' : 'Create Batch' ?>
            </button>
            <a href="<?= APP_URL ?>/index.php?route=batches" class="btn-ghost px-6 py-3">Cancel</a>
        </div>
    </form>
</div>
