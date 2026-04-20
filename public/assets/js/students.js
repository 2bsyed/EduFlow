/**
 * EduFlow — Students JS
 * Handles: real-time search filter with debounce.
 */

(function () {
    'use strict';

    const searchInput  = document.getElementById('student-search');
    if (!searchInput) return;

    // Auto-submit form on input with debounce
    const form = searchInput.closest('form');
    if (!form) return;

    const debouncedSubmit = window._debounce
        ? window._debounce(function () { form.submit(); }, 500)
        : null;

    if (debouncedSubmit) {
        searchInput.addEventListener('input', debouncedSubmit);
    }

    // Submit on Enter 
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            form.submit();
        }
    });

})();
