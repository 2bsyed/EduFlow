<!-- Top Navigation Bar — extracted from stitch UI -->
<header class="topnav fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-between px-8">

    <!-- Search -->
    <div class="flex items-center gap-4 flex-1">
        <div class="relative w-full max-w-md">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input
                type="text"
                id="global-search"
                placeholder="Search students, batches, records..."
                class="w-full bg-surface-container-highest border-none rounded-DEFAULT py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/10 outline-none placeholder:text-on-surface-variant/60"
                autocomplete="off"
            />
            <!-- Search results dropdown -->
            <div id="search-results" class="search-dropdown hidden"></div>
        </div>
    </div>

    <!-- Right side -->
    <div class="flex items-center gap-4">
        <!-- Institute name -->
        <div class="text-right hidden md:block">
            <p class="text-sm font-bold text-primary leading-none">
                <?= htmlspecialchars($_SESSION['institute']['name'] ?? '') ?>
            </p>
            <p class="text-[10px] text-on-surface-variant uppercase tracking-tighter mt-0.5">
                <?= htmlspecialchars($_SESSION['institute']['plan'] ?? 'starter') ?> plan
            </p>
        </div>

        <!-- Divider -->
        <div class="h-8 w-px bg-outline-variant/30"></div>

        <!-- Notifications -->
        <button class="relative p-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-surface-container-high"
                id="notif-btn" aria-label="Notifications">
            <span class="material-symbols-outlined">notifications</span>
            <span class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
        </button>

        <!-- User avatar & dropdown -->
        <div class="relative" id="user-menu-container">
            <button class="flex items-center gap-2 group" id="user-menu-btn" aria-expanded="false">
                <div class="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-white text-sm font-bold ring-2 ring-primary/10 transition-transform group-hover:scale-105">
                    <?= strtoupper(substr($_SESSION['user']['name'] ?? 'U', 0, 1)) ?>
                </div>
                <span class="material-symbols-outlined text-on-surface-variant text-sm hidden md:inline">expand_more</span>
            </button>

            <!-- Dropdown -->
            <div id="user-dropdown" class="user-dropdown hidden" role="menu">
                <div class="px-4 py-3 border-b border-outline-variant/10">
                    <p class="text-sm font-bold text-on-surface"><?= htmlspecialchars($_SESSION['user']['name'] ?? '') ?></p>
                    <p class="text-xs text-on-surface-variant"><?= htmlspecialchars($_SESSION['user']['username'] ?? '') ?></p>
                </div>
                <a href="<?= APP_URL ?>/index.php?route=logout"
                   class="dropdown-item text-error hover:bg-red-50"
                   id="user-logout">
                    <span class="material-symbols-outlined text-sm">logout</span>
                    Sign Out
                </a>
            </div>
        </div>
    </div>
</header>
