<?php
$pageTitle = 'Expenses';
$currentRoute = 'expenses';
$activeTab = $tab ?? 'all';

$categoryLabels = [
    'teacher_salary' => 'Teacher Salary',
    'rent'           => 'Rent',
    'utilities'      => 'Utilities',
    'supplies'       => 'Supplies',
    'maintenance'    => 'Maintenance',
    'marketing'      => 'Marketing',
    'other'          => 'Other',
];

$categoryIcons = [
    'teacher_salary' => 'school',
    'rent'           => 'home',
    'utilities'      => 'bolt',
    'supplies'       => 'inventory_2',
    'maintenance'    => 'build',
    'marketing'      => 'campaign',
    'other'          => 'receipt_long',
];

$categoryColors = [
    'teacher_salary' => 'text-purple-700 bg-purple-50 border-purple-200',
    'rent'           => 'text-blue-700 bg-blue-50 border-blue-200',
    'utilities'      => 'text-amber-700 bg-amber-50 border-amber-200',
    'supplies'       => 'text-teal-700 bg-teal-50 border-teal-200',
    'maintenance'    => 'text-orange-700 bg-orange-50 border-orange-200',
    'marketing'      => 'text-pink-700 bg-pink-50 border-pink-200',
    'other'          => 'text-gray-700 bg-gray-50 border-gray-200',
];
?>
<div class="p-10">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
            <h2 class="text-4xl font-extrabold text-on-surface tracking-tight mb-1">Expenses</h2>
            <p class="text-on-surface-variant">Track salaries, bills, and all business expenses.</p>
        </div>
        <a href="<?= APP_URL ?>/index.php?route=expenses.create"
           class="btn-primary flex items-center gap-2 px-6 py-2.5">
            <span class="material-symbols-outlined text-lg">add</span>
            Add Expense
        </a>
    </div>

    <?php if (!empty($flash['success'])): ?>
    <div class="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium flex items-center gap-2">
        <span class="material-symbols-outlined text-green-600">check_circle</span>
        <?= htmlspecialchars($flash['success']) ?>
    </div>
    <?php endif; ?>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <div class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-5">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <span class="material-symbols-outlined text-blue-600">account_balance_wallet</span>
                </div>
                <p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Expenses</p>
            </div>
            <p class="text-2xl font-extrabold text-on-surface"><?= APP_CURRENCY ?><?= number_format($summary['total_expenses'], 0) ?></p>
        </div>
        <div class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-5">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <span class="material-symbols-outlined text-green-600">check_circle</span>
                </div>
                <p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Paid</p>
            </div>
            <p class="text-2xl font-extrabold text-green-700"><?= APP_CURRENCY ?><?= number_format($summary['total_paid'], 0) ?></p>
        </div>
        <div class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-5">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <span class="material-symbols-outlined text-red-600">pending</span>
                </div>
                <p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pending / Overdue</p>
            </div>
            <p class="text-2xl font-extrabold text-red-600"><?= APP_CURRENCY ?><?= number_format($summary['total_pending'], 0) ?></p>
            <?php if ($summary['overdue_count'] > 0): ?>
            <p class="text-xs text-red-500 mt-1"><?= $summary['overdue_count'] ?> overdue</p>
            <?php endif; ?>
        </div>
        <div class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-5">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <span class="material-symbols-outlined text-purple-600">calendar_month</span>
                </div>
                <p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">This Month</p>
            </div>
            <p class="text-2xl font-extrabold text-on-surface"><?= APP_CURRENCY ?><?= number_format($monthlyTotal, 0) ?></p>
        </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 bg-surface-container-low rounded-xl p-1 w-fit">
        <?php
        $tabs = [
            'all'       => ['icon' => 'list',       'label' => 'All Expenses'],
            'salaries'  => ['icon' => 'school',     'label' => 'Teacher Salaries'],
            'recurring' => ['icon' => 'autorenew',  'label' => 'Recurring Bills'],
            'breakdown' => ['icon' => 'pie_chart',  'label' => 'Category Breakdown'],
        ];
        foreach ($tabs as $key => $t):
            $isActive = $activeTab === $key;
        ?>
        <a href="<?= APP_URL ?>/index.php?route=expenses&tab=<?= $key ?>"
           class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors
                  <?= $isActive ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high' ?>">
            <span class="material-symbols-outlined text-base"><?= $t['icon'] ?></span>
            <?= $t['label'] ?>
        </a>
        <?php endforeach; ?>
    </div>

    <!-- Tab: All Expenses -->
    <?php if ($activeTab === 'all'): ?>
    <!-- Filters -->
    <form method="GET" class="flex flex-wrap gap-3 mb-6">
        <input type="hidden" name="route" value="expenses"/>
        <input type="hidden" name="tab" value="all"/>
        <select name="category" class="form-input w-44 text-sm" onchange="this.form.submit()">
            <option value="">All Categories</option>
            <?php foreach ($categoryLabels as $k => $v): ?>
            <option value="<?= $k ?>" <?= ($filters['category'] ?? '') === $k ? 'selected' : '' ?>><?= $v ?></option>
            <?php endforeach; ?>
        </select>
        <select name="status" class="form-input w-36 text-sm" onchange="this.form.submit()">
            <option value="">All Status</option>
            <option value="paid" <?= ($filters['status'] ?? '') === 'paid' ? 'selected' : '' ?>>Paid</option>
            <option value="pending" <?= ($filters['status'] ?? '') === 'pending' ? 'selected' : '' ?>>Pending</option>
            <option value="overdue" <?= ($filters['status'] ?? '') === 'overdue' ? 'selected' : '' ?>>Overdue</option>
        </select>
        <input type="text" name="search" value="<?= htmlspecialchars($filters['search'] ?? '') ?>"
               class="form-input w-60 text-sm" placeholder="Search expenses..."/>
        <button class="btn-primary px-4 py-2 text-sm">Filter</button>
    </form>

    <!-- Expense Table -->
    <?php if (empty($result['data'])): ?>
    <div class="text-center py-16 text-on-surface-variant">
        <span class="material-symbols-outlined text-5xl opacity-20 block mb-3">receipt_long</span>
        <p class="font-medium">No expenses found</p>
    </div>
    <?php else: ?>
    <div class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <table class="w-full text-sm">
            <thead class="bg-surface-container-low">
                <tr>
                    <th class="text-left px-5 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Expense</th>
                    <th class="text-left px-5 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Category</th>
                    <th class="text-right px-5 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Amount</th>
                    <th class="text-left px-5 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Due Date</th>
                    <th class="text-center px-5 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                    <th class="text-right px-5 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/20">
                <?php foreach ($result['data'] as $exp):
                    $catColor = $categoryColors[$exp['category']] ?? $categoryColors['other'];
                    $statusBadge = match($exp['status']) {
                        'paid'    => 'bg-green-100 text-green-800',
                        'pending' => 'bg-amber-100 text-amber-800',
                        'overdue' => 'bg-red-100 text-red-800',
                        default   => 'bg-gray-100 text-gray-800',
                    };
                ?>
                <tr class="hover:bg-surface-container-low/50 transition-colors">
                    <td class="px-5 py-4">
                        <p class="font-bold text-on-surface"><?= htmlspecialchars($exp['title']) ?></p>
                        <?php if ($exp['teacher_name']): ?>
                        <p class="text-xs text-on-surface-variant mt-0.5">
                            <span class="material-symbols-outlined text-xs align-middle">person</span>
                            <?= htmlspecialchars($exp['teacher_name']) ?>
                        </p>
                        <?php endif; ?>
                        <?php if ($exp['is_recurring']): ?>
                        <span class="inline-flex items-center gap-1 text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-full mt-1 font-bold">
                            <span class="material-symbols-outlined text-[10px]">autorenew</span>
                            <?= ucfirst($exp['recurring_interval']) ?>
                        </span>
                        <?php endif; ?>
                    </td>
                    <td class="px-5 py-4">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border <?= $catColor ?>">
                            <span class="material-symbols-outlined text-xs"><?= $categoryIcons[$exp['category']] ?? 'receipt_long' ?></span>
                            <?= $categoryLabels[$exp['category']] ?? 'Other' ?>
                        </span>
                    </td>
                    <td class="px-5 py-4 text-right font-bold text-on-surface">
                        <?= APP_CURRENCY ?><?= number_format($exp['amount'], 2) ?>
                    </td>
                    <td class="px-5 py-4 text-on-surface-variant"><?= htmlspecialchars($exp['due_date']) ?></td>
                    <td class="px-5 py-4 text-center">
                        <span class="inline-block px-2.5 py-1 rounded-full text-xs font-bold <?= $statusBadge ?>">
                            <?= ucfirst($exp['status']) ?>
                        </span>
                    </td>
                    <td class="px-5 py-4 text-right">
                        <div class="flex items-center justify-end gap-1">
                            <?php if ($exp['status'] !== 'paid'): ?>
                            <form method="POST" action="<?= APP_URL ?>/index.php?route=expenses.markPaid" class="inline">
                                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>
                                <input type="hidden" name="id" value="<?= $exp['id'] ?>"/>
                                <input type="hidden" name="payment_mode" value="cash"/>
                                <button type="submit" class="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Mark Paid"
                                        onclick="return confirm('Mark this expense as paid?')">
                                    <span class="material-symbols-outlined text-lg">check_circle</span>
                                </button>
                            </form>
                            <?php endif; ?>
                            <a href="<?= APP_URL ?>/index.php?route=expenses.edit&id=<?= $exp['id'] ?>"
                               class="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors" title="Edit">
                                <span class="material-symbols-outlined text-lg">edit</span>
                            </a>
                            <form method="POST" action="<?= APP_URL ?>/index.php?route=expenses.delete"
                                  onsubmit="return confirm('Delete this expense?')" class="inline">
                                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>
                                <input type="hidden" name="id" value="<?= $exp['id'] ?>"/>
                                <button type="submit" class="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/5 transition-colors" title="Delete">
                                    <span class="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    <?php if ($result['total_pages'] > 1): ?>
    <div class="mt-6 flex justify-center gap-2">
        <?php for ($p = 1; $p <= $result['total_pages']; $p++): ?>
        <a href="?route=expenses&tab=all&page=<?= $p ?>&category=<?= urlencode($filters['category'] ?? '') ?>&status=<?= urlencode($filters['status'] ?? '') ?>"
           class="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-colors
                  <?= $p === $result['current_page'] ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high' ?>">
            <?= $p ?>
        </a>
        <?php endfor; ?>
    </div>
    <?php endif; ?>
    <?php endif; ?>
    <?php endif; ?>

    <!-- Tab: Teacher Salaries -->
    <?php if ($activeTab === 'salaries'): ?>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <?php if (empty($salaries)): ?>
        <div class="col-span-full text-center py-16 text-on-surface-variant">
            <span class="material-symbols-outlined text-5xl opacity-20 block mb-3">school</span>
            <p class="font-medium">No teachers found</p>
        </div>
        <?php else: ?>
        <?php foreach ($salaries as $sal): ?>
        <div class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
            <div class="h-1.5 bg-gradient-to-r from-purple-500 to-purple-300"></div>
            <div class="p-6">
                <div class="flex items-center gap-3 mb-5">
                    <div class="w-11 h-11 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                        <?= strtoupper(substr($sal['teacher_name'], 0, 1)) ?>
                    </div>
                    <div>
                        <h3 class="font-bold text-on-surface"><?= htmlspecialchars($sal['teacher_name']) ?></h3>
                        <p class="text-xs text-on-surface-variant">Teacher</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 mb-4">
                    <div class="bg-surface-container-low rounded-xl p-3 text-center">
                        <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total Salary</p>
                        <p class="text-lg font-extrabold text-on-surface"><?= APP_CURRENCY ?><?= number_format($sal['total_salary'], 0) ?></p>
                    </div>
                    <div class="bg-green-50 rounded-xl p-3 text-center">
                        <p class="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1">Paid</p>
                        <p class="text-lg font-extrabold text-green-700"><?= APP_CURRENCY ?><?= number_format($sal['paid_salary'], 0) ?></p>
                    </div>
                </div>

                <?php if ($sal['pending_salary'] > 0): ?>
                <div class="bg-red-50 border border-red-100 rounded-xl p-3 text-center mb-4">
                    <p class="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Pending</p>
                    <p class="text-xl font-extrabold text-red-600"><?= APP_CURRENCY ?><?= number_format($sal['pending_salary'], 0) ?></p>
                </div>
                <?php else: ?>
                <div class="bg-green-50 border border-green-100 rounded-xl p-3 text-center mb-4">
                    <p class="text-sm font-bold text-green-700 flex items-center justify-center gap-1">
                        <span class="material-symbols-outlined text-sm">check_circle</span>
                        All Paid
                    </p>
                </div>
                <?php endif; ?>

                <?php if ($sal['last_paid_date']): ?>
                <p class="text-xs text-on-surface-variant text-center">Last paid: <?= $sal['last_paid_date'] ?></p>
                <?php endif; ?>

                <a href="<?= APP_URL ?>/index.php?route=expenses.create&category=teacher_salary&teacher_id=<?= $sal['teacher_id'] ?>"
                   class="mt-4 w-full btn-primary px-4 py-2 text-sm flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-sm">add</span>
                    Record Salary Payment
                </a>
            </div>
        </div>
        <?php endforeach; ?>
        <?php endif; ?>
    </div>
    <?php endif; ?>

    <!-- Tab: Recurring Bills -->
    <?php if ($activeTab === 'recurring'): ?>
    <?php if (empty($recurring)): ?>
    <div class="text-center py-16 text-on-surface-variant">
        <span class="material-symbols-outlined text-5xl opacity-20 block mb-3">autorenew</span>
        <p class="font-medium">No pending recurring bills</p>
        <a href="<?= APP_URL ?>/index.php?route=expenses.create"
           class="mt-4 inline-flex btn-primary px-6 py-2.5 items-center gap-2 text-sm">
            <span class="material-symbols-outlined text-sm">add</span> Add Recurring Expense
        </a>
    </div>
    <?php else: ?>
    <div class="space-y-4">
        <?php foreach ($recurring as $rec):
            $catColor = $categoryColors[$rec['category']] ?? $categoryColors['other'];
            $daysUntil = (int)((strtotime($rec['due_date']) - time()) / 86400);
            $urgency = $daysUntil < 0 ? 'bg-red-50 border-red-200' : ($daysUntil <= 7 ? 'bg-amber-50 border-amber-200' : 'bg-surface-container-lowest border-outline-variant/30');
        ?>
        <div class="<?= $urgency ?> rounded-2xl shadow-sm border p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-purple-600">autorenew</span>
                </div>
                <div>
                    <h4 class="font-bold text-on-surface"><?= htmlspecialchars($rec['title']) ?></h4>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border <?= $catColor ?>">
                            <?= $categoryLabels[$rec['category']] ?? 'Other' ?>
                        </span>
                        <span class="text-xs text-on-surface-variant">
                            <?= ucfirst($rec['recurring_interval']) ?> · Due <?= $rec['due_date'] ?>
                        </span>
                    </div>
                    <?php if ($daysUntil < 0): ?>
                    <p class="text-xs text-red-600 font-bold mt-1"><?= abs($daysUntil) ?> days overdue!</p>
                    <?php elseif ($daysUntil <= 7): ?>
                    <p class="text-xs text-amber-600 font-bold mt-1">Due in <?= $daysUntil ?> day<?= $daysUntil !== 1 ? 's' : '' ?></p>
                    <?php endif; ?>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <p class="text-xl font-extrabold text-on-surface"><?= APP_CURRENCY ?><?= number_format($rec['amount'], 0) ?></p>
                <form method="POST" action="<?= APP_URL ?>/index.php?route=expenses.markPaid">
                    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>
                    <input type="hidden" name="id" value="<?= $rec['id'] ?>"/>
                    <input type="hidden" name="payment_mode" value="cash"/>
                    <button type="submit" class="btn-primary px-4 py-2 text-sm flex items-center gap-2"
                            onclick="return confirm('Pay and renew this recurring bill?')">
                        <span class="material-symbols-outlined text-sm">check_circle</span>
                        Pay & Renew
                    </button>
                </form>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
    <?php endif; ?>
    <?php endif; ?>

    <!-- Tab: Category Breakdown -->
    <?php if ($activeTab === 'breakdown'): ?>
    <?php if (empty($breakdown)): ?>
    <div class="text-center py-16 text-on-surface-variant">
        <span class="material-symbols-outlined text-5xl opacity-20 block mb-3">pie_chart</span>
        <p class="font-medium">No expense data available</p>
    </div>
    <?php else: ?>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <?php
        $grandTotal = array_sum(array_column($breakdown, 'total'));
        foreach ($breakdown as $cat):
            $pct = $grandTotal > 0 ? round(($cat['total'] / $grandTotal) * 100, 1) : 0;
            $catColor = $categoryColors[$cat['category']] ?? $categoryColors['other'];
        ?>
        <a href="<?= APP_URL ?>/index.php?route=expenses&tab=all&category=<?= urlencode($cat['category']) ?>"
           class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-6 block hover:shadow-md hover:translate-y-[-3px] transition-all duration-200 cursor-pointer group relative">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-11 h-11 rounded-xl flex items-center justify-center <?= $catColor ?>">
                        <span class="material-symbols-outlined"><?= $categoryIcons[$cat['category']] ?? 'receipt_long' ?></span>
                    </div>
                    <div>
                        <h4 class="font-bold text-on-surface"><?= $categoryLabels[$cat['category']] ?? ucfirst($cat['category']) ?></h4>
                        <p class="text-xs text-on-surface-variant"><?= $cat['count'] ?> transaction<?= $cat['count'] > 1 ? 's' : '' ?></p>
                    </div>
                </div>
                <span class="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
            </div>
            <p class="text-2xl font-extrabold text-on-surface mb-3"><?= APP_CURRENCY ?><?= number_format($cat['total'], 0) ?></p>
            <div class="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden">
                <div class="h-full bg-primary rounded-full transition-all duration-500" style="width: <?= $pct ?>%"></div>
            </div>
            <div class="flex items-center justify-between mt-3">
                <p class="text-xs text-on-surface-variant"><?= $pct ?>% of total expenses</p>
                <span onclick="event.preventDefault(); event.stopPropagation(); window.location.href='<?= APP_URL ?>/index.php?route=expenses.create&category=<?= urlencode($cat['category']) ?>';"
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                      title="Add <?= $categoryLabels[$cat['category']] ?? '' ?> expense">
                    <span class="material-symbols-outlined text-xs">add</span> Add
                </span>
            </div>
        </a>
        <?php endforeach; ?>
    </div>
    <?php endif; ?>
    <?php endif; ?>
</div>
