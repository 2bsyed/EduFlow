<?php $pageTitle = 'Edit Student'; $currentRoute = 'students'; ?>
<div class="p-10 max-w-3xl">
    <div class="mb-8">
        <a href="<?= APP_URL ?>/index.php?route=students"
           class="text-sm text-on-surface-variant hover:text-primary flex items-center gap-1 mb-4">
            <span class="material-symbols-outlined text-sm">arrow_back</span> Back to Students
        </a>
        <h2 class="text-3xl font-extrabold text-on-surface tracking-tight">
            Edit: <?= htmlspecialchars($student['full_name']) ?>
        </h2>
    </div>

    <form method="POST" action="<?= APP_URL ?>/index.php?route=students.update" class="space-y-6">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>
        <input type="hidden" name="id" value="<?= $student['id'] ?>"/>

        <?php if (!empty($flash['error'])): ?>
        <div class="form-error-banner"><?= htmlspecialchars($flash['error']) ?></div>
        <?php endif; ?>

        <div class="form-card">
            <h3 class="form-section-title">Personal Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="form-group md:col-span-2">
                    <label class="form-label" for="full_name">Full Name *</label>
                    <input type="text" id="full_name" name="full_name" class="form-input"
                           value="<?= htmlspecialchars($student['full_name']) ?>" required/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="roll_no">Roll No *</label>
                    <input type="text" id="roll_no" name="roll_no" class="form-input"
                           value="<?= htmlspecialchars($student['roll_no']) ?>" required/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="status">Status</label>
                    <select id="status" name="status" class="form-input">
                        <option value="active" <?= $student['status'] === 'active' ? 'selected' : '' ?>>Active</option>
                        <option value="inactive" <?= $student['status'] === 'inactive' ? 'selected' : '' ?>>Inactive</option>
                        <option value="archived" <?= $student['status'] === 'archived' ? 'selected' : '' ?>>Archived</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="email">Email</label>
                    <input type="email" id="email" name="email" class="form-input"
                           value="<?= htmlspecialchars($student['email'] ?? '') ?>"/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="phone">Phone</label>
                    <input type="tel" id="phone" name="phone" class="form-input"
                           value="<?= htmlspecialchars($student['phone'] ?? '') ?>"/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="date_of_birth">Date of Birth</label>
                    <input type="date" id="date_of_birth" name="date_of_birth" class="form-input"
                           value="<?= htmlspecialchars($student['date_of_birth'] ?? '') ?>"/>
                </div>
            </div>
        </div>

        <div class="form-card">
            <h3 class="form-section-title">Batch & Guardian</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="form-group md:col-span-2">
                    <?php $assignedBatches = !empty($student['batch_ids']) ? explode(',', $student['batch_ids']) : []; ?>
                    <label class="form-label mb-3 block">Assign to Batches</label>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                        <?php if(empty($batches)): ?>
                            <p class="text-sm text-on-surface-variant">No active batches available.</p>
                        <?php else: ?>
                            <?php foreach ($batches as $batch): ?>
                            <label class="flex items-center gap-3 p-3 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors">
                                <input type="checkbox" name="batch_ids[]" value="<?= $batch['id'] ?>" 
                                       <?= in_array($batch['id'], $assignedBatches) ? 'checked' : '' ?>
                                       class="w-4 h-4 text-primary rounded focus:ring-primary border-outline">
                                <div>
                                    <span class="block text-sm font-bold text-on-surface"><?= htmlspecialchars($batch['name']) ?></span>
                                    <span class="block text-[11px] text-on-surface-variant"><?= htmlspecialchars($batch['subject']) ?></span>
                                </div>
                            </label>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="guardian_name">Guardian Name</label>
                    <input type="text" id="guardian_name" name="guardian_name" class="form-input"
                           value="<?= htmlspecialchars($student['guardian_name'] ?? '') ?>"/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="guardian_phone">Guardian Phone</label>
                    <input type="tel" id="guardian_phone" name="guardian_phone" class="form-input"
                           value="<?= htmlspecialchars($student['guardian_phone'] ?? '') ?>"/>
                </div>
                <div class="form-group md:col-span-2">
                    <label class="form-label" for="address">Address</label>
                    <textarea id="address" name="address" class="form-input" rows="2"
                    ><?= htmlspecialchars($student['address'] ?? '') ?></textarea>
                </div>
            </div>
        </div>

        <div class="flex gap-4">
            <button type="submit" class="btn-primary px-8 py-3 flex items-center gap-2">
                <span class="material-symbols-outlined text-lg">save</span>
                Save Changes
            </button>
            <a href="<?= APP_URL ?>/index.php?route=students" class="btn-ghost px-6 py-3">Cancel</a>
        </div>
    </form>
</div>
