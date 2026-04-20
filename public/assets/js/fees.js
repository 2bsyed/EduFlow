/**
 * EduFlow — Fees AJAX
 * Handles: "Mark Paid" modal → AJAX POST → live row update.
 */

(function () {
    'use strict';

    const modal         = document.getElementById('payment-modal');
    const closeModal    = document.getElementById('close-modal');
    const closeModal2   = document.getElementById('close-modal-2');
    const confirmBtn    = document.getElementById('confirm-payment');
    const modalAmount   = document.getElementById('modal-amount');
    const modalMode     = document.getElementById('modal-mode');
    const modalName     = document.getElementById('modal-student-name');

    if (!modal) return;

    let activeFeeId   = null;
    let activeFeeAmt  = 0;

    // -------------------------------------------------------
    // Open modal when "Mark Paid" is clicked
    // -------------------------------------------------------
    document.querySelectorAll('.pay-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            activeFeeId  = btn.dataset.id;
            activeFeeAmt = parseFloat(btn.dataset.amount) || 0;

            modalAmount.value = activeFeeAmt.toFixed(2);
            modalMode.value   = 'cash';
            if (modalName) modalName.textContent = 'Student: ' + btn.dataset.name;

            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');
            modalAmount.focus();
        });
    });

    // -------------------------------------------------------
    // Close modal
    // -------------------------------------------------------
    function closePaymentModal() {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        activeFeeId = null;
    }

    if (closeModal)  closeModal.addEventListener('click',  closePaymentModal);
    if (closeModal2) closeModal2.addEventListener('click', closePaymentModal);
    modal.addEventListener('click', function (e) {
        if (e.target === modal) closePaymentModal();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closePaymentModal();
        }
    });

    // -------------------------------------------------------
    // Confirm payment — AJAX POST
    // -------------------------------------------------------
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async function () {
            if (!activeFeeId) return;

            const amount = parseFloat(modalAmount.value);
            const mode   = modalMode.value;

            if (isNaN(amount) || amount <= 0) {
                window.showToast('Please enter a valid amount.', 'error');
                return;
            }

            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Processing...';

            try {
                const body = new FormData();
                body.append('csrf_token', window.CSRF_TOKEN);
                body.append('id',         activeFeeId);
                body.append('amount',     amount);
                body.append('mode',       mode);

                const response = await fetch(
                    window.APP_URL + '/index.php?route=fees.update',
                    {
                        method: 'POST',
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-CSRF-TOKEN': window.CSRF_TOKEN,
                        },
                        body: body,
                    }
                );

                const data = await response.json();

                if (data.success) {
                    updateFeeRow(activeFeeId);
                    closePaymentModal();
                    window.showToast('Payment recorded successfully!');
                } else {
                    window.showToast('Failed to record payment.', 'error');
                }
            } catch (err) {
                window.showToast('Network error. Please retry.', 'error');
                console.error('[EduFlow Fees]', err);
            } finally {
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = '<span class="material-symbols-outlined text-lg">check_circle</span> Confirm Payment';
            }
        });
    }

    // -------------------------------------------------------
    // Update row status in DOM without reload
    // -------------------------------------------------------
    function updateFeeRow(feeId) {
        const statusEl = document.getElementById('fee-status-' + feeId);
        if (statusEl) {
            statusEl.textContent = 'Paid';
            statusEl.className = 'status-badge status-badge--green';
        }

        // Hide the Pay button in this row
        const row = document.getElementById('fee-row-' + feeId);
        if (row) {
            const payBtn = row.querySelector('.pay-btn');
            if (payBtn) payBtn.closest('div')?.remove();
        }
    }

})();
