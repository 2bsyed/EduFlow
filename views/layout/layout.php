<!DOCTYPE html>
<html lang="en" class="light">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title><?= htmlspecialchars($pageTitle ?? 'EduFlow') ?> — EduFlow</title>
    <meta name="description" content="EduFlow Coaching Center Management System"/>

    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>

    <!-- Material Symbols -->
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

    <!-- Tailwind CSS CDN with custom config -->
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "surface-bright":              "#f7f9fb",
                        "on-error-container":          "#93000a",
                        "on-tertiary":                 "#ffffff",
                        "primary-container":           "#4f46e5",
                        "secondary":                   "#006c49",
                        "outline-variant":             "#c7c4d8",
                        "secondary-container":         "#6cf8bb",
                        "surface-container-lowest":    "#ffffff",
                        "error-container":             "#ffdad6",
                        "tertiary-container":          "#c20038",
                        "surface-dim":                 "#d8dadc",
                        "tertiary-fixed":              "#ffdada",
                        "primary-fixed-dim":           "#c3c0ff",
                        "surface-container-highest":   "#e0e3e5",
                        "on-surface-variant":          "#464555",
                        "outline":                     "#777587",
                        "on-primary":                  "#ffffff",
                        "tertiary":                    "#950029",
                        "on-secondary-container":      "#00714d",
                        "on-tertiary-container":       "#ffd0d2",
                        "error":                       "#ba1a1a",
                        "surface-container-high":      "#e6e8ea",
                        "primary-fixed":               "#e2dfff",
                        "on-primary-fixed-variant":    "#3323cc",
                        "on-secondary":                "#ffffff",
                        "on-background":               "#191c1e",
                        "secondary-fixed":             "#6ffbbe",
                        "secondary-fixed-dim":         "#4edea3",
                        "background":                  "#f7f9fb",
                        "inverse-primary":             "#c3c0ff",
                        "on-primary-container":        "#dad7ff",
                        "surface-container":           "#eceef0",
                        "on-surface":                  "#191c1e",
                        "on-error":                    "#ffffff",
                        "inverse-surface":             "#2d3133",
                        "surface-container-low":       "#f2f4f6",
                        "surface":                     "#f7f9fb",
                        "primary":                     "#3525cd"
                    },
                    borderRadius: {
                        "DEFAULT": "10px",
                        "lg":      "12px",
                        "xl":      "16px",
                        "2xl":     "20px",
                        "full":    "9999px"
                    },
                    fontFamily: {
                        "headline": ["Inter"],
                        "body":     ["Inter"],
                        "label":    ["Inter"]
                    }
                }
            }
        }
    </script>

    <!-- Tom Select CSS for search dropdowns -->
    <link href="https://cdn.jsdelivr.net/npm/tom-select@2.3.1/dist/css/tom-select.css" rel="stylesheet">
    
    <!-- App CSS (separate file — no inline styles) -->
    <link rel="stylesheet" href="<?= APP_URL ?>/public/assets/css/app.css"/>
</head>
<body class="bg-surface text-on-surface antialiased">

<?php include __DIR__ . '/sidebar.php'; ?>
<?php include __DIR__ . '/topnav.php'; ?>

<!-- Main Content -->
<main class="ml-64 pt-16 min-h-screen bg-surface">
    <?php
    // Flash messages
    $flash = $flash ?? [];
    if (!empty($flash['card_data'])): 
        $card = $flash['card_data'];
    ?>
        <div id="credential-card-overlay" class="fixed inset-0 bg-surface/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:bg-white print:p-0">
            <div class="bg-surface-container-lowest max-w-sm w-full rounded-2xl shadow-xl overflow-hidden border border-outline-variant/30 print:shadow-none print:border-black print:max-w-md">
                <div class="bg-primary/10 p-6 text-center border-b border-outline-variant/30 print:bg-gray-100 print:border-b-2 print:border-black">
                    <span class="material-symbols-outlined text-primary text-5xl mb-2 print:text-black">badge</span>
                    <h3 class="text-xl font-bold text-on-surface"><?= htmlspecialchars($card['title'] ?? 'Access Credentials') ?></h3>
                    <p class="text-xs text-on-surface-variant uppercase tracking-wider mt-1"><?= htmlspecialchars($_SESSION['institute']['name'] ?? '') ?></p>
                </div>
                <div class="p-6 space-y-4">
                    <div class="space-y-1">
                        <p class="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Name</p>
                        <p class="text-lg font-bold text-on-surface"><?= htmlspecialchars($card['name']) ?></p>
                    </div>
                    <div class="space-y-1">
                        <p class="text-xs text-on-surface-variant uppercase tracking-wider font-bold">User ID</p>
                        <div class="bg-surface-container p-3 rounded-lg font-mono text-primary font-bold text-lg select-all print:bg-white print:border print:border-gray-400">
                            <?= htmlspecialchars($card['username']) ?>
                        </div>
                    </div>
                    <div class="space-y-1">
                        <p class="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Generated Password</p>
                        <div class="bg-surface-container p-3 rounded-lg font-mono text-error font-bold text-lg select-all print:bg-white print:border print:border-gray-400">
                            <?= htmlspecialchars($card['password']) ?>
                        </div>
                        <p class="text-[10px] text-error mt-1 flex items-center gap-1 print:hidden">
                            <span class="material-symbols-outlined text-[12px]">warning</span> Record this password immediately.
                        </p>
                    </div>
                </div>
                <div class="p-4 bg-surface-container-low flex gap-3 print:hidden">
                    <button onclick="window.print()" class="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-sm">print</span> Print Card
                    </button>
                    <button onclick="document.getElementById('credential-card-overlay').remove()" class="btn-ghost w-full py-2.5">
                        Close
                    </button>
                </div>
            </div>
        </div>
        <style>
            @media print {
                body * { visibility: hidden; }
                #credential-card-overlay, #credential-card-overlay * { visibility: visible; }
                #credential-card-overlay { position: absolute; left: 0; top: 0; }
            }
        </style>
    <?php endif; ?>
    <?php if (!empty($flash['success'])): ?>
        <div id="flash-success" class="flash-toast flash-success">
            <span class="material-symbols-outlined text-green-600">check_circle</span>
            <span><?= htmlspecialchars($flash['success']) ?></span>
        </div>
    <?php endif; ?>
    <?php if (!empty($flash['error'])): ?>
        <div id="flash-error" class="flash-toast flash-error">
            <span class="material-symbols-outlined text-red-600">error</span>
            <span><?= htmlspecialchars($flash['error']) ?></span>
        </div>
    <?php endif; ?>

    <!-- Page Content Slot -->
    <?php require $content; ?>
</main>

<!-- Deferred Scripts -->
<?php include __DIR__ . '/scripts.php'; ?>

</body>
</html>
