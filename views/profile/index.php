<?php $pageTitle = 'My Profile'; $currentRoute = 'profile'; ?>
<div class="p-10 max-w-5xl mx-auto">
    <div class="mb-8">
        <h2 class="text-3xl font-extrabold text-on-surface">Account Settings</h2>
        <p class="text-on-surface-variant mt-1">Manage your credentials, login settings, and portal configurations.</p>
    </div>

    <?php if (!empty($flash['error'])): ?>
    <div class="form-error-banner mb-6"><?= htmlspecialchars($flash['error']) ?></div>
    <?php endif; ?>
    <?php if (!empty($flash['success'])): ?>
    <div class="p-4 mb-6 rounded-xl bg-[#e6f4ea] text-[#137333] border border-[#ceead6] font-medium text-sm">
        <?= $flash['success'] ?>
    </div>
    <?php endif; ?>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <!-- User ID Change Form -->
        <div class="form-card">
            <h3 class="form-section-title">Change User ID</h3>
            <p class="text-sm text-on-surface-variant mb-6">Modify your login handle here. Your role prefix is maintained automatically for security.</p>
            <form method="POST" action="<?= APP_URL ?>/index.php?route=profile.user">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>
                
                <div class="form-group">
                    <label class="form-label" for="username_suffix">New User ID Suffix</label>
                    <div class="flex items-center">
                        <span class="inline-flex items-center px-4 h-11 border border-r-0 border-outline-variant rounded-l-xl bg-surface-container-high text-on-surface font-bold text-sm">
                            <?= htmlspecialchars($prefix) ?>
                        </span>
                        <input type="text" id="username_suffix" name="username_suffix" class="form-input rounded-l-none" 
                               value="<?= htmlspecialchars($suffix) ?>" required placeholder="johndoe" />
                    </div>
                </div>
                
                <div class="mt-6 flex justify-end">
                    <button type="submit" class="btn-primary w-full md:w-auto px-6 py-2.5">Update User ID</button>
                </div>
            </form>
        </div>

        <!-- Password Change Form -->
        <div class="form-card">
            <h3 class="form-section-title">Change Password</h3>
            <p class="text-sm text-on-surface-variant mb-6">Ensure your account is using a long, secure password to stay safe.</p>
            <form method="POST" action="<?= APP_URL ?>/index.php?route=profile.pass">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>
                
                <div class="space-y-4">
                    <div class="form-group">
                        <label class="form-label" for="old_password">Current Password</label>
                        <input type="password" id="old_password" name="old_password" class="form-input" required />
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="new_password">New Password</label>
                        <input type="password" id="new_password" name="new_password" class="form-input" required minlength="8" />
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="confirm_password">Confirm New Password</label>
                        <input type="password" id="confirm_password" name="confirm_password" class="form-input" required minlength="8" />
                    </div>
                </div>
                
                <div class="mt-6 flex justify-end">
                    <button type="submit" class="btn-primary w-full md:w-auto px-6 py-2.5 bg-black hover:bg-gray-800">Update Password</button>
                </div>
            </form>
        </div>
        
        <?php if ($fullUser['role'] === 'owner'): ?>
        <!-- Owner Logo Upload -->
        <div class="form-card md:col-span-2">
            <h3 class="form-section-title flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">image</span> Institution Branding
            </h3>
            <p class="text-sm text-on-surface-variant mb-6">Upload an institution logo to display on dashboards for students and teachers.</p>
            
            <form method="POST" action="<?= APP_URL ?>/index.php?route=profile.logo" enctype="multipart/form-data" class="flex flex-col md:flex-row items-center gap-6">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>
                
                <div class="w-32 h-32 flex-shrink-0 bg-surface-container rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-outline-variant/30">
                    <?php if (!empty($institute['logo_path'])): ?>
                        <img src="<?= APP_URL ?>/uploads/<?= htmlspecialchars($institute['logo_path']) ?>" alt="Institute Logo" class="w-full h-full object-cover">
                    <?php else: ?>
                        <span class="material-symbols-outlined text-4xl text-outline-variant opacity-50">image</span>
                    <?php endif; ?>
                </div>
                
                <div class="flex-1 w-full space-y-4">
                    <div class="form-group">
                        <label class="form-label">Upload New Logo (JPG, PNG)</label>
                        <input type="file" name="logo" accept="image/*" class="w-full text-sm text-on-surface-variant
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary/10 file:text-primary
                            hover:file:bg-primary/20
                        " required/>
                    </div>
                    <button type="submit" class="btn-primary px-6 py-2.5">Upload Branding</button>
                    <p class="text-xs text-on-surface-variant max-w-md">Max upload size: 2MB. Square or wide ratios look best.</p>
                </div>
            </form>
        </div>
        <?php endif; ?>
    </div>
</div>
