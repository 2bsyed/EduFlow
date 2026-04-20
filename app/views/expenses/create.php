<?php
$pageTitle = isset($expense) ? 'Edit Expense' : 'Add Expense';
$currentRoute = 'expenses';
$isEdit = isset($expense);

$categoryLabels = [
    'teacher_salary' => 'Teacher Salary',
    'rent'           => 'Rent',
    'utilities'      => 'Utilities (Electric/Internet/Water)',
    'supplies'       => 'Supplies & Stationery',
    'maintenance'    => 'Maintenance & Repairs',
    'marketing'      => 'Marketing & Advertising',
    'other'          => 'Other',
];

// Pre-fill from GET params (for teacher salary shortcut)
$prefillCategory  = $_GET['category']   ?? ($expense['category']  ?? '');
$prefillTeacherId = $_GET['teacher_id'] ?? ($expense['teacher_id'] ?? '');
?>
<div class="p-10 max-w-3xl">
    <div class="mb-8">
        <a href="<?= APP_URL ?>/index.php?route=expenses"
           class="text-sm text-on-surface-variant hover:text-primary flex items-center gap-1 mb-4">
            <span class="material-symbols-outlined text-sm">arrow_back</span> Back to Expenses
        </a>
        <h2 class="text-3xl font-extrabold text-on-surface tracking-tight">
            <?= $isEdit ? 'Edit Expense' : 'Add New Expense' ?>
        </h2>
        <p class="text-on-surface-variant mt-1">
            <?= $isEdit ? 'Update expense details.' : 'Record a salary payment, bill, or any business expense.' ?>
        </p>
    </div>

    <form method="POST"
          action="<?= APP_URL ?>/index.php?route=<?= $isEdit ? 'expenses.update' : 'expenses.store' ?>"
          class="space-y-6">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>
        <?php if ($isEdit): ?>
        <input type="hidden" name="id" value="<?= $expense['id'] ?>"/>
        <?php endif; ?>

        <?php if (!empty($flash['error'])): ?>
        <div class="form-error-banner"><?= htmlspecialchars($flash['error']) ?></div>
        <?php endif; ?>

        <!-- Category & Title -->
        <div class="form-card">
            <h3 class="form-section-title">Expense Details</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="form-group">
                    <label class="form-label" for="category">Category *</label>
                    <select id="category" name="category" class="form-input" required onchange="toggleTeacherField()">
                        <?php foreach ($categoryLabels as $k => $v): ?>
                        <option value="<?= $k ?>" <?= $prefillCategory === $k ? 'selected' : '' ?>><?= $v ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="title">Title / Description *</label>
                    <input type="text" id="title" name="title" class="form-input"
                           value="<?= htmlspecialchars($expense['title'] ?? '') ?>"
                           placeholder="e.g., January Rent, Dr. Mehta Salary" required/>
                </div>
                <div class="form-group md:col-span-2" id="teacher-field" style="<?= $prefillCategory === 'teacher_salary' ? '' : 'display:none' ?>">
                    <label class="form-label" for="teacher_id">Teacher</label>
                    <select id="teacher_id" name="teacher_id" class="form-input">
                        <option value="">— Select Teacher —</option>
                        <?php foreach ($teachers as $t): ?>
                        <option value="<?= $t['id'] ?>" <?= (string)$prefillTeacherId === (string)$t['id'] ? 'selected' : '' ?>>
                            <?= htmlspecialchars($t['name']) ?>
                        </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group md:col-span-2">
                    <label class="form-label" for="description">Notes (optional)</label>
                    <textarea id="description" name="description" class="form-input" rows="2"
                              placeholder="Additional details about this expense"><?= htmlspecialchars($expense['description'] ?? '') ?></textarea>
                </div>
            </div>
        </div>

        <!-- Amount & Dates -->
        <div class="form-card">
            <h3 class="form-section-title">Amount & Schedule</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="form-group">
                    <label class="form-label" for="amount">Amount (<?= APP_CURRENCY ?>) *</label>
                    <input type="number" id="amount" name="amount" class="form-input" step="0.01" min="0"
                           value="<?= htmlspecialchars($expense['amount'] ?? '') ?>" placeholder="0.00" required/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="due_date">Due Date *</label>
                    <input type="date" id="due_date" name="due_date" class="form-input"
                           value="<?= htmlspecialchars($expense['due_date'] ?? date('Y-m-d')) ?>" required/>
                </div>
                <div class="form-group">
                    <label class="form-label" for="status">Status</label>
                    <select id="status" name="status" class="form-input" onchange="togglePaymentFields()">
                        <option value="pending" <?= ($expense['status'] ?? '') === 'pending' ? 'selected' : '' ?>>Pending</option>
                        <option value="paid" <?= ($expense['status'] ?? '') === 'paid' ? 'selected' : '' ?>>Paid</option>
                        <option value="overdue" <?= ($expense['status'] ?? '') === 'overdue' ? 'selected' : '' ?>>Overdue</option>
                    </select>
                </div>
                <div class="form-group" id="payment-date-field" style="<?= ($expense['status'] ?? '') === 'paid' ? '' : 'display:none' ?>">
                    <label class="form-label" for="payment_date">Payment Date</label>
                    <input type="date" id="payment_date" name="payment_date" class="form-input"
                           value="<?= htmlspecialchars($expense['payment_date'] ?? date('Y-m-d')) ?>"/>
                </div>
            </div>
        </div>

        <!-- Payment & Recurring -->
        <div class="form-card">
            <h3 class="form-section-title">Payment & Recurrence</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="form-group" id="payment-mode-field" style="<?= ($expense['status'] ?? '') === 'paid' ? '' : 'display:none' ?>">
                    <label class="form-label" for="payment_mode">Payment Mode</label>
                    <select id="payment_mode" name="payment_mode" class="form-input">
                        <option value="">— Select —</option>
                        <option value="cash" <?= ($expense['payment_mode'] ?? '') === 'cash' ? 'selected' : '' ?>>Cash</option>
                        <option value="online" <?= ($expense['payment_mode'] ?? '') === 'online' ? 'selected' : '' ?>>Online</option>
                        <option value="cheque" <?= ($expense['payment_mode'] ?? '') === 'cheque' ? 'selected' : '' ?>>Cheque</option>
                        <option value="bank_transfer" <?= ($expense['payment_mode'] ?? '') === 'bank_transfer' ? 'selected' : '' ?>>Bank Transfer</option>
                    </select>
                </div>
                <div class="form-group" id="ref-field" style="<?= ($expense['status'] ?? '') === 'paid' ? '' : 'display:none' ?>">
                    <label class="form-label" for="reference_no">Reference / Receipt No.</label>
                    <input type="text" id="reference_no" name="reference_no" class="form-input"
                           value="<?= htmlspecialchars($expense['reference_no'] ?? '') ?>" placeholder="TXN-12345"/>
                </div>
                <div class="form-group md:col-span-2">
                    <label class="flex items-center gap-3 cursor-pointer p-3 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors">
                        <input type="checkbox" id="is_recurring" name="is_recurring" value="1"
                               class="w-4 h-4 text-primary rounded focus:ring-primary border-outline"
                               <?= ($expense['is_recurring'] ?? 0) ? 'checked' : '' ?>
                               onchange="toggleRecurringField()"/>
                        <div>
                            <span class="block text-sm font-bold text-on-surface">Recurring Expense</span>
                            <span class="block text-[11px] text-on-surface-variant">Auto-creates next cycle when paid</span>
                        </div>
                    </label>
                </div>
                <div class="form-group" id="recurring-interval-field" style="<?= ($expense['is_recurring'] ?? 0) ? '' : 'display:none' ?>">
                    <label class="form-label" for="recurring_interval">Repeat Every</label>
                    <select id="recurring_interval" name="recurring_interval" class="form-input">
                        <option value="monthly" <?= ($expense['recurring_interval'] ?? '') === 'monthly' ? 'selected' : '' ?>>Monthly</option>
                        <option value="quarterly" <?= ($expense['recurring_interval'] ?? '') === 'quarterly' ? 'selected' : '' ?>>Quarterly</option>
                        <option value="yearly" <?= ($expense['recurring_interval'] ?? '') === 'yearly' ? 'selected' : '' ?>>Yearly</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="flex items-center gap-4">
            <button type="submit" class="btn-primary px-8 py-3 flex items-center gap-2">
                <span class="material-symbols-outlined text-lg"><?= $isEdit ? 'save' : 'add_circle' ?></span>
                <?= $isEdit ? 'Save Changes' : 'Record Expense' ?>
            </button>
            <a href="<?= APP_URL ?>/index.php?route=expenses" class="btn-ghost px-6 py-3">Cancel</a>
        </div>
    </form>
</div>

<script>
function toggleTeacherField() {
    const cat = document.getElementById('category').value;
    document.getElementById('teacher-field').style.display = cat === 'teacher_salary' ? '' : 'none';
}
function togglePaymentFields() {
    const isPaid = document.getElementById('status').value === 'paid';
    document.getElementById('payment-date-field').style.display = isPaid ? '' : 'none';
    document.getElementById('payment-mode-field').style.display = isPaid ? '' : 'none';
    document.getElementById('ref-field').style.display = isPaid ? '' : 'none';
}
function toggleRecurringField() {
    const isRecurring = document.getElementById('is_recurring').checked;
    document.getElementById('recurring-interval-field').style.display = isRecurring ? '' : 'none';
}
</script>
