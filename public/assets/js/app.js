/**
 * EduFlow — Global JavaScript
 * Handles: user dropdown, global search AJAX, sidebar toggle, debounce.
 * NO business logic — UI interactions only.
 */

(function () {
    'use strict';

    // -------------------------------------------------------
    // User Menu Dropdown
    // -------------------------------------------------------
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');

    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            const expanded = userMenuBtn.getAttribute('aria-expanded') === 'true';
            userDropdown.classList.toggle('hidden', expanded);
            userMenuBtn.setAttribute('aria-expanded', String(!expanded));
        });

        document.addEventListener('click', function () {
            userDropdown.classList.add('hidden');
            if (userMenuBtn) userMenuBtn.setAttribute('aria-expanded', 'false');
        });
    }

    // -------------------------------------------------------
    // Global Search (AJAX)
    // -------------------------------------------------------
    const searchInput = document.getElementById('global-search');
    const searchResults = document.getElementById('search-results');

    if (searchInput && searchResults) {
        const searchDebounced = debounce(async function (term) {
            if (term.length < 2) {
                searchResults.classList.add('hidden');
                return;
            }

            try {
                const url = `${window.APP_URL}/index.php?route=students.search&q=${encodeURIComponent(term)}`;
                const res = await fetch(url, {
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
                });
                const data = await res.json();
                renderSearchResults(data.students || []);
            } catch (err) {
                console.error('[EduFlow Search]', err);
            }
        }, 280);

        searchInput.addEventListener('input', function () {
            searchDebounced(this.value.trim());
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                searchResults.classList.add('hidden');
                searchInput.blur();
            }
        });

        document.addEventListener('click', function (e) {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.add('hidden');
            }
        });
    }

    function renderSearchResults(students) {
        if (!searchResults) return;

        if (students.length === 0) {
            searchResults.innerHTML = '<p class="px-4 py-3 text-sm text-on-surface-variant">No students found.</p>';
            searchResults.classList.remove('hidden');
            return;
        }

        const html = students.map(s => `
            <a href="${window.APP_URL}/index.php?route=students.edit&id=${s.id}"
               class="search-result-item">
                <div class="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    ${escHtml(s.full_name.charAt(0).toUpperCase())}
                </div>
                <div>
                    <p class="text-sm font-bold text-on-surface">${escHtml(s.full_name)}</p>
                    <p class="text-xs text-on-surface-variant">${escHtml(s.roll_no)} • ${escHtml(s.batch_name || '—')}</p>
                </div>
            </a>
        `).join('');

        searchResults.innerHTML = html;
        searchResults.classList.remove('hidden');
    }

    // -------------------------------------------------------
    // Notification button (placeholder)
    // -------------------------------------------------------
    const notifBtn = document.getElementById('notif-btn');
    if (notifBtn) {
        notifBtn.addEventListener('click', function () {
            showToast('Notifications coming soon!', 'info');
        });
    }

    // -------------------------------------------------------
    // Toast notification system
    // -------------------------------------------------------
    window.showToast = function (message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `flash-toast flash-${type === 'error' ? 'error' : 'success'}`;
        toast.innerHTML = `
            <span class="material-symbols-outlined">${type === 'error' ? 'error' : 'check_circle'}</span>
            <span>${escHtml(message)}</span>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.transition = 'opacity 0.5s';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3500);
    };

    // -------------------------------------------------------
    // Utilities
    // -------------------------------------------------------
    function debounce(fn, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    function escHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    window._escHtml = escHtml;
    window._debounce = debounce;

})();
