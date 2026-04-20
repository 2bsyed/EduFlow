<!DOCTYPE html>
<html lang="en" class="light">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Sign In — EduFlow</title>
    <meta name="description" content="Sign in to your EduFlow coaching center dashboard"/>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
    <script id="tailwind-config">
        tailwind.config = {
            theme: { extend: {
                colors: {
                    "surface-bright": "#f7f9fb", "primary-container": "#4f46e5",
                    "surface-container-lowest": "#ffffff", "surface-container-highest": "#e0e3e5",
                    "on-surface-variant": "#464555", "outline": "#777587", "outline-variant": "#c7c4d8",
                    "on-surface": "#191c1e", "surface": "#f7f9fb", "primary": "#3525cd",
                },
                borderRadius: { "DEFAULT": "10px", "full": "9999px" },
                fontFamily: { "headline": ["Inter"], "body": ["Inter"] }
            }}
        }
    </script>
    <link rel="stylesheet" href="<?= APP_URL ?>/public/assets/css/app.css"/>
</head>
<body class="bg-surface text-on-surface min-h-screen flex items-center justify-center p-6">

<!-- Background treatments -->
<div class="fixed inset-0 -z-10 bg-surface">
    <div class="absolute inset-0 opacity-[0.025]" style="background-image:radial-gradient(#191c1e 1px,transparent 1px);background-size:32px 32px;"></div>
    <div class="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
    <div class="absolute bottom-0 left-0 w-1/4 h-1/4 bg-indigo-300/10 blur-[100px] rounded-full"></div>
</div>

<!-- Decorative icons -->
<div class="fixed bottom-0 right-0 p-12 opacity-[0.04] pointer-events-none hidden lg:block">
    <span class="material-symbols-outlined" style="font-size:240px">architecture</span>
</div>
<div class="fixed top-0 left-0 p-12 opacity-[0.04] pointer-events-none hidden lg:block">
    <span class="material-symbols-outlined" style="font-size:180px">history_edu</span>
</div>

<!-- Login container -->
<div class="w-full max-w-md">

    <!-- Brand header -->
    <div class="flex flex-col items-center mb-10">
        <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <span class="material-symbols-outlined text-primary text-4xl" style="font-variation-settings:'FILL' 1">school</span>
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight text-on-surface">EduFlow</h1>
        <p class="text-on-surface-variant font-medium mt-1">Coaching Center Management</p>
    </div>

    <!-- Card -->
    <div class="bg-surface-container-lowest rounded-DEFAULT p-8 md:p-10 shadow-[0_12px_40px_rgba(25,28,30,0.06)]">
        <header class="mb-8">
            <h2 class="text-xl font-bold text-on-surface">Welcome back</h2>
            <p class="text-on-surface-variant text-sm mt-1">Please enter your details to sign in</p>
        </header>

        <!-- Flash error -->
        <?php if (!empty($flash['error'])): ?>
        <div class="mb-6 p-4 bg-error/5 border border-error/20 rounded-DEFAULT flex items-center gap-2 text-sm text-error">
            <span class="material-symbols-outlined text-lg">error</span>
            <?= htmlspecialchars($flash['error']) ?>
        </div>
        <?php endif; ?>

        <?php if (!empty($flash['success'])): ?>
        <div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-DEFAULT flex items-center gap-2 text-sm text-green-700">
            <span class="material-symbols-outlined text-lg">check_circle</span>
            <?= htmlspecialchars($flash['success']) ?>
        </div>
        <?php endif; ?>

        <form method="POST" action="<?= APP_URL ?>/index.php?route=login.post" class="space-y-6" novalidate>
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>"/>

            <!-- Subdomain -->
            <div class="space-y-2">
                <label class="auth-label" for="subdomain">Institute ID / Subdomain</label>
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">apartment</span>
                    <input type="text" id="subdomain" name="subdomain"
                           class="auth-input pl-10"
                           placeholder="e.g. zenith" autocomplete="organization"/>
                </div>
                <p class="text-xs text-on-surface-variant opacity-70">Leave blank if you have only one institute.</p>
            </div>

            <!-- User ID -->
            <div class="space-y-2">
                <label class="form-label" for="username">User ID</label>
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">person</span>
                    <input type="text" id="username" name="username" class="form-input pl-11" required 
                           placeholder="e.g. std-johndoe" value="<?= htmlspecialchars($_POST['username'] ?? '') ?>" />
                </div>
            </div>

            <!-- Password -->
            <div class="space-y-2">
                <div class="flex justify-between items-center">
                    <label class="auth-label" for="password">Password</label>
                </div>
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">lock</span>
                    <input type="password" id="password" name="password"
                           class="auth-input pl-10"
                           placeholder="••••••••" required autocomplete="current-password"/>
                    <button type="button" id="toggle-password"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                            aria-label="Toggle password visibility">
                        <span class="material-symbols-outlined text-lg" id="pw-icon">visibility</span>
                    </button>
                </div>
            </div>

            <!-- Remember me -->
            <div class="flex items-center gap-3">
                <input type="checkbox" id="remember" name="remember"
                       class="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20"/>
                <label for="remember" class="text-sm text-on-surface-variant">Keep me signed in on this device</label>
            </div>

            <!-- Submit -->
            <button type="submit" id="login-btn"
                    class="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-lg">login</span>
                Sign In
            </button>
        </form>

        <!-- Demo credentials hint -->
        <div class="mt-6 p-3 bg-surface-container-highest rounded-DEFAULT text-xs text-on-surface-variant text-center">
            <strong>Demo:</strong> admin@zenith.edu &nbsp;|&nbsp; Password: password &nbsp;|&nbsp; Subdomain: zenith
        </div>
    </div>

    <!-- Register link -->
    <div class="mt-8 text-center">
        <p class="text-on-surface-variant text-sm">
            Don't have an account?
            <a href="<?= APP_URL ?>/index.php?route=register"
               class="text-primary font-bold hover:underline ml-1">Register your institute</a>
        </p>
    </div>
</div>

<script src="<?= APP_URL ?>/public/assets/js/app.js"></script>
<script>
    // Password toggle
    document.getElementById('toggle-password').addEventListener('click', function() {
        var pw  = document.getElementById('password');
        var ico = document.getElementById('pw-icon');
        if (pw.type === 'password') { pw.type = 'text';     ico.textContent = 'visibility_off'; }
        else                        { pw.type = 'password'; ico.textContent = 'visibility'; }
    });
</script>
</body>
</html>
