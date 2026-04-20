<!-- Deferred JS includes — loaded at bottom of every page -->

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

<!-- App global JS -->
<script src="<?= APP_URL ?>/public/assets/js/app.js"></script>

<!-- Tom Select JS -->
<script src="https://cdn.jsdelivr.net/npm/tom-select@2.3.1/dist/js/tom-select.complete.min.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", function() {
        document.querySelectorAll('.searchable-select').forEach(function(el) {
            new TomSelect(el, {
                create: false,
                sortField: {
                    field: "text",
                    direction: "asc"
                }
            });
        });
    });
</script>

<!-- CSRF token available globally for all AJAX calls -->
<script>
    window.CSRF_TOKEN = '<?= htmlspecialchars($_SESSION['csrf_token'] ?? '', ENT_QUOTES) ?>';
    window.APP_URL    = '<?= APP_URL ?>';
</script>

<!-- Inline page data for charts (JSON only — no inline logic) -->
<?php if (!empty($chartData)): ?>
<script>
    window.CHART_DATA = <?= json_encode($chartData, JSON_UNESCAPED_UNICODE) ?>;
</script>
<?php endif; ?>

<!-- Page-specific scripts injected by views -->
<?php if (!empty($pageScripts)): ?>
    <?php foreach ((array)$pageScripts as $script): ?>
        <script src="<?= APP_URL ?>/public/assets/js/<?= htmlspecialchars($script) ?>"></script>
    <?php endforeach; ?>
<?php endif; ?>

<!-- Flash auto-dismiss -->
<script>
    (function() {
        ['flash-success','flash-error'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) setTimeout(function() {
                el.style.transition = 'opacity 0.5s';
                el.style.opacity = '0';
                setTimeout(function() { el.remove(); }, 500);
            }, 4000);
        });
    })();
</script>
