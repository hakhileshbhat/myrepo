/**
 * Dress Brand Revenue Dashboard - App Controller
 * 
 * Manages the application lifecycle, updates the DOM with animated metrics,
 * dynamically generates filter components, and configures Chart.js objects.
 */

// Global state
let selectedBrandId = 'all';
let selectedDressTypeId = 'all';
let selectedYear = 2025;

// Chart references
let revenueTrendChart = null;
let productShareChart = null;
let profitComparisonChart = null;
let socialShareChart = null;
let monthlyReportChart = null;

// Currency Formatter helper (clamped and formatted via validation function)
const currencyFormatter = {
    format: (val) => window.validateAndFormatPrice(val)
};

// Percent Formatter helper
const percentFormatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
});

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    updateDashboard();
    
    // Register Reset Button listener
    document.getElementById('btn-reset-filters').addEventListener('click', resetFilters);

    // Register Year Pill listeners
    document.querySelectorAll('.year-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.year-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedYear = parseInt(btn.dataset.year);
            updateDashboard();
        });
    });
});

/**
 * Generate brand filter pills and dress type filter tabs from the database
 */
function initFilters() {
    const brandsGrid = document.getElementById('brands-pill-grid');
    const dressTypesContainer = document.getElementById('dress-types-tabs');
    
    // 1. Clear placeholders
    brandsGrid.innerHTML = '';
    dressTypesContainer.innerHTML = '';
    
    // 2. Add "All Brands" pill
    const allBrandsPill = createPill('all', '🌟', 'All Brands', true);
    brandsGrid.appendChild(allBrandsPill);
    
    // 3. Add brand pills
    window.DressDB.brands.forEach(brand => {
        const pill = createPill(brand.id, brand.logo, brand.name, false);
        brandsGrid.appendChild(pill);
    });

    // 4. Add "All Dress Types" tab
    const allTypesTab = createTab('all', 'All Dress Types', true);
    dressTypesContainer.appendChild(allTypesTab);

    // 5. Add dress type tabs
    window.DressDB.dressTypes.forEach(type => {
        const tab = createTab(type.id, type.name, false);
        dressTypesContainer.appendChild(tab);
    });
}

function createPill(id, icon, label, isActive) {
    const div = document.createElement('div');
    div.className = `brand-pill ${isActive ? 'active' : ''}`;
    div.dataset.id = id;
    div.innerHTML = `<span>${icon}</span> ${label}`;
    
    div.addEventListener('click', () => {
        document.querySelectorAll('.brand-pill').forEach(p => p.classList.remove('active'));
        div.classList.add('active');
        selectedBrandId = id;
        updateDashboard();
    });
    
    return div;
}

function createTab(id, label, isActive) {
    const button = document.createElement('button');
    button.className = `type-tab ${isActive ? 'active' : ''}`;
    button.dataset.id = id;
    button.textContent = label;
    
    button.addEventListener('click', () => {
        document.querySelectorAll('.type-tab').forEach(t => t.classList.remove('active'));
        button.classList.add('active');
        selectedDressTypeId = id;
        updateDashboard();
    });
    
    return button;
}

/**
 * Update all sections of the dashboard based on active filters
 */
function updateDashboard() {
    // 1. Fetch metrics from the Database Layer
    const data = window.DressDB.queryDashboardData(selectedBrandId, selectedDressTypeId, selectedYear);
    
    // Update monthly report subtitle
    const subEl = document.getElementById('monthly-report-sub');
    if (subEl) {
        subEl.textContent = selectedYear === 2026
            ? 'Revenue vs Net Profit — Jan to Jul 2026 (YTD)'
            : 'Revenue vs Net Profit — Jan to Dec 2025 (Full Year)';
    }
    
    // 2. Render numbers & texts
    renderMetrics(data.summary);
    renderSocialMetrics(data.summary);
    
    // 3. Render charts
    renderRevenueTrendChart(data.monthlyTrend);
    renderProductShareChart(data.dressTypeBreakdown, data.brandBreakdown);
    renderProfitComparisonChart(data);
    renderSocialShareChart(data.summary);
    renderMonthlyReportChart(data.monthlyTrend);
    
    // 4. Render Table & Social Feed
    renderTransactionTable(data.recentTransactions);
    renderSocialFeed();
}

/**
 * Reset all filter selections to default
 */
function resetFilters() {
    selectedBrandId = 'all';
    selectedDressTypeId = 'all';
    
    // Reset Brand Pill active states
    document.querySelectorAll('.brand-pill').forEach(p => {
        p.classList.remove('active');
        if (p.dataset.id === 'all') p.classList.add('active');
    });
    
    // Reset Dress Type active states
    document.querySelectorAll('.type-tab').forEach(t => {
        t.classList.remove('active');
        if (t.dataset.id === 'all') t.classList.add('active');
    });
    
    updateDashboard();
}

/**
 * Helper to animate numerical values
 */
function animateValue(element, start, end, duration, isCurrency = true, isPercent = false, prefix = "") {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentValue = progress * (end - start) + start;
        
        if (isPercent) {
            element.textContent = prefix + percentFormatter.format(currentValue / 100);
        } else if (isCurrency) {
            // Check for negative signs
            const formatted = currencyFormatter.format(Math.abs(currentValue));
            element.textContent = prefix + (currentValue < 0 ? `-${formatted}` : formatted);
        } else {
            element.textContent = prefix + Math.round(currentValue).toLocaleString();
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

/**
 * Render numbers onto the KPI Cards
 */
function renderMetrics(summary) {
    const els = {
        revenue: document.getElementById('val-revenue'),
        cogs: document.getElementById('val-cogs'),
        marketing: document.getElementById('val-marketing'),
        shipping: document.getElementById('val-shipping'),
        expense: document.getElementById('val-expense'),
        pnl: document.getElementById('val-pnl'),
        margin: document.getElementById('val-margin'),
        pnlHeader: document.getElementById('pnl-header-text'),
        pnlIcon: document.getElementById('pnl-icon'),
        pnlCard: document.getElementById('kpi-pnl')
    };

    // Helper function to extract numerical value from text to animate from it
    const getCleanVal = (el) => {
        if (!el || !el.textContent) return 0;
        return parseFloat(el.textContent.replace(/[^0-9.-]/g, '')) || 0;
    };

    animateValue(els.revenue, getCleanVal(els.revenue), summary.revenue, 600, true);
    animateValue(els.cogs, getCleanVal(els.cogs), summary.cogs, 600, true);
    animateValue(els.marketing, getCleanVal(els.marketing), summary.marketing, 600, true);
    animateValue(els.shipping, getCleanVal(els.shipping), summary.shipping + summary.fixed, 600, true); // Operating + fixed overhead
    animateValue(els.expense, getCleanVal(els.expense), summary.totalCost, 600, true);
    
    // Animate Net Profit & Margin
    animateValue(els.pnl, getCleanVal(els.pnl), summary.profitOrLoss, 600, true);
    animateValue(els.margin, getCleanVal(els.margin), summary.margin, 600, false, true);

    // Dynamic formatting for Profit & Loss card styling
    if (summary.profitOrLoss >= 0) {
        els.pnlCard.className = 'kpi-card pnl-card in-profit';
        els.pnlHeader.textContent = 'Net Profit';
        els.pnlIcon.textContent = '📈';
    } else {
        els.pnlCard.className = 'kpi-card pnl-card in-loss';
        els.pnlHeader.textContent = 'Net Loss';
        els.pnlIcon.textContent = '📉';
    }
}

/**
 * Draw/Update the Revenue & P&L Trend Chart
 */
function renderRevenueTrendChart(trendData) {
    const ctx = document.getElementById('chart-revenue-trend').getContext('2d');
    
    const labels = trendData.map(d => d.month);
    const revenues = trendData.map(d => d.revenue);
    const profits = trendData.map(d => d.profitOrLoss);
    
    if (revenueTrendChart) {
        revenueTrendChart.destroy();
    }

    // Chart.js Font override
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    Chart.defaults.color = '#9ca3af';

    // Create gradient fills
    const revGradient = ctx.createLinearGradient(0, 0, 0, 300);
    revGradient.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
    revGradient.addColorStop(1, 'rgba(99, 102, 241, 0.00)');

    const pnlGradient = ctx.createLinearGradient(0, 0, 0, 300);
    pnlGradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
    pnlGradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    revenueTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Gross Revenue',
                    data: revenues,
                    borderColor: '#6366f1',
                    borderWidth: 3,
                    pointBackgroundColor: '#6366f1',
                    pointHoverRadius: 7,
                    tension: 0.35,
                    fill: true,
                    backgroundColor: revGradient
                },
                {
                    label: 'Net Profit/Loss',
                    data: profits,
                    borderColor: '#10b981',
                    borderWidth: 2,
                    borderDash: [4, 4],
                    pointBackgroundColor: '#10b981',
                    pointHoverRadius: 6,
                    tension: 0.35,
                    fill: true,
                    backgroundColor: pnlGradient
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 15,
                        padding: 15,
                        font: { size: 12, weight: '500' }
                    }
                },
                tooltip: {
                    padding: 12,
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${currencyFormatter.format(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.03)' },
                    ticks: { font: { size: 11 } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        font: { size: 11 },
                        callback: function(value) {
                            if (value >= 100000 || value <= -100000) {
                                return `₹${(value / 100000).toFixed(1)} L`;
                            }
                            if (value >= 1000 || value <= -1000) {
                                return `₹${(value / 1000).toFixed(0)}k`;
                            }
                            return `₹${value}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Draw/Update the Share Doughnut Chart
 */
function renderProductShareChart(dressBreakdown, brandBreakdown) {
    const ctx = document.getElementById('chart-product-share').getContext('2d');
    
    if (productShareChart) {
        productShareChart.destroy();
    }

    // Determine what to display based on filters:
    // If brand is "all" and dressType is "all", display Dress Type share
    // If brand is a specific brand, display Dress Type contribution for that brand
    // If dressType is selected but brand is "all", show Brand contribution share!
    
    let chartLabels = [];
    let chartData = [];
    let labelText = "Product Type";

    if (selectedBrandId === 'all' && selectedDressTypeId !== 'all') {
        // Show share by brands
        chartLabels = brandBreakdown.map(b => b.name);
        chartData = brandBreakdown.map(b => b.revenue);
        labelText = "Brand Share";
    } else {
        // Show share by dress types
        chartLabels = dressBreakdown.map(d => d.name);
        chartData = dressBreakdown.map(d => d.revenue);
        labelText = "Dress Type Share";
    }

    // Luxury curated palette
    const colors = [
        '#6366f1', // Indigo
        '#a855f7', // Purple
        '#06b6d4', // Cyan
        '#ec4899', // Pink
        '#10b981', // Emerald
        '#eab308', // Yellow
        '#f97316', // Orange
        '#3b82f6', // Royal Blue
        '#14b8a6', // Teal
        '#64748b'  // Slate
    ];

    productShareChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartLabels,
            datasets: [{
                data: chartData,
                backgroundColor: colors.slice(0, chartLabels.length),
                borderColor: '#0c0f17',
                borderWidth: 2,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 10,
                        padding: 10,
                        font: { size: 11 },
                        color: '#9ca3af'
                    }
                },
                tooltip: {
                    padding: 12,
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const val = context.raw;
                            const percentage = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                            return ` ${context.label}: ${currencyFormatter.format(val)} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

/**
 * Draw/Update the bottom Bar Chart (Comparing Profit & Loss against Expenses)
 */
function renderProfitComparisonChart(dashboardData) {
    const ctx = document.getElementById('chart-profit-comparison').getContext('2d');
    const titleEl = document.getElementById('bar-chart-title');
    const subtitleEl = document.getElementById('bar-chart-sub');
    
    if (profitComparisonChart) {
        profitComparisonChart.destroy();
    }

    let labels = [];
    let profits = [];
    let costs = [];
    let revenues = [];

    // Dynamically adjust bar chart query based on filter state:
    if (selectedBrandId === 'all') {
        // Scenario A: All Brands selected -> Compare brand profitability
        if (selectedDressTypeId !== 'all') {
            const activeTypeName = window.DressDB.dressTypes.find(d => d.id === selectedDressTypeId).name;
            titleEl.textContent = `Brand Comparison for ${activeTypeName}`;
            subtitleEl.textContent = `Comparing Gross Revenue vs Total Expenses across all brands for ${activeTypeName}`;
        } else {
            titleEl.textContent = 'Profitability Comparison by Brand';
            subtitleEl.textContent = 'Comparing Gross Revenue vs Total Expenses for each fashion label';
        }
        
        labels = dashboardData.brandBreakdown.map(b => b.name);
        profits = dashboardData.brandBreakdown.map(b => b.profitOrLoss);
        
        // Match expenses for each brand
        labels.forEach(brandName => {
            const brandId = window.DressDB.brands.find(b => b.name === brandName).id;
            const brandMetrics = window.DressDB.queryDashboardData(brandId, selectedDressTypeId, selectedYear);
            costs.push(brandMetrics.summary.totalCost);
            revenues.push(brandMetrics.summary.revenue);
        });
    } else if (selectedDressTypeId === 'all') {
        // Scenario B: Specific Brand selected, but All Dress Types -> Compare product line profitability
        const activeBrandName = window.DressDB.brands.find(b => b.id === selectedBrandId).name;
        titleEl.textContent = `${activeBrandName} - Revenue & Cost by Product Type`;
        subtitleEl.textContent = 'Analysis of gross revenue and total operations costs across dress types';
        
        labels = dashboardData.dressTypeBreakdown.map(d => d.name);
        profits = dashboardData.dressTypeBreakdown.map(d => d.profitOrLoss);
        
        labels.forEach(typeName => {
            const typeId = window.DressDB.dressTypes.find(d => d.name === typeName).id;
            const typeMetrics = window.DressDB.queryDashboardData(selectedBrandId, typeId, selectedYear);
            costs.push(typeMetrics.summary.totalCost);
            revenues.push(typeMetrics.summary.revenue);
        });
    } else {
        // Scenario C: Specific Brand AND Specific Dress Type selected -> Show Monthly Profit vs Cost Breakdown
        const activeBrandName = window.DressDB.brands.find(b => b.id === selectedBrandId).name;
        const activeTypeName = window.DressDB.dressTypes.find(d => d.id === selectedDressTypeId).name;
        titleEl.textContent = `${activeBrandName} ${activeTypeName} - Monthly Financial Analysis`;
        subtitleEl.textContent = 'Detailing monthly operational costs against gross revenue throughout the year';
        
        labels = dashboardData.monthlyTrend.map(t => t.month);
        profits = dashboardData.monthlyTrend.map(t => t.profitOrLoss);
        costs = dashboardData.monthlyTrend.map(t => t.cost);
        revenues = dashboardData.monthlyTrend.map(t => t.revenue);
    }

    profitComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Operating Expenses',
                    data: costs,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    borderRadius: 4,
                    order: 2
                },
                {
                    label: 'Gross Revenue',
                    type: 'line',
                    data: revenues,
                    borderColor: '#a855f7',
                    borderWidth: 2,
                    pointBackgroundColor: '#a855f7',
                    tension: 0.3,
                    fill: false,
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: '#9ca3af', font: { size: 12 } }
                },
                tooltip: {
                    padding: 12,
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${currencyFormatter.format(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.02)' },
                    ticks: { color: '#9ca3af', font: { size: 11 } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.04)' },
                    ticks: {
                        color: '#9ca3af',
                        font: { size: 11 },
                        callback: function(value) {
                            return window.validateAndFormatPrice(value);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Render transactional audit log table
 */
function renderTransactionTable(transactions) {
    const tableBody = document.getElementById('transaction-rows');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (transactions.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 24px;">No transaction records match current filter selections.</td></tr>`;
        return;
    }
    
    transactions.forEach(tx => {
        const tr = document.createElement('tr');
        
        const isProfit = tx.profitOrLoss >= 0;
        const statusBadge = tx.customerStatus === 'Completed' 
            ? `<span class="badge success">Completed</span>`
            : `<span class="badge danger">Refunded</span>`;

        tr.innerHTML = `
            <td style="font-family: monospace; font-weight: 500; color: var(--text-secondary);">${tx.id}</td>
            <td style="color: var(--text-secondary);">${tx.date}</td>
            <td style="font-weight: 600;">${tx.brandName}</td>
            <td>${tx.dressTypeName}</td>
            <td style="text-align: center;">${tx.quantity}</td>
            <td style="text-align: right;">${window.validateAndFormatPrice(tx.price)}</td>
            <td style="text-align: right; font-weight: 500;">${currencyFormatter.format(tx.revenue)}</td>
            <td style="text-align: right; color: var(--text-secondary);">${currencyFormatter.format(tx.cost)}</td>
            <td style="text-align: right;" class="table-profit ${isProfit ? 'positive' : 'negative'}">
                ${isProfit ? '+' : ''}${currencyFormatter.format(tx.profitOrLoss)}
            </td>
            <td style="text-align: center;">${statusBadge}</td>
        `;
        
        tableBody.appendChild(tr);
    });
}

/**
 * Render social stats numbers with count animation
 */
function renderSocialMetrics(summary) {
    const els = {
        igLikesPos: document.getElementById('val-ig-likes-pos'),
        igLikesNeg: document.getElementById('val-ig-likes-neg'),
        igCommentsPos: document.getElementById('val-ig-comments-pos'),
        igCommentsNeg: document.getElementById('val-ig-comments-neg'),
        twLikesPos: document.getElementById('val-tw-likes-pos'),
        twLikesNeg: document.getElementById('val-tw-likes-neg'),
        twCommentsPos: document.getElementById('val-tw-comments-pos'),
        twCommentsNeg: document.getElementById('val-tw-comments-neg'),
        fbLikesPos: document.getElementById('val-fb-likes-pos'),
        fbLikesNeg: document.getElementById('val-fb-likes-neg'),
        fbCommentsPos: document.getElementById('val-fb-comments-pos'),
        fbCommentsNeg: document.getElementById('val-fb-comments-neg')
    };

    const getCleanVal = (el) => {
        if (!el || !el.textContent) return 0;
        return parseInt(el.textContent.replace(/[^0-9]/g, '')) || 0;
    };

    animateValue(els.igLikesPos, getCleanVal(els.igLikesPos), summary.igLikesPos, 600, false, false, "🟢 ");
    animateValue(els.igLikesNeg, getCleanVal(els.igLikesNeg), summary.igLikesNeg, 600, false, false, "🔴 ");
    animateValue(els.igCommentsPos, getCleanVal(els.igCommentsPos), summary.igCommentsPos, 600, false, false, "🟢 ");
    animateValue(els.igCommentsNeg, getCleanVal(els.igCommentsNeg), summary.igCommentsNeg, 600, false, false, "🔴 ");
    animateValue(els.twLikesPos, getCleanVal(els.twLikesPos), summary.twLikesPos, 600, false, false, "🟢 ");
    animateValue(els.twLikesNeg, getCleanVal(els.twLikesNeg), summary.twLikesNeg, 600, false, false, "🔴 ");
    animateValue(els.twCommentsPos, getCleanVal(els.twCommentsPos), summary.twCommentsPos, 600, false, false, "🟢 ");
    animateValue(els.twCommentsNeg, getCleanVal(els.twCommentsNeg), summary.twCommentsNeg, 600, false, false, "🔴 ");
    animateValue(els.fbLikesPos, getCleanVal(els.fbLikesPos), summary.fbLikesPos, 600, false, false, "🟢 ");
    animateValue(els.fbLikesNeg, getCleanVal(els.fbLikesNeg), summary.fbLikesNeg, 600, false, false, "🔴 ");
    animateValue(els.fbCommentsPos, getCleanVal(els.fbCommentsPos), summary.fbCommentsPos, 600, false, false, "🟢 ");
    animateValue(els.fbCommentsNeg, getCleanVal(els.fbCommentsNeg), summary.fbCommentsNeg, 600, false, false, "🔴 ");
}

/**
 * Draw/Update the Cross-Platform Social Share Chart
 */
function renderSocialShareChart(summary) {
    const ctx = document.getElementById('chart-social-share').getContext('2d');
    
    if (socialShareChart) {
        socialShareChart.destroy();
    }

    const igTotal = summary.igLikes + summary.igComments;
    const twTotal = summary.twLikes + summary.twComments;
    const fbTotal = summary.fbLikes + summary.fbComments;

    socialShareChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Instagram', 'Twitter/X', 'Facebook'],
            datasets: [{
                data: [igTotal, twTotal, fbTotal],
                backgroundColor: [
                    '#e1306c', // Instagram Magenta
                    '#1da1f2', // Twitter Blue
                    '#1877f2'  // Facebook Blue
                ],
                borderColor: '#0c0f17',
                borderWidth: 2,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 10,
                        font: { size: 11 },
                        color: '#9ca3af'
                    }
                },
                tooltip: {
                    padding: 10,
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const val = context.raw;
                            const percentage = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                            return ` ${context.label}: ${val.toLocaleString()} interactions (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

/**
 * Render simulated customer social posts feed matching selected brand
 */
function renderSocialFeed() {
    const feedList = document.getElementById('social-feed-list');
    feedList.innerHTML = '';

    const posts = window.DressDB.getRecentSocialPosts(selectedBrandId);

    if (posts.length === 0) {
        feedList.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 24px;">No customer posts found.</div>`;
        return;
    }

    posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'social-post-item';
        
        let platformLabel = '';
        if (post.platform === 'instagram') {
            platformLabel = '<span class="platform-icon instagram">📸 Instagram</span>';
        } else if (post.platform === 'twitter') {
            platformLabel = '<span class="platform-icon twitter">🐦 Twitter/X</span>';
        } else if (post.platform === 'facebook') {
            platformLabel = '<span class="platform-icon facebook">👥 Facebook</span>';
        }

        const sentimentClass = post.sentiment === 'positive' ? 'positive' : 'negative';
        const sentimentLabel = post.sentiment === 'positive' ? '🟢 Positive' : '🔴 Negative';
        const sentimentBadge = `<span class="sentiment-badge ${sentimentClass}" style="margin-left: 6px;">${sentimentLabel}</span>`;

        div.innerHTML = `
            <div class="post-header">
                <span class="post-user">${post.user} ${sentimentBadge}</span>
                <div class="post-meta">
                    ${platformLabel}
                    <span>${post.time}</span>
                </div>
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-footer">
                <div class="post-action">
                    <span>❤️</span> ${post.likes ? post.likes.toLocaleString() : '0'}
                </div>
                <div class="post-action">
                    <span>💬</span> ${post.comments ? post.comments.toLocaleString() : '0'}
                </div>
            </div>
        `;
        feedList.appendChild(div);
    });
}

/**
 * Render the dedicated full-width Monthly Performance Report Chart
 * Shows Revenue vs Net Profit side-by-side for all 12 months of the year
 */
function renderMonthlyReportChart(trendData) {
    const canvas = document.getElementById('chart-monthly-report');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (monthlyReportChart) {
        monthlyReportChart.destroy();
    }

    const labels   = trendData.map(d => d.month);
    const revenues = trendData.map(d => d.revenue);
    const profits  = trendData.map(d => d.profitOrLoss);
    
    // Gradient fills
    const revGrad = ctx.createLinearGradient(0, 0, 0, 280);
    revGrad.addColorStop(0, 'rgba(99, 102, 241, 0.40)');
    revGrad.addColorStop(1, 'rgba(99, 102, 241, 0.00)');

    const pnlGrad = ctx.createLinearGradient(0, 0, 0, 280);
    pnlGrad.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    pnlGrad.addColorStop(1, 'rgba(16, 185, 129, 0.00)');

    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    Chart.defaults.color = '#9ca3af';

    monthlyReportChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Gross Revenue',
                    data: revenues,
                    borderColor: '#6366f1',
                    borderWidth: 3,
                    pointBackgroundColor: '#6366f1',
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: revGrad
                },
                {
                    label: 'Net Profit',
                    data: profits,
                    borderColor: '#10b981',
                    borderWidth: 2.5,
                    borderDash: [6, 4],
                    pointBackgroundColor: '#10b981',
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: pnlGrad,
                    segment: {
                        borderColor: ctx => ctx.p1.raw < 0 ? '#ef4444' : '#10b981',
                        backgroundColor: ctx => ctx.p1.raw < 0 ? 'rgba(239, 68, 68, 0.35)' : pnlGrad
                    }
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
                    padding: 14,
                    backgroundColor: 'rgba(15, 20, 35, 0.96)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    callbacks: {
                        label: (ctx) =>
                            ` ${ctx.dataset.label}: ${currencyFormatter.format(ctx.raw)}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.03)' },
                    ticks: { color: '#9ca3af', font: { size: 11 } }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: {
                        color: '#9ca3af',
                        font: { size: 11 },
                        callback: (val) => {
                            if (val >= 100000) return `₹${(val/100000).toFixed(1)}L`;
                            return `₹${(val/1000).toFixed(0)}k`;
                        }
                    }
                }
            }
        }
    });
}
