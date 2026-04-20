<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Register Institute — EduFlow</title>
    <meta name="description" content="Register your coaching center on EduFlow"/>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
    <script id="tailwind-config">
        tailwind.config = { theme: { extend: {
            colors: {
                "surface-container-lowest":"#ffffff","surface-container-highest":"#e0e3e5",
                "on-surface-variant":"#464555","outline-variant":"#c7c4d8",
                "on-surface":"#191c1e","surface":"#f7f9fb","primary":"#3525cd",
                "error":"#ba1a1a","secondary":"#006c49"
            },
            borderRadius: { "DEFAULT":"10px","full":"9999px" },
            fontFamily: { "body":["Inter"] }
        }}}
    </script>
    <link rel="stylesheet" href="<?= APP_URL ?>/public/assets/css/app.css"/>
</head>
<body class="bg-surface text-on-surface min-h-screen flex items-center justify-center p-6">
<div class="fixed inset-0 -z-10 bg-surface">
    <div class="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[150px] rounded-full"></div>
</div>

<div class="w-full max-w-lg">
    <div class="flex flex-col items-center mb-8">
        <div class="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-3">
            <span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings:'FILL' 1">school</span>
        </div>
        <h1 class="text-2xl font-extrabold text-on-surface">Create Your Institute</h1>
        <p class="text-on-surface-variant text-sm mt-1">Set up EduFlow for your coaching center</p>
    </div>

    <div class="bg-surface-container-lowest rounded-DEFAULT p-8 shadow-[0_12px_40px_rgba(25,28,30,0.06)]">

        <?php if (!empty($flash['error'])): ?>
        <div class="mb-6 p-4 bg-error/5 border border-error/20 rounded-DEFAULT text-sm text-error flex items-start gap-2">
            <span class="material-symbols-outlined text-lg mt-0.5">error</span>
            <span><?= htmlspecialchars($flash['error']) ?></span>
        </div>
        <?php endif; ?>

        <form method="POST" action="<?= APP_URL ?>/index.php?route=register.post" class="space-y-5" novalidate>
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <!-- Institute name -->
                <div class="space-y-2 md:col-span-2">
                    <label class="auth-label" for="institute_name">Institute / Center Name *</label>
                    <input type="text" id="institute_name" name="institute_name"
                           class="auth-input"
                           placeholder="Zenith Academy"
                           value="<?= htmlspecialchars($flash['formdata']['institute_name'] ?? '') ?>"
                           required/>
                </div>

                <!-- Subdomain -->
                <div class="space-y-2">
                    <label class="auth-label" for="subdomain">Subdomain / Institute ID *</label>
                    <div class="relative">
                        <input type="text" id="subdomain" name="subdomain"
                               class="auth-input"
                               placeholder="zenith"
                               pattern="[a-z0-9]+"
                               value="<?= htmlspecialchars($flash['formdata']['subdomain'] ?? '') ?>"
                               required/>
                    </div>
                    <p class="text-xs text-on-surface-variant">Lowercase letters & numbers only</p>
                </div>

                <!-- Phone -->
                <div class="space-y-2">
                    <label class="auth-label" for="phone">Contact Phone</label>
                    <input type="tel" id="phone" name="phone"
                           class="auth-input"
                           placeholder="+91 98765 43210"
                           value="<?= htmlspecialchars($flash['formdata']['phone'] ?? '') ?>"/>
                </div>

                <!-- Owner name -->
                <div class="space-y-2">
                    <label class="auth-label" for="owner_name">Your Full Name *</label>
                    <input type="text" id="owner_name" name="owner_name"
                           class="auth-input"
                           placeholder="Dr. Raj Kumar"
                           value="<?= htmlspecialchars($flash['formdata']['owner_name'] ?? '') ?>"
                           required/>
                </div>

                <!-- Email -->
                <div class="space-y-2">
                    <label class="auth-label" for="email">Email Address *</label>
                    <input type="email" id="email" name="email"
                           class="auth-input"
                           placeholder="admin@institute.com"
                           value="<?= htmlspecialchars($flash['formdata']['email'] ?? '') ?>"
                           required/>
                </div>

                <!-- Password -->
                <div class="space-y-2">
                    <label class="auth-label" for="password">Password *</label>
                    <input type="password" id="password" name="password"
                           class="auth-input" placeholder="Min. 8 characters" required/>
                </div>

                <!-- Confirm password -->
                <div class="space-y-2">
                    <label class="auth-label" for="confirm_password">Confirm Password *</label>
                    <input type="password" id="confirm_password" name="confirm_password"
                           class="auth-input" placeholder="Re-enter password" required/>
                </div>
            </div>

            <button type="submit" class="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2 mt-2">
                <span class="material-symbols-outlined text-lg">add_business</span>
                Create Institute
            </button>
        </form>
    </div>

    <div class="mt-6 text-center">
        <p class="text-sm text-on-surface-variant">
            Already have an account?
            <a href="<?= APP_URL ?>/index.php?route=login" class="text-primary font-bold hover:underline ml-1">Sign In</a>
        </p>
    </div>
</div>
<script src="<?= APP_URL ?>/public/assets/js/app.js"></script>
</body>
</html>
