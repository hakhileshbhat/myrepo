// --- API Configuration ---
const API_BASE_URL = 'http://localhost:8000/api';

// --- Local Mock Data Fallbacks (Demo Sandbox Mode) ---
let localBrand = {
    name: "Bella Pasta Cafe",
    industry: "Food & Beverage",
    instagram_handle: "@bellapasta_cafe",
    twitter_handle: "@bellapasta_cafe"
};

let localCompetitors = [
    { name: "Trattoria Romana", score: 82 },
    { name: "Olive & Basil", "score": 67 }
];

let localMentions = [
    { id: 1, username: "sarah_bakes", platform: "instagram", text: "Absolutely love the new sourdough bread! The crust is perfection. 🥐❤️", sentiment: "Positive", time: "15m ago", timestamp: new Date(Date.now() - 15*60000) },
    { id: 2, username: "tech_guy_99", platform: "twitter", text: "Service at the local branch was super slow today. Took 20 mins to get a coffee.", sentiment: "Negative", time: "45m ago", timestamp: new Date(Date.now() - 45*60000) },
    { id: 3, username: "design_explorer", platform: "instagram", text: "The shop interior is beautiful, but the seating is a bit limited.", sentiment: "Neutral", time: "2h ago", timestamp: new Date(Date.now() - 120*60000) },
    { id: 4, username: "fitness_freak", platform: "instagram", text: "Stunning service and healthy food options! Will definitely come back every week! 💪", sentiment: "Positive", time: "4h ago", timestamp: new Date(Date.now() - 240*60000) },
    { id: 5, username: "angry_customer", platform: "twitter", text: "Tried calling customer support 3 times, no response. Extremely disappointed.", sentiment: "Negative", time: "6h ago", timestamp: new Date(Date.now() - 360*60000) },
    { id: 6, username: "local_foodie", platform: "instagram", text: "Decent coffee, normal prices. A good spot to do some quick remote work.", sentiment: "Neutral", time: "8h ago", timestamp: new Date(Date.now() - 480*60000) },
    { id: 7, username: "emma_green", platform: "twitter", text: "So glad they started using biodegradable packaging! BrandPulse is leading the way! 🌿", sentiment: "Positive", time: "12h ago", timestamp: new Date(Date.now() - 720*60000) }
];

let localMetrics = {
    instagram_likes: 12450,
    instagram_growth: 14.2,
    twitter_likes: 8920,
    twitter_growth: 8.6,
    total_comments: 2135,
    sentiment_score: 57
};

let localTrend = [];
// Generate initial trend
(function seedLocalTrend() {
    let pos = 65;
    let neu = 20;
    let neg = 15;
    for (let i = 1; i <= 30; i++) {
        pos = Math.max(10, Math.min(90, pos + Math.floor(Math.random() * 11) - 5));
        neg = Math.max(5, Math.min(40, neg + Math.floor(Math.random() * 9) - 4));
        neu = 100 - pos - neg;
        localTrend.push({
            date: `Day ${i}`,
            positive: pos,
            neutral: neu,
            negative: neg
        });
    }
})();

// Crawler Templates (local sandbox generation)
const localCrawlerTemplates = [
    { username: "cafe_connoisseur", platform: "instagram", text: "Their iced mocha is the absolute best in town! ☕✨", sentiment: "Positive" },
    { username: "nyc_wanderer", platform: "twitter", text: "Highly disappointed with the order delay. Waited over 40 mins and it was cold.", sentiment: "Negative" },
    { username: "healthy_bites", platform: "instagram", text: "Nice salads, but I wish they had more dressing options.", sentiment: "Neutral" },
    { username: "reviewer_pro", platform: "twitter", text: "The brand's environmental initiative is outstanding. Support local business!", sentiment: "Positive" },
    { username: "curious_foodie", platform: "instagram", text: "Is this place pet-friendly? Thinking of visiting tomorrow.", sentiment: "Neutral" }
];

// --- Application State ---
let sentimentChart = null;
let competitorChart = null;
let donutChart = null;

let currentFilter = 'all';
let fetchedMentions = [];
let crawlerIntervalId = null;

// --- Initialize Dashboard ---
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    setupEventListeners();
});

async function initDashboard() {
    await refreshDashboardData();
}

// Fetch all dashboard data
async function refreshDashboardData() {
    let brand, metrics, trend, mentions, competitors;
    let usingFallback = false;

    try {
        const brandRes = await fetch(`${API_BASE_URL}/brand`);
        const metricsRes = await fetch(`${API_BASE_URL}/metrics`);
        const trendRes = await fetch(`${API_BASE_URL}/sentiment-trend`);
        const mentionsRes = await fetch(`${API_BASE_URL}/mentions`);
        const competitorsRes = await fetch(`${API_BASE_URL}/competitors`);

        if (!brandRes.ok || !metricsRes.ok || !trendRes.ok || !mentionsRes.ok || !competitorsRes.ok) {
            throw new Error("Failed to load backend API endpoints");
        }

        brand = await brandRes.json();
        metrics = await metricsRes.json();
        trend = await trendRes.json();
        mentions = await mentionsRes.json();
        competitors = await competitorsRes.json();

        // Update live indicator to green
        document.querySelector('.status-indicator').className = 'status-indicator live';
        document.querySelector('.status-indicator').style.backgroundColor = '';
        document.querySelector('.status-indicator').style.boxShadow = '';
        document.querySelector('.status-text').innerText = 'Live Sync Active';
    } catch (error) {
        console.warn("Backend API offline. Running in Demo Sandbox Mode with mock data.", error);
        brand = localBrand;
        metrics = localMetrics;
        trend = localTrend;
        mentions = formatLocalMentions(localMentions);
        competitors = localCompetitors;
        usingFallback = true;

        // Change live indicator to orange
        document.querySelector('.status-indicator').className = 'status-indicator';
        document.querySelector('.status-indicator').style.backgroundColor = '#f59e0b';
        document.querySelector('.status-indicator').style.boxShadow = '0 0 10px #f59e0b';
        document.querySelector('.status-text').innerText = 'Demo Sandbox Mode';
    }

    fetchedMentions = mentions;

    updateBrandUI(brand);
    updateMetricsCards(metrics);
    filterAndRenderFeed(currentFilter);
    updateKeywordsCloud(mentions);
    
    // Draw charts
    renderOrUpdateLineChart(trend);
    renderOrUpdateCompetitorChart(brand.name, metrics.sentiment_score, competitors);
    renderOrUpdateDonutChart(mentions);
}

// Convert absolute local dates into relative strings
function formatLocalMentions(mentionsList) {
    return mentionsList.map(m => {
        const delta = Date.now() - m.timestamp;
        let timeStr = "Just now";
        if (delta < 60000) {
            timeStr = "Just now";
        } else if (delta < 3600000) {
            timeStr = `${Math.floor(delta / 60000)}m ago`;
        } else if (delta < 86400000) {
            timeStr = `${Math.floor(delta / 3600000)}h ago`;
        } else {
            timeStr = `${Math.floor(delta / 86400000)}d ago`;
        }
        return {
            id: m.id,
            username: m.username,
            platform: m.platform,
            text: m.text,
            sentiment: m.sentiment,
            time: timeStr
        };
    });
}

// Update Brand Profile Details
function updateBrandUI(brand) {
    document.getElementById('brand-profile-name').innerText = brand.name;
    document.getElementById('brand-profile-industry').innerText = brand.industry;
    document.getElementById('brand-insta-handle').innerText = brand.instagram_handle;
    document.getElementById('brand-twitter-handle').innerText = brand.twitter_handle;
    
    // Set logo mock text
    document.getElementById('brand-logo-text').innerText = brand.name.charAt(0).toUpperCase();

    // Populate inputs in settings panel
    document.getElementById('brand-name').value = brand.name;
    document.getElementById('brand-industry').value = brand.industry;
    document.getElementById('brand-insta').value = brand.instagram_handle;
    document.getElementById('brand-twitter').value = brand.twitter_handle;
}

// Update top row metrics
function updateMetricsCards(metrics) {
    document.getElementById('insta-likes').innerText = metrics.instagram_likes.toLocaleString();
    document.getElementById('insta-growth').innerText = metrics.instagram_growth.toFixed(1);
    
    document.getElementById('twitter-likes').innerText = metrics.twitter_likes.toLocaleString();
    document.getElementById('twitter-growth').innerText = metrics.twitter_growth.toFixed(1);
    
    document.getElementById('total-comments').innerText = metrics.total_comments.toLocaleString();
    document.getElementById('sentiment-score').innerText = `${metrics.sentiment_score}%`;
}

// Filter and render engagement feed
function filterAndRenderFeed(filterValue) {
    const feedContainer = document.getElementById('mentions-feed');
    feedContainer.innerHTML = '';

    const filtered = fetchedMentions.filter(m => {
        if (filterValue === 'all') return true;
        if (filterValue === 'instagram' || filterValue === 'twitter') return m.platform === filterValue;
        return m.sentiment === filterValue;
    });

    if (filtered.length === 0) {
        feedContainer.innerHTML = `
            <div class="feed-loading">
                <i class="fa-solid fa-circle-info"></i> No mentions match the filter criteria.
            </div>
        `;
        return;
    }

    filtered.forEach(mention => {
        const item = document.createElement('div');
        item.className = 'feed-item';
        
        const platformIcon = mention.platform === 'instagram' 
            ? '<i class="fa-brands fa-instagram icon-instagram"></i>' 
            : '<i class="fa-brands fa-x-twitter icon-twitter"></i>';
            
        const sentimentClass = mention.sentiment.toLowerCase();

        item.innerHTML = `
            <div class="feed-item-header">
                <div class="feed-user">
                    ${platformIcon}
                    <span>@${mention.username}</span>
                </div>
                <div class="feed-meta">
                    <span class="sentiment-badge ${sentimentClass}">${mention.sentiment}</span>
                    <span class="feed-time">${mention.time}</span>
                </div>
            </div>
            <div class="feed-content">
                "${mention.text}"
            </div>
        `;
        feedContainer.appendChild(item);
    });
}

// Parse comments text to dynamically build Keyword analytics tags
function updateKeywordsCloud(mentions) {
    const topicsCloud = document.getElementById('topics-cloud');
    topicsCloud.innerHTML = '';

    // Keywords dictionary to check
    const keywordMap = {
        "crust": { name: "Crust Quality", positive: 0, total: 0 },
        "sourdough": { name: "Sourdough", positive: 0, total: 0 },
        "service": { name: "Service Speed", positive: 0, total: 0 },
        "wait": { name: "Wait Time", positive: 0, total: 0 },
        "coffee": { name: "Coffee Brew", positive: 0, total: 0 },
        "packaging": { name: "Eco Packaging", positive: 0, total: 0 },
        "prices": { name: "Pricing Value", positive: 0, total: 0 },
        "pricing": { name: "Pricing Value", positive: 0, total: 0 },
        "staff": { name: "Staff Service", positive: 0, total: 0 },
        "interior": { name: "Shop Atmosphere", positive: 0, total: 0 },
        "seating": { name: "Shop Seating", positive: 0, total: 0 },
        "healthy": { name: "Healthy Choices", positive: 0, total: 0 }
    };

    mentions.forEach(m => {
        const textLower = m.text.toLowerCase();
        for (const [key, value] of Object.entries(keywordMap)) {
            if (textLower.includes(key)) {
                value.total += 1;
                if (m.sentiment === 'Positive') {
                    value.positive += 1;
                } else if (m.sentiment === 'Negative') {
                    value.positive -= 0.5; // weight negative comments
                }
            }
        }
    });

    // Clean up empty tags and render
    let tagCount = 0;
    for (const [key, details] of Object.entries(keywordMap)) {
        if (details.total > 0) {
            tagCount++;
            let sentimentClass = 'neutral';
            const ratio = details.positive / details.total;
            if (ratio > 0.5) sentimentClass = 'positive';
            else if (ratio < 0.2) sentimentClass = 'negative';

            const tag = document.createElement('div');
            tag.className = `topic-tag ${sentimentClass}`;
            tag.innerHTML = `<span class="topic-name">${details.name}</span><span class="topic-count">${details.total}</span>`;
            topicsCloud.appendChild(tag);
        }
    }

    if (tagCount === 0) {
        topicsCloud.innerHTML = '<span class="feed-time">Insufficient data to extract topics</span>';
    }
}

// --- LINE CHART (Trend) ---
function renderOrUpdateLineChart(trendData) {
    const ctx = document.getElementById('sentimentChart').getContext('2d');
    
    const labels = trendData.map(item => item.date);
    const positiveData = trendData.map(item => item.positive);
    const neutralData = trendData.map(item => item.neutral);
    const negativeData = trendData.map(item => item.negative);

    const posGradient = ctx.createLinearGradient(0, 0, 0, 250);
    posGradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
    posGradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    const neuGradient = ctx.createLinearGradient(0, 0, 0, 250);
    neuGradient.addColorStop(0, 'rgba(245, 158, 11, 0.2)');
    neuGradient.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

    const negGradient = ctx.createLinearGradient(0, 0, 0, 250);
    negGradient.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
    negGradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');

    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Positive',
                    data: positiveData,
                    borderColor: '#10b981',
                    backgroundColor: posGradient,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4
                },
                {
                    label: 'Neutral',
                    data: neutralData,
                    borderColor: '#f59e0b',
                    backgroundColor: neuGradient,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4
                },
                {
                    label: 'Negative',
                    data: negativeData,
                    borderColor: '#ef4444',
                    backgroundColor: negGradient,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(17, 12, 40, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#f3f4f6',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#9ca3af', font: { size: 9 }, maxTicksLimit: 10 }
                },
                y: {
                    min: 0, max: 100,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#9ca3af', font: { size: 9 }, callback: val => val + '%' }
                }
            }
        }
    };

    if (sentimentChart) {
        sentimentChart.destroy();
    }
    sentimentChart = new Chart(ctx, config);
}

// --- COMPETITOR BAR CHART ---
function renderOrUpdateCompetitorChart(brandName, brandScore, competitors) {
    const ctx = document.getElementById('competitorChart').getContext('2d');

    const labels = [brandName, competitors[0].name, competitors[1].name];
    const scores = [brandScore, competitors[0].score, competitors[1].score];

    const config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: scores,
                backgroundColor: [
                    'rgba(168, 85, 247, 0.85)', // purple for us
                    'rgba(255, 255, 255, 0.15)', // grey competitors
                    'rgba(255, 255, 255, 0.15)'
                ],
                borderColor: [
                    '#a855f7',
                    'rgba(255, 255, 255, 0.25)',
                    'rgba(255, 255, 255, 0.25)'
                ],
                borderWidth: 1,
                borderRadius: 6,
                barThickness: 20
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    min: 0, max: 100,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#9ca3af', font: { size: 8 }, stepSize: 20 }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#f3f4f6', font: { size: 9, weight: 'bold' } }
                }
            }
        }
    };

    if (competitorChart) {
        competitorChart.destroy();
    }
    competitorChart = new Chart(ctx, config);
}

// --- DONUT CHART (Sentiment Distribution) ---
function renderOrUpdateDonutChart(mentions) {
    const ctx = document.getElementById('donutChart').getContext('2d');

    const positive = mentions.filter(m => m.sentiment === 'Positive').length;
    const neutral = mentions.filter(m => m.sentiment === 'Neutral').length;
    const negative = mentions.filter(m => m.sentiment === 'Negative').length;

    const config = {
        type: 'doughnut',
        data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [{
                data: [positive, neutral, negative],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#9ca3af',
                        font: { size: 9 },
                        boxWidth: 8
                    }
                }
            },
            cutout: '65%'
        }
    };

    if (donutChart) {
        donutChart.destroy();
    }
    donutChart = new Chart(ctx, config);
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    
    // Toggle Brand Settings Panel
    const openSettingsBtn = document.getElementById('open-settings-btn');
    const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
    const viewPanel = document.getElementById('brand-view-panel');
    const editPanel = document.getElementById('brand-edit-panel');

    openSettingsBtn.addEventListener('click', () => {
        viewPanel.classList.add('hidden');
        editPanel.classList.remove('hidden');
        openSettingsBtn.classList.add('hidden');
    });

    cancelSettingsBtn.addEventListener('click', () => {
        editPanel.classList.add('hidden');
        viewPanel.classList.remove('hidden');
        openSettingsBtn.classList.remove('hidden');
    });

    // Save Brand Settings
    document.getElementById('brand-settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const brandPayload = {
            name: document.getElementById('brand-name').value.trim(),
            industry: document.getElementById('brand-industry').value.trim(),
            instagram_handle: document.getElementById('brand-insta').value.trim(),
            twitter_handle: document.getElementById('brand-twitter').value.trim()
        };

        let success = false;
        try {
            const res = await fetch(`${API_BASE_URL}/brand`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(brandPayload)
            });
            if (res.ok) success = true;
        } catch (error) {
            console.warn("Backend offline. Updating local brand model.");
        }

        if (!success) {
            localBrand = brandPayload;
        }

        editPanel.classList.add('hidden');
        viewPanel.classList.remove('hidden');
        openSettingsBtn.classList.remove('hidden');
        
        await refreshDashboardData();
    });

    // Filters Toggle
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.getAttribute('data-filter');
            filterAndRenderFeed(currentFilter);
        });
    });

    // Publish Custom Mention Form
    document.getElementById('mention-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            username: document.getElementById('username').value.trim().replace(/^@/, ''),
            platform: document.getElementById('platform').value,
            sentiment: document.getElementById('sentiment').value,
            text: document.getElementById('comment-text').value.trim()
        };

        let success = false;
        try {
            const res = await fetch(`${API_BASE_URL}/mentions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) success = true;
        } catch (err) {
            console.warn("Backend offline. Simulating mention locally.");
        }

        if (!success) {
            // Apply local simulator
            localMentions.unshift({
                id: localMentions.length + 1,
                username: payload.username,
                platform: payload.platform,
                sentiment: payload.sentiment,
                text: payload.text,
                timestamp: new Date()
            });
            localMetrics.total_comments += 1;
            if (payload.platform === 'instagram') {
                if (payload.sentiment === 'Positive') localMetrics.instagram_likes += 15;
            } else {
                if (payload.sentiment === 'Positive') localMetrics.twitter_likes += 10;
            }
            const positiveCount = localMentions.filter(m => m.sentiment === 'Positive').length;
            localMetrics.sentiment_score = Math.round((positiveCount / localMentions.length) * 100);

            // Smooth last trend node
            const lastIdx = localTrend.length - 1;
            localTrend[lastIdx].positive = Math.round((localTrend[lastIdx].positive + localMetrics.sentiment_score) / 2);
            localTrend[lastIdx].negative = Math.round((localTrend[lastIdx].negative + Math.round((localMentions.filter(m => m.sentiment === 'Negative').length / localMentions.length)*100)) / 2);
            localTrend[lastIdx].neutral = 100 - localTrend[lastIdx].positive - localTrend[lastIdx].negative;
        }

        document.getElementById('comment-text').value = '';
        await refreshDashboardData();
    });

    // Auto-Crawler Toggle Switch
    const crawlerSwitch = document.getElementById('crawler-switch');
    crawlerSwitch.addEventListener('change', () => {
        if (crawlerSwitch.checked) {
            // Start Auto-Crawler Interval
            crawlerIntervalId = setInterval(async () => {
                let crawledSuccess = false;
                try {
                    const res = await fetch(`${API_BASE_URL}/mentions/crawl`, { method: 'POST' });
                    if (res.ok) crawledSuccess = true;
                } catch (err) {
                    console.log("Crawl API request failed. Simulating local crawl.");
                }

                if (!crawledSuccess) {
                    // Local Simulation
                    const temp = localCrawlerTemplates[Math.floor(Math.random() * localCrawlerTemplates.length)];
                    const randSuffix = Math.floor(Math.random() * 90) + 10;
                    
                    localMentions.unshift({
                        id: localMentions.length + 1,
                        username: `${temp.username}_${randSuffix}`,
                        platform: temp.platform,
                        sentiment: temp.sentiment,
                        text: temp.text,
                        timestamp: new Date()
                    });

                    localMetrics.total_comments += 1;
                    if (temp.platform === 'instagram') {
                        if (temp.sentiment === 'Positive') localMetrics.instagram_likes += 15;
                    } else {
                        if (temp.sentiment === 'Positive') localMetrics.twitter_likes += 10;
                    }

                    const positiveCount = localMentions.filter(m => m.sentiment === 'Positive').length;
                    localMetrics.sentiment_score = Math.round((positiveCount / localMentions.length) * 100);

                    // Recalculate trend node
                    const lastIdx = localTrend.length - 1;
                    localTrend[lastIdx].positive = Math.round((localTrend[lastIdx].positive + localMetrics.sentiment_score) / 2);
                    localTrend[lastIdx].neutral = 100 - localTrend[lastIdx].positive - localTrend[lastIdx].negative;
                }

                await refreshDashboardData();
            }, 10000); // crawl every 10 seconds
            
            // Visual indicator
            document.querySelector('.status-indicator').style.animation = 'blink 0.5s infinite';
        } else {
            // Stop Interval
            if (crawlerIntervalId) {
                clearInterval(crawlerIntervalId);
                crawlerIntervalId = null;
            }
            document.querySelector('.status-indicator').style.animation = '';
        }
    });
}
