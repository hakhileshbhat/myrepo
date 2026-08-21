import random
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="BrandPulse API", description="SaaS Brand Sentiment Analytics Backend")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-Memory Database ---

# Brand State
brand_db = {
    "name": "Bella Pasta Cafe",
    "industry": "Food & Beverage",
    "instagram_handle": "@bellapasta_cafe",
    "twitter_handle": "@bellapasta_cafe"
}

# Competitors
competitors_db = [
    {"name": "Trattoria Romana", "score": 82},
    {"name": "Olive & Basil", "score": 67}
]

# Comments and Mentions database
mentions_db = [
    {
        "id": 1,
        "username": "sarah_bakes",
        "platform": "instagram",
        "text": "Absolutely love the new sourdough bread! The crust is perfection. 🥐❤️",
        "sentiment": "Positive",
        "timestamp": datetime.now() - timedelta(minutes=15)
    },
    {
        "id": 2,
        "username": "tech_guy_99",
        "platform": "twitter",
        "text": "Service at the local branch was super slow today. Took 20 mins to get a coffee.",
        "sentiment": "Negative",
        "timestamp": datetime.now() - timedelta(minutes=45)
    },
    {
        "id": 3,
        "username": "design_explorer",
        "platform": "instagram",
        "text": "The shop interior is beautiful, but the seating is a bit limited.",
        "sentiment": "Neutral",
        "timestamp": datetime.now() - timedelta(hours=2)
    },
    {
        "id": 4,
        "username": "fitness_freak",
        "platform": "instagram",
        "text": "Stunning service and healthy food options! Will definitely come back every week! 💪",
        "sentiment": "Positive",
        "timestamp": datetime.now() - timedelta(hours=4)
    },
    {
        "id": 5,
        "username": "angry_customer",
        "platform": "twitter",
        "text": "Tried calling customer support 3 times, no response. Extremely disappointed.",
        "sentiment": "Negative",
        "timestamp": datetime.now() - timedelta(hours=6)
    },
    {
        "id": 6,
        "username": "local_foodie",
        "platform": "instagram",
        "text": "Decent coffee, normal prices. A good spot to do some quick remote work.",
        "sentiment": "Neutral",
        "timestamp": datetime.now() - timedelta(hours=8)
    },
    {
        "id": 7,
        "username": "emma_green",
        "platform": "twitter",
        "text": "So glad they started using biodegradable packaging! BrandPulse is leading the way! 🌿",
        "sentiment": "Positive",
        "timestamp": datetime.now() - timedelta(hours=12)
    }
]

# Summary base metrics (to add dynamic shifts on top of)
base_metrics = {
    "instagram_likes": 12450,
    "instagram_growth": 14.2,
    "twitter_likes": 8920,
    "twitter_growth": 8.6,
    "total_comments": 2135
}

# 30 Days historical trend
def generate_historical_trend():
    trend_data = []
    base_date = datetime.now() - timedelta(days=30)
    
    random.seed(42)
    pos = 65
    neu = 20
    neg = 15
    
    for i in range(30):
        current_date = base_date + timedelta(days=i)
        pos = max(10, min(90, pos + random.randint(-5, 7)))
        neg = max(5, min(40, neg + random.randint(-4, 3)))
        neu = 100 - pos - neg
        
        trend_data.append({
            "date": current_date.strftime("%b %d"),
            "positive": pos,
            "neutral": neu,
            "negative": neg
        })
    return trend_data

historical_trend = generate_historical_trend()

# --- Request Schemas ---

class MentionCreate(BaseModel):
    username: str
    platform: str
    text: str
    sentiment: str

class BrandUpdate(BaseModel):
    name: str
    industry: str
    instagram_handle: str
    twitter_handle: str

# Crawler Templates (for generating auto-crawler mock content)
crawler_templates = [
    {"username": "cafe_connoisseur", "platform": "instagram", "text": "Their iced mocha is the absolute best in town! ☕✨", "sentiment": "Positive"},
    {"username": "nyc_wanderer", "platform": "twitter", "text": "Highly disappointed with the order delay. Waited over 40 mins and it was cold.", "sentiment": "Negative"},
    {"username": "healthy_bites", "platform": "instagram", "text": "Nice salads, but I wish they had more dressing options.", "sentiment": "Neutral"},
    {"username": "reviewer_pro", "platform": "twitter", "text": "The brand's environmental initiative is outstanding. Support local business!", "sentiment": "Positive"},
    {"username": "curious_foodie", "platform": "instagram", "text": "Is this place pet-friendly? Thinking of visiting tomorrow.", "sentiment": "Neutral"},
    {"username": "unhappy_client", "platform": "twitter", "text": "They forgot to add sugar to my coffee and the muffin was dry.", "sentiment": "Negative"},
    {"username": "morning_person", "platform": "instagram", "text": "Clean aesthetics, super friendly staff, and high speed Wi-Fi. 🌟", "sentiment": "Positive"},
    {"username": "trend_watcher", "platform": "twitter", "text": "Seems like they are trending on social media lately. Good marketing.", "sentiment": "Neutral"}
]

# --- API Endpoints ---

@app.get("/api/brand")
def get_brand():
    return brand_db

@app.post("/api/brand")
def update_brand(brand: BrandUpdate):
    brand_db["name"] = brand.name
    brand_db["industry"] = brand.industry
    brand_db["instagram_handle"] = brand.instagram_handle
    brand_db["twitter_handle"] = brand.twitter_handle
    return {"message": "Brand settings updated successfully", "brand": brand_db}

@app.get("/api/competitors")
def get_competitors():
    return competitors_db

@app.get("/api/metrics")
def get_metrics():
    total_db_comments = len(mentions_db)
    positive_count = sum(1 for m in mentions_db if m["sentiment"] == "Positive")
    total_count = len(mentions_db)
    sentiment_score = int((positive_count / total_count) * 100) if total_count > 0 else 75
    
    return {
        "instagram_likes": base_metrics["instagram_likes"] + sum(15 for m in mentions_db if m["platform"] == "instagram" and m["sentiment"] == "Positive"),
        "instagram_growth": base_metrics["instagram_growth"],
        "twitter_likes": base_metrics["twitter_likes"] + sum(10 for m in mentions_db if m["platform"] == "twitter" and m["sentiment"] == "Positive"),
        "twitter_growth": base_metrics["twitter_growth"],
        "total_comments": base_metrics["total_comments"] + total_db_comments,
        "sentiment_score": sentiment_score
    }

@app.get("/api/sentiment-trend")
def get_sentiment_trend():
    return historical_trend

@app.get("/api/mentions")
def get_mentions():
    sorted_mentions = sorted(mentions_db, key=lambda x: x["timestamp"], reverse=True)
    formatted_mentions = []
    
    for m in sorted_mentions:
        delta = datetime.now() - m["timestamp"]
        if delta.seconds < 60:
            time_str = "Just now"
        elif delta.seconds < 3600:
            time_str = f"{delta.seconds // 60}m ago"
        elif delta.days < 1:
            time_str = f"{delta.seconds // 3600}h ago"
        else:
            time_str = f"{delta.days}d ago"
            
        formatted_mentions.append({
            "id": m["id"],
            "username": m["username"],
            "platform": m["platform"],
            "text": m["text"],
            "sentiment": m["sentiment"],
            "time": time_str
        })
    return formatted_mentions

# Function to add mention and recalculate trend
def add_mention_internal(username: str, platform: str, text: str, sentiment: str):
    new_id = len(mentions_db) + 1
    new_mention = {
        "id": new_id,
        "username": username,
        "platform": platform,
        "text": text,
        "sentiment": sentiment,
        "timestamp": datetime.now()
    }
    mentions_db.append(new_mention)
    
    # Dynamic trend update
    last_idx = len(historical_trend) - 1
    current_pos_count = sum(1 for m in mentions_db if m["sentiment"] == "Positive")
    current_neg_count = sum(1 for m in mentions_db if m["sentiment"] == "Negative")
    current_total = len(mentions_db)
    
    new_pos = int((current_pos_count / current_total) * 100)
    new_neg = int((current_neg_count / current_total) * 100)
    
    historical_trend[last_idx]["positive"] = int((historical_trend[last_idx]["positive"] + new_pos) / 2)
    historical_trend[last_idx]["negative"] = int((historical_trend[last_idx]["negative"] + new_neg) / 2)
    historical_trend[last_idx]["neutral"] = 100 - historical_trend[last_idx]["positive"] - historical_trend[last_idx]["negative"]
    
    return new_mention

@app.post("/api/mentions")
def create_mention(mention: MentionCreate):
    if mention.platform not in ["instagram", "twitter"]:
        raise HTTPException(status_code=400, detail="Platform must be 'instagram' or 'twitter'")
    if mention.sentiment not in ["Positive", "Neutral", "Negative"]:
        raise HTTPException(status_code=400, detail="Sentiment must be 'Positive', 'Neutral', or 'Negative'")
        
    new_m = add_mention_internal(mention.username, mention.platform, mention.text, mention.sentiment)
    return {"message": "Mention added successfully", "mention": new_m}

@app.post("/api/mentions/crawl")
def crawl_mention():
    # Pick a random template and add it
    template = random.choice(crawler_templates)
    
    # Customise username a bit to make it unique
    rand_suffix = random.randint(10, 99)
    username = f"{template['username']}_{rand_suffix}"
    
    new_m = add_mention_internal(
        username,
        template["platform"],
        template["text"],
        template["sentiment"]
    )
    return {"message": "Crawl search found new mention", "mention": new_m}
