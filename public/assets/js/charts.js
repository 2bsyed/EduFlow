/**
 * EduFlow — Charts (Chart.js)
 * Reads from window.CHART_DATA injected by PHP views.
 * No inline JS in HTML/PHP files.
 */

(function () {
    'use strict';

    // Wait for Chart.js to be ready
    if (typeof Chart === 'undefined') {
        console.error('[EduFlow Charts] Chart.js not loaded');
        return;
    }

    const data = window.CHART_DATA || {};

    // Common Chart.js defaults
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color       = '#464555';

    // -------------------------------------------------------
    // Dashboard Chart — Revenue + Attendance combined
    // -------------------------------------------------------
    const dashboardCtx = document.getElementById('dashboardChart');
    if (dashboardCtx && data.revenue) {
        const labels       = data.revenue.map(r => r.label);
        const revenueVals  = data.revenue.map(r => r.value);
        const attendVals   = (data.attendance || []).map(r => r.value);

        new Chart(dashboardCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Revenue (₹)',
                        data: revenueVals,
                        backgroundColor: 'rgba(53, 37, 205, 0.15)',
                        borderColor: '#3525cd',
                        borderWidth: 2,
                        borderRadius: 6,
                        yAxisID: 'yRevenue',
                    },
                    {
                        label: 'Attendance %',
                        data: attendVals,
                        type: 'line',
                        borderColor: '#006c49',
                        backgroundColor: 'rgba(0, 108, 73, 0.1)',
                        borderWidth: 2,
                        pointRadius: 5,
                        pointBackgroundColor: '#006c49',
                        tension: 0.4,
                        yAxisID: 'yAttendance',
                        fill: true,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#ffffff',
                        titleColor: '#191c1e',
                        bodyColor: '#464555',
                        borderColor: 'rgba(199,196,216,0.4)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 10,
                    }
                },
                scales: {
                    x: { grid: { display: false }, border: { display: false } },
                    yRevenue: {
                        type: 'linear',
                        position: 'left',
                        grid: { color: 'rgba(199,196,216,0.2)' },
                        border: { display: false },
                        ticks: { callback: v => '₹' + (v >= 1000 ? (v/1000).toFixed(0) + 'k' : v) }
                    },
                    yAttendance: {
                        type: 'linear',
                        position: 'right',
                        min: 0, max: 100,
                        grid: { display: false },
                        border: { display: false },
                        ticks: { callback: v => v + '%' }
                    }
                }
            }
        });
    }

    // -------------------------------------------------------
    // Analytics — Revenue Chart
    // -------------------------------------------------------
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx && data.revenue) {
        buildBarChart(revenueCtx, data.revenue, '#3525cd', 'Revenue (₹)',
            v => '₹' + (v >= 1000 ? (v/1000).toFixed(1) + 'k' : v));
    }

    // -------------------------------------------------------
    // Analytics — Attendance Chart
    // -------------------------------------------------------
    const attendCtx = document.getElementById('attendanceChart');
    if (attendCtx && data.attendance) {
        buildLineChart(attendCtx, data.attendance, '#006c49', 'Attendance %',
            v => v + '%');
    }

    // -------------------------------------------------------
    // Analytics — Batch Performance
    // -------------------------------------------------------
    const batchCtx = document.getElementById('batchChart');
    if (batchCtx && data.batchPerformance) {
        buildHorizontalBarChart(batchCtx, data.batchPerformance, '#3525cd', 'Avg Score %',
            v => v + '%');
    }

    // -------------------------------------------------------
    // Analytics — Fee Status Donut
    // -------------------------------------------------------
    const feeCtx = document.getElementById('feeStatusChart');
    if (feeCtx && data.feeStatus) {
        const labels = data.feeStatus.map(f => f.label);
        const values = data.feeStatus.map(f => f.value);
        const colors = data.feeStatus.map(f => f.color);

        new Chart(feeCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors.map(c => c + '33'),
                    borderColor: colors,
                    borderWidth: 2,
                    hoverOffset: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12, borderRadius: 6,
                            font: { size: 12, weight: '600' }
                        }
                    },
                    tooltip: commonTooltip(),
                }
            }
        });
    }

    // -------------------------------------------------------
    // Reusable chart builders
    // -------------------------------------------------------

    function buildBarChart(ctx, dataArr, color, label, tickFormatter) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dataArr.map(r => r.label),
                datasets: [{
                    label: label,
                    data: dataArr.map(r => r.value),
                    backgroundColor: color + '22',
                    borderColor: color,
                    borderWidth: 2,
                    borderRadius: 6,
                }]
            },
            options: chartOpts(tickFormatter)
        });
    }

    function buildLineChart(ctx, dataArr, color, label, tickFormatter) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dataArr.map(r => r.label),
                datasets: [{
                    label: label,
                    data: dataArr.map(r => r.value),
                    borderColor: color,
                    backgroundColor: color + '15',
                    borderWidth: 2,
                    pointRadius: 5,
                    pointBackgroundColor: color,
                    tension: 0.4,
                    fill: true,
                }]
            },
            options: chartOpts(tickFormatter)
        });
    }

    function buildHorizontalBarChart(ctx, dataArr, color, label, tickFormatter) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dataArr.map(r => r.label),
                datasets: [{
                    label: label,
                    data: dataArr.map(r => r.value),
                    backgroundColor: color + '22',
                    borderColor: color,
                    borderWidth: 2,
                    borderRadius: 4,
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: commonTooltip() },
                scales: {
                    x: {
                        min: 0, max: 100,
                        grid: { color: 'rgba(199,196,216,0.2)' },
                        border: { display: false },
                        ticks: { callback: tickFormatter }
                    },
                    y: { grid: { display: false }, border: { display: false } }
                }
            }
        });
    }

    function chartOpts(tickFormatter) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: commonTooltip() },
            scales: {
                x: { grid: { display: false }, border: { display: false } },
                y: {
                    grid: { color: 'rgba(199,196,216,0.2)' },
                    border: { display: false },
                    ticks: { callback: tickFormatter }
                }
            }
        };
    }

    function commonTooltip() {
        return {
            backgroundColor: '#ffffff',
            titleColor: '#191c1e',
            bodyColor: '#464555',
            borderColor: 'rgba(199,196,216,0.4)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 10,
        };
    }

})();
