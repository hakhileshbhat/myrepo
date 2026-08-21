/**
 * Dress Brand Revenue Dashboard - Mock Database
 * 
 * Simulated database engine that generates realistic sales, revenue, cost,
 * and profit/loss metrics for 10 fashion brands and their dress types.
 * Features deterministic seeding so data remains consistent across reloads.
 */

// Simple Seedable Pseudo-Random Number Generator (LCG) to ensure reproducible mock data
function createRandom(seed) {
    let current = seed;
    return function() {
        current = (current * 9301 + 49297) % 233280;
        return current / 233280;
    };
}

const BRANDS = [
    { id: 'sabyasachi', name: 'Sabyasachi', tier: 'Luxury', logo: '👑', social: { igLikes: 1420, igComments: 110, twLikes: 12, twComments: 4, fbComments: 15 } },
    { id: 'manish-malhotra', name: 'Manish Malhotra', tier: 'Luxury', logo: '✨', social: { igLikes: 1350, igComments: 95, twLikes: 25, twComments: 8, fbComments: 18 } },
    { id: 'anita-dongre', name: 'Anita Dongre', tier: 'Luxury', logo: '🌸', social: { igLikes: 1100, igComments: 75, twLikes: 18, twComments: 5, fbComments: 25 } },
    { id: 'mohey', name: 'Mohey', tier: 'Premium', logo: '👰', social: { igLikes: 980, igComments: 75, twLikes: 20, twComments: 6, fbComments: 44 } },
    { id: 'ritu-kumar', name: 'Ritu Kumar', tier: 'Premium', logo: '🏺', social: { igLikes: 450, igComments: 35, twLikes: 15, twComments: 4, fbComments: 42 } },
    { id: 'masaba', name: 'House of Masaba', tier: 'Premium', logo: '🐆', social: { igLikes: 950, igComments: 68, twLikes: 35, twComments: 12, fbComments: 30 } },
    { id: 'soch', name: 'Soch', tier: 'Premium', logo: '👗', social: { igLikes: 420, igComments: 28, twLikes: 12, twComments: 3, fbComments: 55 } },
    { id: 'fabindia', name: 'Fabindia', tier: 'Premium', logo: '🌿', social: { igLikes: 320, igComments: 22, twLikes: 22, twComments: 6, fbComments: 85 } },
    { id: 'biba', name: 'BIBA', tier: 'FastFashion', logo: '💃', social: { igLikes: 180, igComments: 12, twLikes: 8, twComments: 2, fbComments: 65 } },
    { id: 'w-woman', name: 'W for Woman', tier: 'FastFashion', logo: '👚', social: { igLikes: 160, igComments: 10, twLikes: 9, twComments: 3, fbComments: 58 } },
    { id: 'global-desi', name: 'Global Desi', tier: 'FastFashion', logo: '🎨', social: { igLikes: 240, igComments: 18, twLikes: 14, twComments: 4, fbComments: 48 } },
    { id: 'libas', name: 'Libas', tier: 'FastFashion', logo: '🛍️', social: { igLikes: 350, igComments: 24, twLikes: 15, twComments: 4, fbComments: 62 } },
    { id: 'aurelia', name: 'Aurelia', tier: 'FastFashion', logo: '🌸', social: { igLikes: 190, igComments: 14, twLikes: 6, twComments: 1, fbComments: 48 } },
    { id: 'westside', name: 'Westside', tier: 'FastFashion', logo: '🛒', social: { igLikes: 280, igComments: 20, twLikes: 20, twComments: 7, fbComments: 72 } }
];

const DRESS_TYPES = [
    { id: 'lehenga', name: 'Lehenga Choli', seasonality: 'winter' },
    { id: 'anarkali', name: 'Anarkali Suit', seasonality: 'fall' },
    { id: 'saree', name: 'Designer Saree', seasonality: 'fall' },
    { id: 'kurti', name: 'Casual Kurti', seasonality: 'summer' },
    { id: 'salwar-suit', name: 'Salwar Kameez', seasonality: 'spring' },
    { id: 'gown', name: 'Indo-Western Gown', seasonality: 'winter' },
    { id: 'palazzo-set', name: 'Palazzo Set', seasonality: 'summer' },
    { id: 'maxi-dress', name: 'Cotton Maxi', seasonality: 'summer' },
    { id: 'kaftan', name: 'Kaftan Dress', seasonality: 'summer' },
    { id: 'kurta', name: 'A-Line Kurta', seasonality: 'spring' }
];

// Price and Cost configurations by tier and dress type (in INR ₹) - Small-to-Medium DTC Scale
const CONFIG = {
    FastFashion: {
        priceRange: [25000.00, 50000.00],
        cogsPercent: [0.22, 0.30], // 22% to 30% of price
        marketingPercent: [0.10, 0.16],
        shippingRange: [1000.00, 2500.00],
        baseMonthlyVolume: [0.015, 0.035] // Scale down to keep individual brand totals below 3,00,000
    },
    Premium: {
        priceRange: [50000.00, 150000.00],
        cogsPercent: [0.18, 0.24], // 18% to 24% of price
        marketingPercent: [0.12, 0.20],
        shippingRange: [2500.00, 5000.00],
        baseMonthlyVolume: [0.008, 0.018]
    },
    Luxury: {
        priceRange: [150000.00, 300000.00],
        cogsPercent: [0.12, 0.18], // 12% to 18% of price
        marketingPercent: [0.15, 0.25], // couture marketing relative to tier
        shippingRange: [5000.00, 10000.00],
        baseMonthlyVolume: [0.003, 0.008]
    }
};

// Validation function: Formats as INR string without arbitrary clamping
window.validateAndFormatPrice = function(priceInput) {
    const numeric = parseFloat(priceInput);
    if (isNaN(numeric)) {
        return "₹0";
    }
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(numeric);
};

// Helper function to clamp individual dress specs
const clampPrice = (val) => {
    if (typeof val !== 'number') return val;
    return Math.max(25000, Math.min(300000, val));
};

// Helper function to clamp price/budget metrics
const clampVal = (val) => {
    if (typeof val !== 'number') return val;
    return Math.max(25000, Math.min(300000, val));
};

class DressDatabase {
    constructor() {
        this.brands = BRANDS;
        this.dressTypes = DRESS_TYPES;
        this.salesData = [];
        this.transactions = [];
        this.initializeData();
    }

    initializeData() {
        // Seeded random number generator so data is predictable
        const rand = createRandom(2026);
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // 1. Generate core brand-dress configs (price, cogs, fixed costs)
        const brandDressSpecs = {};

        this.brands.forEach(brand => {
            brandDressSpecs[brand.id] = {};
            const tierConfig = CONFIG[brand.tier];

            this.dressTypes.forEach(type => {
                // Generate base attributes
                const basePrice = tierConfig.priceRange[0] + rand() * (tierConfig.priceRange[1] - tierConfig.priceRange[0]);
                // Custom modifiers for Indian dress types
                let modifier = 1.0;
                if (type.id === 'lehenga') modifier = 2.2;
                else if (type.id === 'saree') modifier = 1.4;
                else if (type.id === 'gown') modifier = 1.6;
                else if (type.id === 'kurti') modifier = 0.55;
                else if (type.id === 'kurta') modifier = 0.75;
                else if (type.id === 'maxi-dress' || type.id === 'kaftan') modifier = 0.85;

                let price = Math.round(basePrice * modifier * 100) / 100;
                // Clamp price strictly between 500 and 2500
                price = clampPrice(price);

                let cogs = Math.round(price * (tierConfig.cogsPercent[0] + rand() * (tierConfig.cogsPercent[1] - tierConfig.cogsPercent[0])) * 100) / 100;
                cogs = clampPrice(cogs);
                
                // Marketing percentage is dynamic per brand.
                const mktPct = tierConfig.marketingPercent[0] + rand() * (tierConfig.marketingPercent[1] - tierConfig.marketingPercent[0]);
                let marketingPerUnit = Math.round(price * mktPct * 100) / 100;
                marketingPerUnit = clampPrice(marketingPerUnit);

                let shipping = Math.round((tierConfig.shippingRange[0] + rand() * (tierConfig.shippingRange[1] - tierConfig.shippingRange[0])) * 100) / 100;
                shipping = clampPrice(shipping);
                
                // Fixed monthly expenses in INR for a small brand (rent, utilities, 1-2 staff)
                let fixedCost = brand.tier === 'Luxury' ? 25000 + rand() * 15000 : (brand.tier === 'Premium' ? 12000 + rand() * 8000 : 6000 + rand() * 4000);
                fixedCost = clampPrice(fixedCost);

                brandDressSpecs[brand.id][type.id] = {
                    price,
                    cogs,
                    marketingPerUnit,
                    shipping,
                    fixedCost: Math.round(fixedCost)
                };
            });
        });

        // 2. Generate monthly aggregated data for all 12 months of 2025
        this.brands.forEach(brand => {
            const tierConfig = CONFIG[brand.tier];

            this.dressTypes.forEach(type => {
                const spec = brandDressSpecs[brand.id][type.id];
                
                months.forEach((month, monthIndex) => {
                    // Seasonality multiplier based on month index (0-11)
                    let seasonalMultiplier = 1.0;
                    if (type.seasonality === 'summer') {
                        // High in June, July, August (index 5, 6, 7)
                        seasonalMultiplier = [0.4, 0.5, 0.8, 1.2, 1.5, 1.8, 1.9, 1.6, 1.1, 0.7, 0.4, 0.3][monthIndex];
                    } else if (type.seasonality === 'winter') {
                        // High in Nov, Dec, Jan (index 10, 11, 0)
                        seasonalMultiplier = [1.7, 1.1, 0.6, 0.4, 0.3, 0.3, 0.4, 0.5, 0.7, 1.1, 1.6, 2.0][monthIndex];
                    } else if (type.seasonality === 'spring') {
                        // High in March, April, May (index 2, 3, 4)
                        seasonalMultiplier = [0.6, 0.8, 1.4, 1.7, 1.6, 1.1, 0.8, 0.6, 0.7, 0.9, 0.7, 0.5][monthIndex];
                    } else if (type.seasonality === 'fall') {
                        // High in Sept, Oct, Nov (index 8, 9, 10)
                        seasonalMultiplier = [0.6, 0.7, 0.8, 0.7, 0.6, 0.6, 0.7, 0.9, 1.4, 1.7, 1.5, 1.0][monthIndex];
                    }

                    // Add random noise (+/- 15%)
                    const noise = 0.85 + rand() * 0.3;
                    
                    // Monthly base volume
                    const baseVol = tierConfig.baseMonthlyVolume[0] + rand() * (tierConfig.baseMonthlyVolume[1] - tierConfig.baseMonthlyVolume[0]);
                    const rawVol = baseVol * seasonalMultiplier * noise;
                    const quantity = Math.max(1, Math.round(rawVol));
                    
                    // Calculate financial breakdown
                    let revenue = 0;
                    let cogsTotal = 0;
                    let marketingTotal = 0;
                    let shippingTotal = 0;
                    let fixedAllocation = 0;
                    let totalCost = 0;
                    let profitOrLoss = 0;

                    if (quantity > 0) {
                        revenue = clampVal(Math.round(quantity * spec.price * 100) / 100);
                        cogsTotal = clampVal(Math.round(quantity * spec.cogs * 100) / 100);
                        
                        let promoMultiplier = 1.0;
                        if (monthIndex === 10 || monthIndex === 11 || monthIndex === 5) {
                            promoMultiplier = 1.4; // Black Friday / Holiday campaign pushes marketing up
                        }
                        marketingTotal = clampVal(Math.round(quantity * spec.marketingPerUnit * promoMultiplier * 100) / 100);
                        shippingTotal = clampVal(Math.round(quantity * spec.shipping * 100) / 100);
                        fixedAllocation = clampVal(spec.fixedCost / 12);

                        totalCost = clampVal(Math.round((cogsTotal + marketingTotal + shippingTotal + fixedAllocation) * 100) / 100);
                        profitOrLoss = clampVal(Math.round((revenue - totalCost) * 100) / 100);
                    }

                    const margin = revenue > 0 ? Math.round((profitOrLoss / revenue) * 1000) / 10 : 0;
                    const returnRate = Math.round((2.0 + rand() * 12.0) * 10) / 10; // 2% to 14% returns

                    // Calculate social metrics correlated with sales quantities
                    const rating = Math.round((3.8 + rand() * 1.2) * 10) / 10;
                    const igLikes = Math.round(quantity * brand.social.igLikes * noise);
                    const igComments = Math.round(igLikes * (0.05 + rand() * 0.05));
                    const twLikes = Math.round(quantity * brand.social.twLikes * noise);
                    const twComments = Math.round(twLikes * (0.10 + rand() * 0.08));
                    const fbComments = Math.round(quantity * brand.social.fbComments * noise);
                    const fbLikes = Math.round(fbComments * (8 + rand() * 5));

                    // Sentiment ratio based on rating (e.g. 4.0 out of 5 translates to 80% positive)
                    const posRatio = rating / 5;
                    const igLikesPos = Math.round(igLikes * posRatio);
                    const igLikesNeg = igLikes - igLikesPos;
                    const igCommentsPos = Math.round(igComments * posRatio);
                    const igCommentsNeg = igComments - igCommentsPos;

                    const twLikesPos = Math.round(twLikes * posRatio);
                    const twLikesNeg = twLikes - twLikesPos;
                    const twCommentsPos = Math.round(twComments * posRatio);
                    const twCommentsNeg = twComments - twCommentsPos;

                    const fbCommentsPos = Math.round(fbComments * posRatio);
                    const fbCommentsNeg = fbComments - fbCommentsPos;
                    const fbLikesPos = Math.round(fbLikes * posRatio);
                    const fbLikesNeg = fbLikes - fbLikesPos;

                    const record = {
                        brandId: brand.id,
                        brandName: brand.name,
                        dressTypeId: type.id,
                        dressTypeName: type.name,
                        month,
                        monthIndex,
                        quantity,
                        price: spec.price,
                        revenue,
                        cogs: cogsTotal,
                        marketing: marketingTotal,
                        shipping: shippingTotal,
                        fixedAllocated: Math.round(fixedAllocation * 100) / 100,
                        totalCost,
                        profitOrLoss,
                        margin,
                        returnRate,
                        rating,
                        igLikes,
                        igComments,
                        twLikes,
                        twComments,
                        fbLikes,
                        fbComments,
                        igLikesPos,
                        igLikesNeg,
                        igCommentsPos,
                        igCommentsNeg,
                        twLikesPos,
                        twLikesNeg,
                        twCommentsPos,
                        twCommentsNeg,
                        fbLikesPos,
                        fbLikesNeg,
                        fbCommentsPos,
                        fbCommentsNeg
                    };

                    this.salesData.push(record);
                });
            });
        });

        // 3. Generate individual transaction lines (recent transactions log)
        // Let's generate 150 recent transactions from November/December for the table log
        const targetMonths = ['November', 'December'];
        let txId = 10000;
        
        for (let i = 0; i < 150; i++) {
            const brand = this.brands[Math.floor(rand() * this.brands.length)];
            const type = this.dressTypes[Math.floor(rand() * this.dressTypes.length)];
            const spec = brandDressSpecs[brand.id][type.id];
            const month = targetMonths[Math.floor(rand() * targetMonths.length)];
            
            // Random day in month
            const day = Math.floor(rand() * 28) + 1;
            const formattedDate = `2025-${month === 'November' ? '11' : '12'}-${day.toString().padStart(2, '0')}`;
            
            const quantity = 1;
            const revenue = clampVal(Math.round(quantity * spec.price * 100) / 100);
            const cogs = clampVal(Math.round(quantity * spec.cogs * 100) / 100);
            const marketing = clampVal(Math.round(quantity * spec.marketingPerUnit * 1.2 * 100) / 100); // Holiday marketing markup
            const shipping = clampVal(Math.round(quantity * spec.shipping * 100) / 100);
            
            // Allocation of fixed overhead
            const allocatedFixed = clampVal(Math.round((spec.fixedCost / 12 / 10) * quantity * 100) / 100);
            const totalCost = clampVal(Math.round((cogs + marketing + shipping + allocatedFixed) * 100) / 100);
            const profitOrLoss = clampVal(Math.round((revenue - totalCost) * 100) / 100);
            
            this.transactions.push({
                id: `TX-${txId++}`,
                date: formattedDate,
                brandId: brand.id,
                brandName: brand.name,
                dressTypeId: type.id,
                dressTypeName: type.name,
                quantity,
                price: spec.price,
                revenue,
                cost: totalCost,
                profitOrLoss,
                customerStatus: rand() > 0.12 ? 'Completed' : 'Refunded'
            });
        }

        // Post-process normalization to enforce user constraints exactly at the raw data level
        
        // 1. Apply a dress-specific jitter so different products have wildly different natural margins
        this.salesData.forEach(s => {
            const dressHash = (s.dressTypeName.charCodeAt(0) * 17 + s.brandName.charCodeAt(0)) % 100;
            const dressJitter = 0.2 + (dressHash / 100) * 2.0; // multiplier from 0.2x to 2.2x
            s.profitOrLoss = s.profitOrLoss * dressJitter;
        });
        
        // 2. Calculate pre-normalized totals
        let moheyProfit = 0;
        let otherProfit = 0;
        this.salesData.forEach(s => {
            if (s.brandId === 'mohey') moheyProfit += s.profitOrLoss;
            else otherProfit += s.profitOrLoss;
        });

        const moheyTarget = -500;
        const otherTarget = 65000; // Total other profit between 5k and 100k

        let actualMoheyAgg = 0;
        let actualOtherAgg = 0;

        this.salesData.forEach(s => {
            let newProfit = s.profitOrLoss;
            if (s.brandId === 'mohey' && moheyProfit !== 0) {
                newProfit = Math.round(s.profitOrLoss * (moheyTarget / moheyProfit));
                actualMoheyAgg += newProfit;
            } else if (s.brandId !== 'mohey' && otherProfit !== 0) {
                newProfit = Math.round(s.profitOrLoss * (otherTarget / otherProfit));
                actualOtherAgg += newProfit;
            }
            
            s.profitOrLoss = newProfit;
        });
        
        // Exact reconciliation to absorb Math.round drift
        const firstMohey = this.salesData.find(s => s.brandId === 'mohey');
        if (firstMohey) firstMohey.profitOrLoss += (moheyTarget - actualMoheyAgg);
        
        const firstOther = this.salesData.find(s => s.brandId !== 'mohey');
        if (firstOther) firstOther.profitOrLoss += (otherTarget - actualOtherAgg);

        this.salesData.forEach(s => {
            const newProfit = s.profitOrLoss;
            
            // Adjust all cost components proportionally so they mathematically total the required new cost
            const oldTotalCost = s.cogs + s.marketing + s.shipping + s.fixedAllocated;
            const newTotalCost = s.revenue - newProfit;
            const costRatio = oldTotalCost > 0 ? newTotalCost / oldTotalCost : 1;

            s.cogs = Math.round(s.cogs * costRatio);
            s.marketing = Math.round(s.marketing * costRatio);
            s.shipping = Math.round(s.shipping * costRatio);
            s.fixedAllocated = newTotalCost - (s.cogs + s.marketing + s.shipping); // absorb rounding
            s.profitOrLoss = newProfit;
        });
        
        // 3. Force total revenue to be under 3 lakh (target 220,000) while keeping profit constants
        let currentTotalRevenue = 0;
        this.salesData.forEach(s => currentTotalRevenue += s.revenue);
        const targetTotalRevenue = 220000;
        const revenueScale = targetTotalRevenue / currentTotalRevenue;
        
        let actualRevAgg = 0;
        this.salesData.forEach(s => {
            const scaledRev = Math.round(s.revenue * revenueScale);
            actualRevAgg += scaledRev;
            s.revenue = scaledRev;
            
            s.totalCost = s.revenue - s.profitOrLoss;
            const oldTotalCost = s.cogs + s.marketing + s.shipping + s.fixedAllocated;
            const costRatio = oldTotalCost > 0 ? s.totalCost / oldTotalCost : 1;
            
            s.cogs = Math.round(s.cogs * costRatio);
            s.marketing = Math.round(s.marketing * costRatio);
            s.shipping = s.totalCost - (s.cogs + s.marketing); // exact remainder without fixed overhead to keep logic simple
            s.fixedAllocated = 0;
            s.price = s.quantity > 0 ? (s.revenue / s.quantity) : 0;
        });
        
        // Final exact revenue drift reconciliation
        if (this.salesData.length > 0) {
            this.salesData[0].revenue += (targetTotalRevenue - actualRevAgg);
            this.salesData[0].totalCost = this.salesData[0].revenue - this.salesData[0].profitOrLoss;
            this.salesData[0].shipping += (targetTotalRevenue - actualRevAgg); // Absorb remainder into shipping to perfectly balance
        }
        
        this.transactions.forEach(t => {
            const dressHash = (t.dressTypeName.charCodeAt(0) * 17 + t.brandName.charCodeAt(0)) % 100;
            const dressJitter = 0.2 + (dressHash / 100) * 2.0;
            t.profitOrLoss = t.profitOrLoss * dressJitter;

            let newProfit = t.profitOrLoss;
            if (t.brandId === 'mohey' && moheyProfit !== 0) {
                newProfit = Math.round(t.profitOrLoss * (moheyTarget / moheyProfit));
            } else if (t.brandId !== 'mohey' && otherProfit !== 0) {
                newProfit = Math.round(t.profitOrLoss * (otherTarget / otherProfit));
            }
            t.profitOrLoss = newProfit;
            t.cost = t.revenue - newProfit;
        });

        // Sort transactions by date descending
        this.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    /**
     * Query metrics filtered by brand and dress type
     * @param {string|null} brandId Filter by brand, or null/ "all" for all brands
     * @param {string|null} dressTypeId Filter by dress type, or null/ "all" for all dress types
     * @returns {object} Calculated totals, monthly trend series, and transaction lists
     */
    queryDashboardData(brandId = 'all', dressTypeId = 'all', year = 2025) {
        let filteredSales = this.salesData;
        let filteredTx = this.transactions;

        // Apply filters
        if (brandId && brandId !== 'all') {
            filteredSales = filteredSales.filter(s => s.brandId === brandId);
            filteredTx = filteredTx.filter(t => t.brandId === brandId);
        }
        if (dressTypeId && dressTypeId !== 'all') {
            filteredSales = filteredSales.filter(s => s.dressTypeId === dressTypeId);
            filteredTx = filteredTx.filter(t => t.dressTypeId === dressTypeId);
        }
        
        // Year filter: 2026 only has data up to July (monthIndex 6)
        if (year === 2026) {
            filteredSales = filteredSales.filter(s => s.monthIndex <= 6);
            filteredTx = filteredTx.filter(t => {
                const parts = t.date.split(' ');
                const m = parts[2];
                const active = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
                return active.includes(m);
            });
        }

        // Apply mathematical Year-modifier so different years have fundamentally different profiles
        let yrVol = 1.0;
        let yrProfit = 1.0;
        if (year === 2026) {
            yrVol = 1.35;      // 35% more overall revenue volume in 2026
            yrProfit = 0.65;   // But 35% worse profit margins
        } else if (year === 2024) {
            yrVol = 0.80;
            yrProfit = 1.25;
        }

        if (year !== 2025) {
            filteredSales = filteredSales.map(s => {
                const clone = { ...s };
                
                // Add a unique year-specific product hash to scramble the profit margin of each product uniquely in 2026
                const yearProductHash = (s.dressTypeName.charCodeAt(0) * 11 + s.brandName.charCodeAt(0) * year) % 100;
                const productYearJitter = 0.3 + (yearProductHash / 100) * 1.8; // 0.3x to 2.1x modifier
                
                clone.revenue = s.revenue * yrVol;
                clone.profitOrLoss = s.profitOrLoss * yrVol * yrProfit * productYearJitter;
                
                // Proportionally scale costs to maintain perfect math
                clone.totalCost = clone.revenue - clone.profitOrLoss;
                const oldCostSum = s.cogs + s.marketing + s.shipping + s.fixedAllocated;
                const costRatio = oldCostSum > 0 ? clone.totalCost / oldCostSum : 1;
                
                clone.cogs = s.cogs * costRatio;
                clone.marketing = s.marketing * costRatio;
                clone.shipping = s.shipping * costRatio;
                clone.fixedAllocated = clone.totalCost - (clone.cogs + clone.marketing + clone.shipping); // absorb rounding drift
                
                clone.quantity = Math.max(1, Math.round(s.quantity * yrVol));
                return clone;
            });

            // Enforce explicit year-specific targets after scrambling
            if (year === 2026) {
                let moheyCurrentProfit = 0;
                filteredSales.forEach(s => { if (s.brandId === 'mohey') moheyCurrentProfit += s.profitOrLoss; });
                
                const moheyTarget = -500;
                
                filteredSales.forEach(s => {
                    if (s.brandId === 'mohey' && moheyCurrentProfit !== 0) {
                        s.profitOrLoss = s.profitOrLoss * (moheyTarget / moheyCurrentProfit);
                        
                        s.totalCost = s.revenue - s.profitOrLoss;
                        const oldCostSum = s.cogs + s.marketing + s.shipping + s.fixedAllocated;
                        const costRatio = oldCostSum > 0 ? s.totalCost / oldCostSum : 1;
                        s.cogs = s.cogs * costRatio;
                        s.marketing = s.marketing * costRatio;
                        s.shipping = s.shipping * costRatio;
                        s.fixedAllocated = s.totalCost - (s.cogs + s.marketing + s.shipping);
                    }
                });
            }
        }

        // 1. Calculate Totals
        let totalRevenue = 0;
        let totalCOGS = 0;
        let totalMarketing = 0;
        let totalShipping = 0;
        let totalFixed = 0;
        let totalQuantity = 0;
        let weightedReturnRateSum = 0;
        let weightedRatingSum = 0;
        let totalIgLikes = 0;
        let totalIgComments = 0;
        let totalTwLikes = 0;
        let totalTwComments = 0;
        let totalFbComments = 0;
        let totalFbLikes = 0;
        let totalIgLikesPos = 0;
        let totalIgLikesNeg = 0;
        let totalIgCommentsPos = 0;
        let totalIgCommentsNeg = 0;
        let totalTwLikesPos = 0;
        let totalTwLikesNeg = 0;
        let totalTwCommentsPos = 0;
        let totalTwCommentsNeg = 0;
        let totalFbCommentsPos = 0;
        let totalFbCommentsNeg = 0;
        let totalFbLikesPos = 0;
        let totalFbLikesNeg = 0;

        filteredSales.forEach(item => {
            totalRevenue += item.revenue;
            totalCOGS += item.cogs;
            totalMarketing += item.marketing;
            totalShipping += item.shipping;
            totalFixed += item.fixedAllocated;
            totalQuantity += item.quantity;
            weightedReturnRateSum += item.returnRate * item.quantity;
            weightedRatingSum += item.rating * item.quantity;
            totalIgLikes += item.igLikes || 0;
            totalIgComments += item.igComments || 0;
            totalTwLikes += item.twLikes || 0;
            totalTwComments += item.twComments || 0;
            totalFbComments += item.fbComments || 0;
            totalFbLikes += item.fbLikes || 0;
            totalIgLikesPos += item.igLikesPos || 0;
            totalIgLikesNeg += item.igLikesNeg || 0;
            totalIgCommentsPos += item.igCommentsPos || 0;
            totalIgCommentsNeg += item.igCommentsNeg || 0;
            totalTwLikesPos += item.twLikesPos || 0;
            totalTwLikesNeg += item.twLikesNeg || 0;
            totalTwCommentsPos += item.twCommentsPos || 0;
            totalTwCommentsNeg += item.twCommentsNeg || 0;
            totalFbCommentsPos += item.fbCommentsPos || 0;
            totalFbCommentsNeg += item.fbCommentsNeg || 0;
            totalFbLikesPos += item.fbLikesPos || 0;
            totalFbLikesNeg += item.fbLikesNeg || 0;
        });

        const totalCost = totalCOGS + totalMarketing + totalShipping + totalFixed;
        const profitOrLoss = totalRevenue - totalCost;
        
        // Use the true, aggregated financial totals so the sub-components naturally sum to the total KPI
        let clampedProfit = Math.round(profitOrLoss);
        let clampedRevenue = Math.round(totalRevenue);
        let clampedCost = Math.round(totalCost);

        // Allocate clampedCost to sub-expense cards proportionally based strictly on raw data ratios
        const rawTotalExpenses = totalCOGS + totalMarketing + totalShipping + totalFixed;
        
        let cogsVal = 0, marketingVal = 0, shippingVal = 0;
        
        if (rawTotalExpenses > 0) {
            cogsVal      = Math.round(clampedCost * (totalCOGS / rawTotalExpenses));
            marketingVal = Math.round(clampedCost * (totalMarketing / rawTotalExpenses));
            shippingVal  = Math.round(clampedCost * (totalShipping / rawTotalExpenses));
        } else {
            cogsVal = Math.round(clampedCost * 0.5);
            marketingVal = Math.round(clampedCost * 0.3);
            shippingVal = Math.round(clampedCost * 0.2);
        }

        // Final exact reconciliation: force total to match clampedCost exactly
        const subTotal = cogsVal + marketingVal + shippingVal;
        if (subTotal !== clampedCost) {
            shippingVal += (clampedCost - subTotal); // absorb rounding residual
        }

        const margin = clampedRevenue > 0 ? (clampedProfit / clampedRevenue) * 100 : 0;
        const avgReturnRate = totalQuantity > 0 ? weightedReturnRateSum / totalQuantity : 0;
        const avgRating = totalQuantity > 0 ? weightedRatingSum / totalQuantity : 0;

        const summary = {
            revenue: clampedRevenue,
            cogs: cogsVal,
            marketing: marketingVal,
            shipping: shippingVal,
            fixed: 0,
            totalCost: clampedCost,
            profitOrLoss: clampedProfit,
            margin: Math.round(margin * 10) / 10,
            quantity: totalQuantity,
            avgReturnRate: Math.round(avgReturnRate * 10) / 10,
            avgRating: Math.round(avgRating * 10) / 10,
            igLikes: totalIgLikes,
            igComments: totalIgComments,
            twLikes: totalTwLikes,
            twComments: totalTwComments,
            fbComments: totalFbComments,
            fbLikes: totalFbLikes,
            igLikesPos: totalIgLikesPos,
            igLikesNeg: totalIgLikesNeg,
            igCommentsPos: totalIgCommentsPos,
            igCommentsNeg: totalIgCommentsNeg,
            twLikesPos: totalTwLikesPos,
            twLikesNeg: totalTwLikesNeg,
            twCommentsPos: totalTwCommentsPos,
            twCommentsNeg: totalTwCommentsNeg,
            fbCommentsPos: totalFbCommentsPos,
            fbCommentsNeg: totalFbCommentsNeg,
            fbLikesPos: totalFbLikesPos,
            fbLikesNeg: totalFbLikesNeg
        };

        // 2. Generate Monthly Trend — proportionally scaled to exactly match KPI summary totals
        const allMonths = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        // 2026 data only available Jan–Jul
        const activeMonths = year === 2026 ? allMonths.slice(0, 7) : allMonths;

        // Base seasonal pattern
        const multipliers = year === 2026 
            ? [0.55, 0.62, 0.75, 0.88, 1.05, 1.18, 1.30] 
            : [0.70, 0.60, 0.85, 1.10, 1.40, 1.75, 1.90, 1.65, 1.20, 0.90, 0.65, 0.50];

        // Find raw revenue per month based on filteredSales, and multiply by seasonality
        const rawMonthTotals = activeMonths.map((m, idx) => {
            const monthRecords = filteredSales.filter(s => s.monthIndex === idx);
            let rawRev = 0, rawQty = 0;
            monthRecords.forEach(r => { rawRev += r.revenue; rawQty += r.quantity; });
            return { rawRev: Math.max(100, rawRev * multipliers[idx]), qty: rawQty };
        });

        const totalRawRev = rawMonthTotals.reduce((sum, r) => sum + r.rawRev, 0);
        
        // Pre-calculate a separate, randomized ratio track specifically for profit
        let totalProfitWeight = 0;
        rawMonthTotals.forEach((raw, idx) => {
            const revRatio = totalRawRev > 0 ? raw.rawRev / totalRawRev : 1 / activeMonths.length;
            // Generate a unique jitter based on month index, revenue, and YEAR to strictly vary the net profit shape across years
            const yearFactor = year === 2026 ? 37 : 11;
            const jitter = 0.5 + (((idx * 13 + raw.qty * 7) * yearFactor) % 100) / 100; // Between 0.5x and 1.49x deviation
            raw.profitWeight = revRatio * jitter;
            totalProfitWeight += raw.profitWeight;
        });
        
        let remainingRev = clampedRevenue;
        let remainingProfit = clampedProfit;

        const monthlyTrend = activeMonths.map((m, idx) => {
            const raw = rawMonthTotals[idx];
            let rev = 0;
            let pnl = 0;
            
            if (idx === activeMonths.length - 1) {
                // Last month absorbs any rounding remainders to ensure exact match
                rev = Math.max(0, remainingRev);
                pnl = remainingProfit;
            } else {
                const ratio = totalRawRev > 0 ? raw.rawRev / totalRawRev : 1 / activeMonths.length;
                const profitRatio = totalProfitWeight > 0 ? raw.profitWeight / totalProfitWeight : 1 / activeMonths.length;
                rev = Math.round(clampedRevenue * ratio);
                pnl = Math.round(clampedProfit * profitRatio);
                remainingRev -= rev;
                remainingProfit -= pnl;
            }

            return {
                month: m.substring(0, 3),
                revenue: rev,
                cost: rev - pnl,
                profitOrLoss: pnl,
                quantity: raw.qty
            };
        });


        // 3. Generate Dress Type breakdown (for the Doughnut chart)
        const dressTypeBreakdown = DRESS_TYPES.map(type => {
            const typeRecords = filteredSales.filter(s => s.dressTypeId === type.id);
            let rev = 0;
            let pnl = 0;
            typeRecords.forEach(r => {
                rev += r.revenue;
                pnl += r.profitOrLoss;
            });
            return {
                id: type.id,
                name: type.name,
                revenue: Math.round(rev),
                profitOrLoss: Math.round(pnl)
            };
        }).filter(item => item.revenue > 0) // exclude zero items
          .sort((a, b) => b.revenue - a.revenue);

        // Reconcile dress pie chart exactly
        if (dressTypeBreakdown.length > 0) {
            const drRevSum = dressTypeBreakdown.reduce((sum, d) => sum + d.revenue, 0);
            const drPnlSum = dressTypeBreakdown.reduce((sum, d) => sum + d.profitOrLoss, 0);
            dressTypeBreakdown[0].revenue += (clampedRevenue - drRevSum);
            dressTypeBreakdown[0].profitOrLoss += (clampedProfit - drPnlSum);
        }

        // 4. Generate Brand breakdown (when "all" brands selected)
        const brandBreakdown = BRANDS.map(brand => {
            const brandRecords = filteredSales.filter(s => s.brandId === brand.id);
            let rev = 0;
            let pnl = 0;
            brandRecords.forEach(r => {
                rev += r.revenue;
                pnl += r.profitOrLoss;
            });
            return {
                id: brand.id,
                name: brand.name,
                tier: brand.tier,
                logo: brand.logo,
                revenue: Math.round(rev),
                profitOrLoss: Math.round(pnl)
            };
        }).filter(item => item.revenue > 0)
          .sort((a, b) => b.revenue - a.revenue);
          
        // Reconcile brand bar chart exactly
        if (brandBreakdown.length > 0) {
            const brRevSum = brandBreakdown.reduce((sum, b) => sum + b.revenue, 0);
            const brPnlSum = brandBreakdown.reduce((sum, b) => sum + b.profitOrLoss, 0);
            brandBreakdown[0].revenue += (clampedRevenue - brRevSum);
            brandBreakdown[0].profitOrLoss += (clampedProfit - brPnlSum);
        }

        return {
            summary,
            monthlyTrend,
            dressTypeBreakdown,
            brandBreakdown,
            recentTransactions: filteredTx.slice(0, 10) // Limit to top 10 recent
        };
    }

    getRecentSocialPosts(brandId = 'all') {
        const posts = [
            // Sabyasachi
            {
                brandId: 'sabyasachi',
                platform: 'instagram',
                user: '@sanya_couture',
                content: 'Absolute royalty! The hand-woven zari embroidery on this Sabyasachi Lehenga is pure art. 👑✨ #weddingwear',
                likes: 1240,
                comments: 88,
                time: '2h ago',
                sentiment: 'positive'
            },
            {
                brandId: 'sabyasachi',
                platform: 'instagram',
                user: '@priya_sharma',
                content: 'Paid a massive premium but the bridal delivery was delayed by two weeks, causing absolute panic. Fabric is gorgeous but stressful service! 😒',
                likes: 412,
                comments: 94,
                time: '5h ago',
                sentiment: 'negative'
            },
            {
                brandId: 'sabyasachi',
                platform: 'facebook',
                user: 'Aishwarya Sen',
                content: 'The custom fit is majestic. Sabyasachi bespoke service made my wedding day unforgettable. Worth every rupee!',
                likes: 540,
                comments: 38,
                time: '1d ago',
                sentiment: 'positive'
            },
            {
                brandId: 'sabyasachi',
                platform: 'twitter',
                user: '@couture_critic',
                content: 'The new collection is way overpriced. Zari is okay, but not worth the insane markup. Standard premium labels do it for half. 👎',
                likes: 85,
                comments: 42,
                time: '2d ago',
                sentiment: 'negative'
            },

            // Manish Malhotra
            {
                brandId: 'manish-malhotra',
                platform: 'instagram',
                user: '@glam_india',
                content: 'Manish Malhotra designer sarees are always a showstopper. The sequin work caught everyone\'s eye! 💖👗 #couture',
                likes: 980,
                comments: 72,
                time: '4h ago',
                sentiment: 'positive'
            },
            {
                brandId: 'manish-malhotra',
                platform: 'instagram',
                user: '@kavya_m',
                content: 'Beautiful design but the lining fabric feels scratchy and cheap for this luxury price range. 😤',
                likes: 215,
                comments: 63,
                time: '6h ago',
                sentiment: 'negative'
            },
            {
                brandId: 'manish-malhotra',
                platform: 'twitter',
                user: '@bollywood_style',
                content: 'Stunning festive collection! Nobody does high-glam modern sarees like Manish Malhotra. 🌟 #MMStyle',
                likes: 310,
                comments: 48,
                time: '1d ago',
                sentiment: 'positive'
            },
            {
                brandId: 'manish-malhotra',
                platform: 'facebook',
                user: 'Sneha Kapoor',
                content: 'Extremely snobbish staff at the Delhi showroom. They literally judge you before showing any catalog. Worst luxury experience.',
                likes: 180,
                comments: 54,
                time: '2d ago',
                sentiment: 'negative'
            },

            // Anita Dongre
            {
                brandId: 'anita-dongre',
                platform: 'instagram',
                user: '@sustainable_chic',
                content: 'Anita Dongre\'s cotton prints are magical. So elegant, breathable, and ethically made! 🌿🌸 #slowfashion',
                likes: 850,
                comments: 45,
                time: '5h ago',
                sentiment: 'positive'
            },
            {
                brandId: 'anita-dongre',
                platform: 'twitter',
                user: '@fab_reviewer',
                content: 'One of the brass buttons on the tunic came loose on the very first wear. Disappointed in the Quality Control! 🧵',
                likes: 42,
                comments: 18,
                time: '8h ago',
                sentiment: 'negative'
            },
            {
                brandId: 'anita-dongre',
                platform: 'facebook',
                user: 'Kriti Verma',
                content: 'Loved the Palazzo set! Fitting is spot-on and the organic dye colors look spectacular.',
                likes: 120,
                comments: 32,
                time: '1d ago',
                sentiment: 'positive'
            },

            // Ritu Kumar
            {
                brandId: 'ritu-kumar',
                platform: 'facebook',
                user: 'Meenakshi Sharma',
                content: 'Ritu Kumar\'s heritage Anarkali suit fits like a dream. Classic prints that never go out of style.',
                likes: 310,
                comments: 54,
                time: '1d ago',
                sentiment: 'positive'
            },
            {
                brandId: 'ritu-kumar',
                platform: 'instagram',
                user: '@ethnic_wear_fan',
                content: 'The colors look much more faded in real life compared to the bright studio photos. Disappointed with the online buy. 😔',
                likes: 95,
                comments: 34,
                time: '1d ago',
                sentiment: 'negative'
            },
            {
                brandId: 'ritu-kumar',
                platform: 'twitter',
                user: '@heritage_style',
                content: 'Highly elegant cotton sets. Ritu Kumar QC is consistent as always. Classy stuff.',
                likes: 84,
                comments: 15,
                time: '2d ago',
                sentiment: 'positive'
            },

            // House of Masaba
            {
                brandId: 'masaba',
                platform: 'twitter',
                user: '@quirky_fashion',
                content: 'Masaba\'s new wildlife prints on these kaftan dresses are so fresh and bold! Obsessed. 🐆🎨 #houseofmasaba',
                likes: 154,
                comments: 42,
                time: '3h ago',
                sentiment: 'positive'
            },
            {
                brandId: 'masaba',
                platform: 'instagram',
                user: '@modern_drape',
                content: 'Fit of this printed maxi dress is extremely boxy. Doesn\'t look flattering at all unless you\'re 5\'8". Returning it. 🤷‍♀️',
                likes: 72,
                comments: 29,
                time: '6h ago',
                sentiment: 'negative'
            },
            {
                brandId: 'masaba',
                platform: 'instagram',
                user: '@neha_art',
                content: 'Love the quirky neon color combinations! Best designer wear for Sunday brunches.',
                likes: 340,
                comments: 51,
                time: '1d ago',
                sentiment: 'positive'
            },

            // Fabindia
            {
                brandId: 'fabindia',
                platform: 'facebook',
                user: 'Rajesh Iyer',
                content: 'Picked up a simple Fabindia cotton Kurta and Palazzo. Absolute comfort for daily wear in Mumbai heat.',
                likes: 220,
                comments: 98,
                time: '2d ago',
                sentiment: 'positive'
            },
            {
                brandId: 'fabindia',
                platform: 'facebook',
                user: 'Anjali Shah',
                content: 'The cotton fabric shrank significantly after just a single cold wash. Completely unwearable now. 😠',
                likes: 145,
                comments: 88,
                time: '2d ago',
                sentiment: 'negative'
            },
            {
                brandId: 'fabindia',
                platform: 'twitter',
                user: '@khadi_connect',
                content: 'Fabindia indigos are class apart. Pure comfort, eco-friendly dye, and highly durable!',
                likes: 110,
                comments: 23,
                time: '3d ago',
                sentiment: 'positive'
            },

            // BIBA
            {
                brandId: 'biba',
                platform: 'facebook',
                user: 'Pooja Deshmukh',
                content: 'Very happy with the BIBA salwar suit set I bought for the festival. Bright colors and very affordable!',
                likes: 180,
                comments: 65,
                time: '6h ago',
                sentiment: 'positive'
            },
            {
                brandId: 'biba',
                platform: 'instagram',
                user: '@daily_wear_guide',
                content: 'The stitching of the palazzo set came undone under the seams after just one wash. Low-grade thread! 🧵👎',
                likes: 68,
                comments: 42,
                time: '1d ago',
                sentiment: 'negative'
            },
            {
                brandId: 'biba',
                platform: 'instagram',
                user: '@festive_vibes',
                content: 'Beautiful cuts and great designs. Got a nice discount at the Mall outlet!',
                likes: 290,
                comments: 44,
                time: '2d ago',
                sentiment: 'positive'
            },

            // W for Woman
            {
                brandId: 'w-woman',
                platform: 'twitter',
                user: '@workwear_guide',
                content: 'The new W for Woman A-line kurtas are perfect corporate ethnic wear. Sleek, structured, and modern! 💼👚',
                likes: 98,
                comments: 32,
                time: '8h ago',
                sentiment: 'positive'
            },
            {
                brandId: 'w-woman',
                platform: 'facebook',
                user: 'Divya Nair',
                content: 'Sizes run way too small. W-size 8 feels like a standard size 6. Check size charts before buying!',
                likes: 54,
                comments: 29,
                time: '1d ago',
                sentiment: 'negative'
            },
            {
                brandId: 'w-woman',
                platform: 'instagram',
                user: '@contemporary_wear',
                content: 'Love W\'s fusion wear and kurti combinations. Highly modern look for office!',
                likes: 140,
                comments: 22,
                time: '2d ago',
                sentiment: 'positive'
            },

            // Global Desi
            {
                brandId: 'global-desi',
                platform: 'instagram',
                user: '@bohemian_diaries',
                content: 'Draped in a fusion gown from Global Desi. Bohemian prints and easy-going silhouette. 🌾👗 #fusionwear',
                likes: 420,
                comments: 28,
                time: '10h ago',
                sentiment: 'positive'
            },
            {
                brandId: 'global-desi',
                platform: 'twitter',
                user: '@urban_boho',
                content: 'This maxi dress fabric is purely synthetic polyester and feels extremely hot to wear. Complete waste of money. 🥵',
                likes: 38,
                comments: 14,
                time: '1d ago',
                sentiment: 'negative'
            },
            {
                brandId: 'global-desi',
                platform: 'facebook',
                user: 'Neha Rao',
                content: 'Lovely bright patterns and trendy cuts. Perfect summer wardrobe addition.',
                likes: 95,
                comments: 18,
                time: '2d ago',
                sentiment: 'positive'
            },

            // Westside
            {
                brandId: 'westside',
                platform: 'twitter',
                user: '@budget_stylist',
                content: 'Westside ethnic wear is incredibly value-for-money. Palazzo set quality is top-notch! 🛍️✨ #westsidebargain',
                likes: 112,
                comments: 48,
                time: '1d ago',
                sentiment: 'positive'
            },
            {
                brandId: 'westside',
                platform: 'facebook',
                user: 'Vikas Shah',
                content: 'Extremely long billing queues at the Bangalore store. Good clothes, but painful checkout service.',
                likes: 88,
                comments: 41,
                time: '1d ago',
                sentiment: 'negative'
            },
            {
                brandId: 'westside',
                platform: 'instagram',
                user: '@college_style',
                content: 'Westside cotton maxi dresses are super stylish, durable, and highly budget-friendly!',
                likes: 310,
                comments: 39,
                time: '2d ago',
                sentiment: 'positive'
            },

            // Mohey
            {
                brandId: 'mohey',
                platform: 'instagram',
                user: '@bridal_lookbook',
                content: 'Mohey bridal lehengas are stunning! Highly premium look without Sabyasachi prices. 👰💖 #lehenga',
                likes: 840,
                comments: 52,
                time: '3h ago',
                sentiment: 'positive'
            },
            {
                brandId: 'mohey',
                platform: 'instagram',
                user: '@tanya_sharma',
                content: 'Dupatta of my Mohey suit was missing some zari border thread work. QC needs to be tighter for heavy wedding sets. 😒',
                likes: 120,
                comments: 44,
                time: '6h ago',
                sentiment: 'negative'
            },
            {
                brandId: 'mohey',
                platform: 'facebook',
                user: 'Aarati Joshi',
                content: 'Beautiful fabrics and heavy collections. Mohey was my ultimate choice for all my sangeet and mehendi outfits!',
                likes: 410,
                comments: 29,
                time: '1d ago',
                sentiment: 'positive'
            },

            // Soch
            {
                brandId: 'soch',
                platform: 'facebook',
                user: 'Sunita Nair',
                content: 'Highly elegant designs and perfect fit! Soch sarees and tunics are my absolute favorite for family functions.',
                likes: 215,
                comments: 32,
                time: '4h ago',
                sentiment: 'positive'
            },
            {
                brandId: 'soch',
                platform: 'instagram',
                user: '@saree_drapes',
                content: 'The silk fabric of the suit was slightly stiff and uncomfortable to wear in high humidity. Expected softer material.',
                likes: 88,
                comments: 24,
                time: '1d ago',
                sentiment: 'negative'
            },
            {
                brandId: 'soch',
                platform: 'twitter',
                user: '@ethnic_critic',
                content: 'Soch has an amazing range of printed georgette sarees. Very light, beautiful colors, and highly durable!',
                likes: 95,
                comments: 18,
                time: '2d ago',
                sentiment: 'positive'
            },

            // Libas
            {
                brandId: 'libas',
                platform: 'instagram',
                user: '@style_diaries',
                content: 'Libas silk kurtas look extremely rich, heavy, and classy. Got so many compliments at work today! 5h ago #ethnicwear',
                likes: 480,
                comments: 39,
                time: '5h ago',
                sentiment: 'positive'
            },
            {
                brandId: 'libas',
                platform: 'facebook',
                user: 'Jyoti Deshpukh',
                content: 'Sizes run way larger than expected. Size M felt like a standard L. Had to go through a painful return process.',
                likes: 64,
                comments: 28,
                time: '1d ago',
                sentiment: 'negative'
            },
            {
                brandId: 'libas',
                platform: 'twitter',
                user: '@daily_drapes',
                content: 'Simple, cheap, and very comfortable for office wear. Highly recommend their cotton palazzo sets.',
                likes: 110,
                comments: 12,
                time: '2d ago',
                sentiment: 'positive'
            },

            // Aurelia
            {
                brandId: 'aurelia',
                platform: 'instagram',
                user: '@college_chic',
                content: 'Aurelia printed kurtis are so light, casual, and comfortable for college wear. Highly budget-friendly! 👚🎓',
                likes: 310,
                comments: 22,
                time: '7h ago',
                sentiment: 'positive'
            },
            {
                brandId: 'aurelia',
                platform: 'facebook',
                user: 'Maya Patil',
                content: 'The dye bled severely on the very first hand wash, completely staining my other white clothes. Terrible colors!',
                likes: 154,
                comments: 63,
                time: '1d ago',
                sentiment: 'negative'
            },
            {
                brandId: 'aurelia',
                platform: 'twitter',
                user: '@fashion_frugal',
                content: 'Lovely simple designs for daily wear. Fits true to size and fabric is pure cotton.',
                likes: 67,
                comments: 9,
                time: '1d ago',
                sentiment: 'positive'
            }
        ];

        if (brandId === 'all') {
            return posts;
        }
        return posts.filter(p => p.brandId === brandId);
    }
}

// Export database
window.DressDB = new DressDatabase();
