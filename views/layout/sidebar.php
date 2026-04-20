<?php
/**
 * Sidebar component — extracted from stitch UI
 * Sets active link based on $currentRoute variable.
 */
$currentRoute = $_GET['route'] ?? '';
$userRole     = $_SESSION['user']['role'] ?? 'student';

$navItems = [
    ['route' => 'dashboard',  'icon' => 'dashboard',          'label' => 'Dashboard', 'roles' => ['owner', 'teacher', 'student']],
    ['route' => 'students',   'icon' => 'group',              'label' => 'Students',  'roles' => ['owner', 'teacher']],
    ['route' => 'teachers',   'icon' => 'school',             'label' => 'Teachers',  'roles' => ['owner']],
    ['route' => 'batches',    'icon' => 'groups',             'label' => 'Batches',   'roles' => ['owner', 'teacher']],
    ['route' => 'attendance', 'icon' => 'event_available',    'label' => 'Attendance','roles' => ['owner', 'teacher', 'student']],
    ['route' => 'fees',       'icon' => 'payments',           'label' => 'Fees',      'roles' => ['owner', 'student']],
    ['route' => 'results',    'icon' => 'assignment_turned_in','label' => 'Results',  'roles' => ['owner', 'teacher', 'student']],
    ['route' => 'expenses',   'icon' => 'account_balance_wallet','label' => 'Expenses', 'roles' => ['owner']],
    ['route' => 'analytics',  'icon' => 'analytics',          'label' => 'Analytics', 'roles' => ['owner']],
];

function isActive(string $route, string $current): bool {
    return $route === $current || str_starts_with($current, $route . '.');
}
?>
<aside class="sidebar h-screen w-64 fixed left-0 top-0 bg-slate-50 flex flex-col py-6 z-50">

    <!-- Brand -->
    <div class="px-6 mb-8">
        <a href="<?= APP_URL ?>/index.php?route=<?= $userRole === 'owner' ? 'dashboard' : $userRole . '.dashboard' ?>" class="flex items-center gap-3 group">
            <?php if (!empty($_SESSION['institute']['logo_path'])): ?>
                <img src="<?= APP_URL ?>/uploads/<?= htmlspecialchars($_SESSION['institute']['logo_path']) ?>" alt="Logo" class="w-10 h-10 rounded-lg object-cover border border-outline-variant/30 transition-transform group-hover:scale-105" />
            <?php else: ?>
                <div class="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white transition-transform group-hover:scale-105">
                    <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">school</span>
                </div>
            <?php endif; ?>
            <div>
                <h1 class="text-base font-extrabold text-on-surface leading-none max-w-[120px] truncate" title="<?= htmlspecialchars($_SESSION['institute']['name']) ?>">
                    <?= htmlspecialchars($_SESSION['institute']['name']) ?>
                </h1>
                <p class="text-[9px] uppercase tracking-wider text-on-surface-variant mt-0.5">Powered by EduFlow</p>
            </div>
        </a>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 space-y-0.5" role="navigation" aria-label="Main navigation">
        <?php foreach ($navItems as $item):
            if (!in_array($userRole, $item['roles'])) continue;
            
            $active = isActive($item['route'], $currentRoute);
            // Dashboard is special: student.dashboard and teacher.dashboard should also highlight
            if ($item['route'] === 'dashboard' && !$active) {
                $active = ($currentRoute === 'student.dashboard' || $currentRoute === 'teacher.dashboard');
            }
            $realRoute = $item['route'];
            if ($realRoute === 'dashboard' && $userRole !== 'owner') {
                $realRoute = $userRole . '.dashboard';
            }
        ?>
        <a href="<?= APP_URL ?>/index.php?route=<?= $realRoute ?>"
           class="nav-link <?= $active ? 'nav-link--active' : '' ?>"
           <?= $active ? 'aria-current="page"' : '' ?>>
            <span class="material-symbols-outlined nav-icon"
                  style="font-variation-settings:'FILL' <?= $active ? '1' : '0' ?>">
                <?= $item['icon'] ?>
            </span>
            <span class="nav-label"><?= $item['label'] ?></span>
        </a>
        <?php endforeach; ?>
    </nav>

    <!-- Bottom section -->
    <div class="px-4 mt-auto space-y-1">
        <a href="<?= APP_URL ?>/index.php?route=profile"
           class="nav-link <?= $currentRoute === 'profile' ? 'nav-link--active' : '' ?>">
            <span class="material-symbols-outlined nav-icon">person</span>
            <span class="nav-label">Profile Settings</span>
        </a>
        <a href="<?= APP_URL ?>/index.php?route=logout"
           class="nav-link text-red-500 hover:text-red-700 hover:bg-red-50"
           id="logout-link">
            <span class="material-symbols-outlined nav-icon">logout</span>
            <span class="nav-label">Sign Out</span>
        </a>
    </div>

    <!-- User info at bottom -->
    <div class="px-4 pt-4 border-t border-slate-200 mt-4 mx-2">
        <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                <?= strtoupper(substr($_SESSION['user']['name'] ?? 'U', 0, 1)) ?>
            </div>
            <div class="overflow-hidden">
                <p class="text-sm font-bold text-on-surface truncate">
                    <?= htmlspecialchars($_SESSION['user']['name'] ?? '') ?>
                </p>
                <p class="text-[10px] text-on-surface-variant capitalize">
                    <?= htmlspecialchars($_SESSION['user']['role'] ?? '') ?>
                </p>
            </div>
        </div>
    </div>
</aside>
