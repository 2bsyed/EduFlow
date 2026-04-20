<?php $pageTitle = 'Teachers'; $currentRoute = 'teachers'; ?>
<div class="p-10">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
            <h2 class="text-4xl font-extrabold text-on-surface tracking-tight mb-1">Teacher Management</h2>
            <p class="text-on-surface-variant">View and manage enrolled teachers and their credentials.</p>
        </div>
        <a href="<?= APP_URL ?>/index.php?route=teachers.create" 
           class="btn-primary flex items-center gap-2 px-6 py-2.5">
            <span class="material-symbols-outlined text-lg">person_add</span> Enrol Teacher
        </a>
    </div>

    <!-- Filters + Table -->
    <div class="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div class="p-5 bg-surface-container-low flex flex-wrap gap-4 items-end">
            <form method="GET" action="<?= APP_URL ?>/index.php" class="flex flex-wrap gap-4 items-end w-full">
                <input type="hidden" name="route" value="teachers"/>
                <div class="flex-1 min-w-[250px]">
                    <label class="filter-label">Search</label>
                    <input type="text" name="search" class="filter-input w-full"
                           placeholder="Teacher name, user id, or phone..."
                           value="<?= htmlspecialchars($filters['search']) ?>"/>
                </div>
                <button type="submit" class="btn-primary px-4 py-2 text-sm h-[42px]">Search</button>
            </form>
        </div>

        <table class="w-full text-left">
            <thead class="bg-surface-container-low">
                <tr>
                    <th class="table-th text-center w-16">Profile</th>
                    <th class="table-th">Teacher Details</th>
                    <th class="table-th">Contact</th>
                    <th class="table-th">System Status</th>
                    <th class="table-th text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/10">
                <?php if (empty($result['data'])): ?>
                <tr>
                    <td colspan="5" class="px-6 py-16 text-center text-on-surface-variant">
                        <span class="material-symbols-outlined text-5xl opacity-30 block mb-3">group_off</span>
                        <p class="text-sm">No teachers found in the system.</p>
                    </td>
                </tr>
                <?php else: ?>
                <?php foreach ($result['data'] as $tea): ?>
                <tr class="table-row group">
                    <td class="px-6 py-4 text-center">
                        <div class="w-10 h-10 rounded-full bg-primary-fixed text-primary-fixed-variant flex items-center justify-center font-extrabold text-sm mx-auto">
                            <?= strtoupper(substr($tea['name'], 0, 1)) ?>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <p class="font-bold text-sm text-on-surface"><?= htmlspecialchars($tea['name']) ?></p>
                        <p class="text-xs text-on-surface-variant bg-surface-container-high inline-block px-1.5 py-0.5 rounded mt-1">ID: <?= htmlspecialchars($tea['username']) ?></p>
                    </td>
                    <td class="px-6 py-4">
                        <?php if ($tea['phone']): ?>
                        <p class="text-sm text-on-surface flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm opacity-60">call</span>
                            <?= htmlspecialchars($tea['phone']) ?>
                        </p>
                        <?php endif; ?>
                        <?php if ($tea['email']): ?>
                        <p class="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                            <span class="material-symbols-outlined text-sm opacity-60">mail</span>
                            <?= htmlspecialchars($tea['email']) ?>
                        </p>
                        <?php endif; ?>
                    </td>
                    <td class="px-6 py-4">
                        <?php if ($tea['status'] === 'active'): ?>
                            <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold text-green-700 bg-green-100">
                                Active Account
                            </span>
                        <?php else: ?>
                            <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-700 bg-amber-100">
                                Locked
                            </span>
                        <?php endif; ?>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex justify-end gap-2">
                            <a href="<?= APP_URL ?>/index.php?route=teachers.edit&id=<?= $tea['id'] ?>" class="btn-ghost text-primary opacity-0 group-hover:opacity-100 transition-opacity p-2 border border-outline-variant/30 rounded-lg bg-surface-container hover:bg-surface-container-high">
                                <span class="material-symbols-outlined text-[18px]">edit</span>
                            </a>
                            <form method="POST" action="<?= APP_URL ?>/index.php?route=teachers.delete" class="inline" onsubmit="return confirm('Are you sure you want to archive this teacher?');">
                                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>
                                <input type="hidden" name="id" value="<?= $tea['id'] ?>"/>
                                <button type="submit" class="btn-ghost text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity p-2 border border-outline-variant/30 rounded-lg bg-surface-container hover:bg-surface-container-high" title="Archive">
                                    <span class="material-symbols-outlined text-[18px]">archive</span>
                                </button>
                            </form>
                            <form method="POST" action="<?= APP_URL ?>/index.php?route=teachers.destroy" class="inline" onsubmit="return confirm('WARNING: This action is permanent and irrevocably deletes all linked records for this teacher! Are you absolutely sure?');">
                                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>
                                <input type="hidden" name="id" value="<?= $tea['id'] ?>"/>
                                <button type="submit" class="btn-ghost text-error opacity-0 group-hover:opacity-100 transition-opacity p-2 border border-error/30 rounded-lg bg-error-container/20 hover:bg-error-container/40" title="Permanently Delete">
                                    <span class="material-symbols-outlined text-[18px]">delete_forever</span>
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>
                <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    <?php if (($result['total_pages'] ?? 0) > 1): ?>
    <div class="mt-6 flex justify-between items-center bg-surface-container-lowest p-4 rounded-xl shadow-sm">
        <p class="text-sm text-on-surface-variant">
            Showing page <span class="font-bold text-on-surface"><?= $result['current_page'] ?></span> of <span class="font-bold text-on-surface"><?= $result['total_pages'] ?></span>
            <span class="opacity-50">|</span> Total Results: <?= $result['total'] ?>
        </p>
        <div class="flex gap-2">
            <?php if ($result['current_page'] > 1): ?>
                <a href="<?= APP_URL ?>/index.php?route=teachers&page=<?= $result['current_page'] - 1 ?>&search=<?= urlencode($filters['search']) ?>"
                   class="btn-ghost px-4 py-2 border border-outline-variant/30 rounded-lg text-sm text-on-surface hover:bg-surface-container-highest">
                   Previous
                </a>
            <?php endif; ?>
            <?php if ($result['current_page'] < $result['total_pages']): ?>
                <a href="<?= APP_URL ?>/index.php?route=teachers&page=<?= $result['current_page'] + 1 ?>&search=<?= urlencode($filters['search']) ?>"
                   class="btn-ghost px-4 py-2 border border-outline-variant/30 rounded-lg text-sm text-on-surface hover:bg-surface-container-highest">
                   Next
                </a>
            <?php endif; ?>
        </div>
    </div>
    <?php endif; ?>
</div>
