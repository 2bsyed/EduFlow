<?php $pageTitle = 'My Attendance'; $currentRoute = 'attendance'; ?>
<div class="p-10">
    <div class="mb-8">
        <h2 class="text-4xl font-extrabold text-on-surface tracking-tight mb-1">My Attendance</h2>
        <p class="text-on-surface-variant">Review your class attendance history and daily metrics.</p>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        <div class="stat-card">
            <h3 class="stat-label flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-primary-fixed block"></span> Total Classes</h3>
            <p class="text-3xl font-extrabold text-on-surface mt-1">
                <?= $summary['total'] ?>
            </p>
        </div>
        <div class="stat-card border-b-4 border-b-[#137333]">
            <h3 class="stat-label">Present</h3>
            <p class="text-3xl font-extrabold text-[#137333] mt-1">
                <?= $summary['present'] ?>
            </p>
        </div>
        <div class="stat-card border-b-4 border-b-[#950029]">
            <h3 class="stat-label">Absent</h3>
            <p class="text-3xl font-extrabold text-[#950029] mt-1">
                <?= $summary['absent'] ?>
            </p>
        </div>
        <div class="stat-card border-b-4 border-b-[#b05d00]">
            <h3 class="stat-label">Late</h3>
            <p class="text-3xl font-extrabold text-[#b05d00] mt-1">
                <?= $summary['late'] ?>
            </p>
        </div>
    </div>

    <!-- History Table -->
    <div class="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
        <table class="w-full text-left">
            <thead class="bg-surface-container-low sticky top-0">
                <tr>
                    <th class="table-th">Date</th>
                    <th class="table-th">Batch</th>
                    <th class="table-th">Subject</th>
                    <th class="table-th">Status</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/10">
                <?php if (empty($history['data'])): ?>
                <tr>
                    <td colspan="4" class="px-6 py-16 text-center text-on-surface-variant">
                        <span class="material-symbols-outlined text-5xl opacity-30 block mb-3">event_busy</span>
                        <p class="text-sm">No attendance records found yet.</p>
                    </td>
                </tr>
                <?php else: ?>
                <?php foreach ($history['data'] as $rec):
                    $statusClass = [
                        'present'    => 'status-badge--green',
                        'absent'     => 'status-badge--red',
                        'late'       => 'status-badge--yellow',
                    ][$rec['status']] ?? 'status-badge--neutral';
                ?>
                <tr class="table-row group">
                    <td class="px-6 py-4 font-bold text-sm text-on-surface">
                        <?= date('D, M j, Y', strtotime($rec['date'])) ?>
                    </td>
                    <td class="px-6 py-4 text-sm text-on-surface-variant">
                        <?= htmlspecialchars($rec['batch_name']) ?>
                    </td>
                    <td class="px-6 py-4 text-sm text-on-surface-variant">
                        <?= htmlspecialchars($rec['subject']) ?>
                    </td>
                    <td class="px-6 py-4">
                        <span class="status-badge <?= $statusClass ?>">
                            <?= ucfirst($rec['status']) ?>
                        </span>
                    </td>
                </tr>
                <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>

         <!-- Pagination -->
         <?php if (($history['total_pages'] ?? 0) > 1): ?>
        <div class="bg-surface-container-low px-6 py-4 flex items-center justify-between">
            <p class="text-xs text-on-surface-variant">
                <?= $history['total'] ?> total records
            </p>
            <div class="flex gap-1">
                <?php for ($p = 1; $p <= min(5, $history['total_pages']); $p++): ?>
                <a href="?route=attendance&page=<?= $p ?>"
                   class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold
                          <?= $p === $history['current_page'] ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-highest' ?>">
                    <?= $p ?>
                </a>
                <?php endfor; ?>
            </div>
        </div>
        <?php endif; ?>
    </div>
</div>
