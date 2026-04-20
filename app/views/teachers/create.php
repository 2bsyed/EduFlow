<?php $pageTitle = 'Enrol Teacher'; $currentRoute = 'teachers'; ?>
<div class="p-10 max-w-3xl border-l-[6px] border-primary ml-4 mt-8 rounded-r-2xl bg-surface-container-lowest shadow-sm">
    <div class="mb-8">
        <a href="<?= APP_URL ?>/index.php?route=teachers" 
           class="text-sm text-on-surface-variant hover:text-primary flex items-center gap-1 mb-4">
            <span class="material-symbols-outlined text-sm">arrow_back</span> Back to Teachers
        </a>
        <h2 class="text-3xl font-extrabold text-on-surface">Enrol New Teacher</h2>
        <p class="text-on-surface-variant mt-1">Add a teacher to the system. Login credentials will be generated automatically upon save.</p>
    </div>

    <?php if (!empty($flash['error'])): ?>
        <div class="form-error-banner mb-6"><?= htmlspecialchars($flash['error']) ?></div>
    <?php endif; ?>

    <form method="POST" action="<?= APP_URL ?>/index.php?route=teachers.store" class="space-y-6">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>

        <div class="form-card">
            <h3 class="form-section-title">Teacher Demographics</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                <div class="form-group md:col-span-2">
                    <label class="form-label" for="name">Full Name *</label>
                    <input type="text" id="name" name="name" class="form-input" required 
                           placeholder="Enter teacher's full name" />
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="phone">Phone Number</label>
                    <input type="text" id="phone" name="phone" class="form-input" 
                           placeholder="eg. +880 1234 567890" />
                </div>

                <div class="form-group">
                    <label class="form-label" for="email">Email Address</label>
                    <input type="email" id="email" name="email" class="form-input" 
                           placeholder="Used for backup contact" />
                </div>
            </div>
            
            <div class="mt-6 p-4 rounded-xl bg-primary-fixed/50 border border-primary/10 flex gap-4">
                <span class="material-symbols-outlined text-primary mt-0.5">vpn_key</span>
                <div>
                    <h4 class="font-bold text-sm text-on-surface">Auto-Generated Credentials</h4>
                    <p class="text-sm text-on-surface-variant mt-1">Once enrolled, the system will automatically provision a secure <strong>tea-</strong> User ID and random password. Ensure you document it immediately as passwords cannot be recovered unhashed.</p>
                </div>
            </div>
        </div>

        <div class="flex gap-4 pt-4 border-t border-outline-variant/10">
            <button type="submit" class="btn-primary px-8 py-3 flex items-center gap-2">
                <span class="material-symbols-outlined text-lg">check_circle</span>
                Generate & Enrol
            </button>
            <a href="<?= APP_URL ?>/index.php?route=teachers" class="btn-ghost px-6 py-3">Cancel</a>
        </div>
    </form>
</div>
