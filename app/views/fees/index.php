<?php $pageTitle = 'Fees'; $currentRoute = 'fees'; ?>
<div class="p-10">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
            <h2 class="text-4xl font-extrabold text-on-surface tracking-tight mb-1">Fee Management</h2>
            <p class="text-on-surface-variant">Track payments, dues, and generate receipts.</p>
        </div>
        <?php if (in_array($_SESSION['user']['role'] ?? '', ['owner'])): ?>
        <a href="<?= APP_URL ?>/index.php?route=fees.create"
           class="btn-primary flex items-center gap-2 px-6 py-2.5">
            <span class="material-symbols-outlined text-lg">add</span>
            Add Fee Record
        </a>
        <?php endif; ?>
    </div>

    <!-- Stats Row -->
    <?php if (($_SESSION['user']['role'] ?? '') !== 'student'): ?>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div class="stat-card">
            <h3 class="stat-label">Total Collected</h3>
            <p class="text-3xl font-extrabold text-secondary mt-1">
                <?= APP_CURRENCY ?><?= number_format($totalRevenue, 0) ?>
            </p>
            <p class="text-xs text-on-surface-variant mt-1">All-time paid fees</p>
        </div>
        <div class="stat-card">
            <h3 class="stat-label">Pending / Overdue</h3>
            <p class="text-3xl font-extrabold text-error mt-1">
                <?= APP_CURRENCY ?><?= number_format($totalPending, 0) ?>
            </p>
            <p class="text-xs text-on-surface-variant mt-1">
                <?= $statusSummary['due']['cnt'] ?? 0 ?> due • <?= $statusSummary['overdue']['cnt'] ?? 0 ?> overdue
            </p>
        </div>
        <div class="stat-card">
            <h3 class="stat-label">Total Records</h3>
            <p class="text-3xl font-extrabold text-primary mt-1">
                <?= number_format($result['total']) ?>
            </p>
            <p class="text-xs text-on-surface-variant mt-1">Across all batches</p>
        </div>
    </div>
    <?php else: ?>
    <!-- Student specific summary -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div class="stat-card border-b-4 border-b-[#137333]">
            <h3 class="stat-label">Total Paid</h3>
            <p class="text-3xl font-extrabold text-[#137333] mt-1">
                <?= APP_CURRENCY ?><?= number_format($totalRevenue, 0) ?>
            </p>
        </div>
        <div class="stat-card border-b-4 border-b-[#950029]">
            <h3 class="stat-label">Total Dues</h3>
            <p class="text-3xl font-extrabold text-[#950029] mt-1">
                <?= APP_CURRENCY ?><?= number_format($totalPending, 0) ?>
            </p>
        </div>
    </div>
    <?php endif; ?>

    <!-- Filters -->
    <div class="bg-surface-container-lowest rounded-xl p-5 flex flex-wrap gap-4 items-end mb-6 shadow-sm">
        <form method="GET" action="<?= APP_URL ?>/index.php" class="flex flex-wrap gap-4 items-end flex-1">
            <input type="hidden" name="route" value="fees"/>
            <?php if (($_SESSION['user']['role'] ?? '') !== 'student'): ?>
            <div class="flex-1 min-w-[220px]">
                <label class="filter-label">Search Student</label>
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
                    <input type="text" name="search" class="filter-input pl-10"
                           placeholder="Name or roll no..."
                           value="<?= htmlspecialchars($filters['search']) ?>"/>
                </div>
            </div>
            <?php endif; ?>
            <div>
                <label class="filter-label">Filter by Status</label>
                <div class="flex gap-2 flex-wrap">
                    <?php $statuses = ['' => 'All', 'due' => 'Due', 'paid' => 'Paid', 'overdue' => 'Overdue']; ?>
                    <?php foreach ($statuses as $val => $label): ?>
                    <button type="submit" name="status" value="<?= $val ?>"
                            class="status-btn <?= ($filters['status'] === $val) ? 'status-btn--active' : '' ?>">
                        <?= $label ?>
                    </button>
                    <?php endforeach; ?>
                </div>
            </div>
        </form>
    </div>

    <!-- Fee Table -->
    <div class="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
        <table class="w-full text-left">
            <thead class="bg-surface-container-low sticky top-0">
                <tr>
                    <th class="table-th">Student</th>
                    <th class="table-th">Batch</th>
                    <th class="table-th">Amount</th>
                    <th class="table-th">Due Date</th>
                    <th class="table-th">Status</th>
                    <th class="table-th text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/10">
                <?php if (empty($result['data'])): ?>
                <tr>
                    <td colspan="6" class="px-6 py-16 text-center text-on-surface-variant">
                        <span class="material-symbols-outlined text-5xl opacity-30 block mb-3">payments</span>
                        <p class="text-sm">No fee records found.</p>
                    </td>
                </tr>
                <?php else: ?>
                <?php foreach ($result['data'] as $fee):
                    $statusClass = [
                        'paid'    => 'status-badge--green',
                        'due'     => 'status-badge--yellow',
                        'overdue' => 'status-badge--red',
                        'partial' => 'status-badge--neutral',
                    ][$fee['status']] ?? 'status-badge--neutral';
                ?>
                <tr class="table-row group" id="fee-row-<?= $fee['id'] ?>">
                    <td class="px-6 py-4">
                        <p class="font-bold text-sm text-on-surface"><?= htmlspecialchars($fee['student_name']) ?></p>
                        <p class="text-xs text-on-surface-variant"><?= htmlspecialchars($fee['roll_no']) ?></p>
                    </td>
                    <td class="px-6 py-4 text-sm text-on-surface-variant">
                        <?= htmlspecialchars($fee['batch_name'] ?? '—') ?>
                    </td>
                    <td class="px-6 py-4 font-bold text-on-surface">
                        <?= APP_CURRENCY ?><?= number_format($fee['amount'], 0) ?>
                    </td>
                    <td class="px-6 py-4 text-sm text-on-surface-variant">
                        <?= date('M j, Y', strtotime($fee['due_date'])) ?>
                    </td>
                    <td class="px-6 py-4">
                        <span class="status-badge <?= $statusClass ?>" id="fee-status-<?= $fee['id'] ?>">
                            <?= ucfirst($fee['status']) ?>
                        </span>
                        <?php if ($fee['receipt_no']): ?>
                        <p class="text-[10px] text-on-surface-variant mt-0.5"><?= $fee['receipt_no'] ?></p>
                        <?php endif; ?>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <?php if ($fee['status'] !== 'paid'): ?>
                            <button type="button"
                                    class="pay-btn p-2 rounded-lg text-secondary hover:bg-secondary/5 transition-colors flex items-center gap-1 text-xs font-bold"
                                    data-id="<?= $fee['id'] ?>"
                                    data-amount="<?= $fee['amount'] ?>"
                                    data-name="<?= htmlspecialchars($fee['student_name'], ENT_QUOTES) ?>"
                                    title="Mark as Paid">
                                <span class="material-symbols-outlined text-lg">check_circle</span>
                                Mark Paid
                            </button>
                            <?php endif; ?>
                        </div>
                    </td>
                </tr>
                <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>

        <!-- Pagination -->
        <?php if ($result['total_pages'] > 1): ?>
        <div class="bg-surface-container-low px-6 py-4 flex items-center justify-between">
            <p class="text-xs text-on-surface-variant">
                <?= $result['total'] ?> records
            </p>
            <div class="flex gap-1">
                <?php for ($p = 1; $p <= min(5, $result['total_pages']); $p++): ?>
                <a href="?route=fees&page=<?= $p ?>&status=<?= $filters['status'] ?>"
                   class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold
                          <?= $p === $result['current_page'] ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-highest' ?>">
                    <?= $p ?>
                </a>
                <?php endfor; ?>
            </div>
        </div>
        <?php endif; ?>
    </div>
</div>

<!-- Payment Modal -->
<div id="payment-modal" class="modal-backdrop hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-box">
        <div class="flex justify-between items-center mb-6">
            <h3 id="modal-title" class="text-lg font-bold text-on-surface">Record Payment</h3>
            <button type="button" id="close-modal"
                    class="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
        <p class="text-sm text-on-surface-variant mb-4" id="modal-student-name"></p>
        <div class="space-y-4">
            <div class="form-group">
                <label class="form-label">Amount Received (<?= APP_CURRENCY ?>)</label>
                <input type="number" id="modal-amount" class="form-input" step="0.01"/>
            </div>
            <div class="form-group">
                <label class="form-label">Payment Mode</label>
                <select id="modal-mode" class="form-input">
                    <option value="cash">Cash</option>
                    <option value="online">Online / UPI</option>
                    <option value="cheque">Cheque</option>
                    <option value="bank_transfer">Bank Transfer</option>
                </select>
            </div>
        </div>
        <div class="flex gap-3 mt-6">
            <button type="button" id="confirm-payment"
                    class="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-lg">check_circle</span>
                Confirm Payment
            </button>
            <button type="button" id="close-modal-2" class="btn-ghost flex-1 py-2.5">Cancel</button>
        </div>
    </div>
</div>

<?php $pageScripts = ['fees.js']; ?>
