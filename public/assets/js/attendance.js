/**
 * EduFlow — Attendance AJAX
 * Handles: present/absent/late toggle buttons → AJAX POST → live summary update.
 * No page reload. Optimistic UI with rollback on error.
 */

(function () {
    'use strict';

    const config = window.ATTENDANCE_CONFIG || {};

    // -------------------------------------------------------
    // Wire up Present/Absent/Late buttons
    // -------------------------------------------------------
    document.querySelectorAll('.attendance-row').forEach(function (row) {
        const studentId = row.dataset.studentId;
        const batchId   = row.dataset.batchId;
        const date      = row.dataset.date;

        row.querySelectorAll('.attendance-btn').forEach(function (btn) {
            btn.addEventListener('click', async function () {
                const status = btn.dataset.status;
                const allBtns = row.querySelectorAll('.attendance-btn');

                // Optimistic: highlight selected, grey out others
                applyOptimisticUI(allBtns, btn, status);

                try {
                    const result = await markAttendance(studentId, batchId, date, status);

                    if (result.success) {
                        updateSummary(result.summary);
                        updateLastSaved();
                    } else {
                        rollbackUI(allBtns);
                        window.showToast('Failed to save. Please retry.', 'error');
                    }
                } catch (err) {
                    rollbackUI(allBtns);
                    window.showToast('Network error. Please check connection.', 'error');
                    console.error('[EduFlow Attendance]', err);
                }
            });
        });
    });

    // -------------------------------------------------------
    // Mark All Present
    // -------------------------------------------------------
    const markAllBtn = document.getElementById('mark-all-present');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', async function () {
            const rows = document.querySelectorAll('.attendance-row');
            markAllBtn.disabled = true;
            markAllBtn.textContent = 'Saving...';

            let successCount = 0;

            for (const row of rows) {
                const studentId = row.dataset.studentId;
                const batchId   = row.dataset.batchId;
                const date      = row.dataset.date;
                const allBtns   = row.querySelectorAll('.attendance-btn');
                const presentBtn = Array.from(allBtns).find(b => b.dataset.status === 'present');

                applyOptimisticUI(allBtns, presentBtn, 'present');

                try {
                    const result = await markAttendance(studentId, batchId, date, 'present');
                    if (result.success) {
                        successCount++;
                        updateSummary(result.summary);
                    }
                } catch (e) {
                    console.warn('[EduFlow] Failed to mark present for student', studentId);
                }
            }

            markAllBtn.disabled = false;
            markAllBtn.textContent = 'Mark all Present';
            window.showToast(`Marked ${successCount} students as Present.`);
            updateLastSaved();
        });
    }

    // -------------------------------------------------------
    // Auto-reload on date/batch change
    // -------------------------------------------------------
    const dateInput   = document.getElementById('attendance-date');
    const batchSelect = document.getElementById('attendance-batch');

    if (dateInput)   dateInput.addEventListener('change',   submitFilters);
    if (batchSelect) batchSelect.addEventListener('change', submitFilters);

    function submitFilters() {
        const form = document.getElementById('attendance-filter-form');
        if (form) form.submit();
    }

    // -------------------------------------------------------
    // Helpers
    // -------------------------------------------------------

    async function markAttendance(studentId, batchId, date, status) {
        const body = new FormData();
        body.append('csrf_token', window.CSRF_TOKEN);
        body.append('student_id', studentId);
        body.append('batch_id',   batchId);
        body.append('date',       date);
        body.append('status',     status);

        const response = await fetch(window.APP_URL + '/index.php?route=attendance.mark', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': window.CSRF_TOKEN,
            },
            body: body,
        });

        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
    }

    function applyOptimisticUI(allBtns, activeBtn, status) {
        const styleMap = {
            present: 'bg-secondary text-white shadow-md',
            absent:  'bg-error text-white shadow-md',
            late:    'bg-amber-500 text-white shadow-md',
        };

        allBtns.forEach(function (b) {
            b.classList.remove(
                'bg-secondary', 'bg-error', 'bg-amber-500',
                'text-white', 'shadow-md', 'aria-pressed'
            );
            b.classList.add('text-on-surface-variant', 'hover:bg-surface-container-high');
            b.removeAttribute('aria-pressed');

            // Remove icon from non-active
            const icon = b.querySelector('.material-symbols-outlined');
            if (icon) icon.remove();
        });

        if (activeBtn) {
            activeBtn.classList.remove('text-on-surface-variant', 'hover:bg-surface-container-high');
            styleMap[status].split(' ').forEach(cls => activeBtn.classList.add(cls));
            activeBtn.setAttribute('aria-pressed', 'true');

            // Add icon
            const iconNames = { present: 'check_circle', absent: 'cancel', late: 'schedule' };
            const icon = document.createElement('span');
            icon.className = 'material-symbols-outlined text-sm';
            icon.textContent = iconNames[status] || 'check';
            activeBtn.insertBefore(icon, activeBtn.firstChild);
        }
    }

    function rollbackUI(allBtns) {
        allBtns.forEach(function (b) {
            b.classList.remove('bg-secondary', 'bg-error', 'bg-amber-500', 'text-white', 'shadow-md');
            b.classList.add('text-on-surface-variant');
        });
    }

    function updateSummary(summary) {
        const setEl = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        const total = summary.total || 1;
        setEl('count-present', summary.present);
        setEl('count-absent',  summary.absent);
        setEl('count-late',    summary.late);
        setEl('pct-present',   Math.round(summary.present / total * 100) + '%');
        setEl('pct-absent',    Math.round(summary.absent  / total * 100) + '%');
        setEl('pct-late',      Math.round(summary.late    / total * 100) + '%');
    }

    function updateLastSaved() {
        const el = document.getElementById('last-saved-time');
        if (el) {
            const now = new Date();
            el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }

})();
