# pyrefly: ignore [missing-import]
import streamlit as st
import networkx as nx
# pyrefly: ignore [missing-import]
import folium
# pyrefly: ignore [missing-import]
from streamlit_folium import st_folium
import pandas as pd

st.set_page_config(page_title="GatiSetu Python Engine", layout="wide")

# --- 1. Graph Data Setup ---
CITIES = {
    "Mangaluru": [12.9141, 74.8560],
    "Hassan": [13.0033, 76.1004],
    "Hubballi": [15.3647, 75.1240],
    "Bengaluru": [12.9716, 77.5946],
    "Pune": [18.5204, 73.8567],
    "Mumbai": [18.9894, 73.0276],
    "Delhi": [28.3888, 76.9840],
    "Chennai": [13.0827, 80.2707]
}

# Add Edges (From, To, Distance_km)
EDGES = [
    ("Mangaluru", "Hassan", 170),
    ("Mangaluru", "Hubballi", 360),
    ("Hassan", "Bengaluru", 180),
    ("Hubballi", "Bengaluru", 410),
    ("Hubballi", "Pune", 440),
    ("Pune", "Mumbai", 150),
    ("Pune", "Delhi", 1450),
    ("Mumbai", "Delhi", 1420),
    ("Bengaluru", "Chennai", 350),
    ("Bengaluru", "Pune", 840)
]

# Build NetworkX Graph
G = nx.Graph()
for city, coords in CITIES.items():
    G.add_node(city, pos=coords)
for u, v, dist in EDGES:
    G.add_edge(u, v, weight=dist)

# --- 2. Sidebar Controls ---
st.sidebar.title("🚛 GatiSetu Command")
st.sidebar.markdown("### AI Route Optimizer")

origin = st.sidebar.selectbox("Origin City", list(CITIES.keys()), index=0)
destination = st.sidebar.selectbox("Destination City", list(CITIES.keys()), index=3)

avoid_monsoon = st.sidebar.checkbox("Avoid Coastal Monsoon Routes (Mangaluru/Hubballi)", value=False)
avoid_traffic = st.sidebar.checkbox("Avoid Expressway Traffic (Pune/Mumbai)", value=False)

# --- 3. Dijkstra Algorithm Logic ---
# Clone graph to apply dynamic penalties without altering base graph
temp_G = G.copy()

if avoid_monsoon:
    if temp_G.has_edge("Mangaluru", "Hassan"):
        temp_G["Mangaluru"]["Hassan"]["weight"] += 9999
if avoid_traffic:
    if temp_G.has_edge("Pune", "Mumbai"):
        temp_G["Pune"]["Mumbai"]["weight"] += 9999

try:
    # Compute Shortest Path
    path = nx.dijkstra_path(temp_G, origin, destination, weight='weight')
    
    # Calculate exact distance without penalties
    actual_distance = sum(G[path[i]][path[i+1]]["weight"] for i in range(len(path)-1))
    
    route_found = True
except nx.NetworkXNoPath:
    route_found = False

# --- 4. Main Dashboard UI ---
st.title("National Corridor Logistics & Routing")

if route_found:
    col1, col2, col3 = st.columns(3)
    col1.metric("Optimal Route Distance", f"{actual_distance} km")
    col2.metric("Est. Transit Time", f"{round(actual_distance / 45, 1)} Hours") # 45km/h avg speed
    col3.metric("Cost @ ₹14/km/ton", f"₹ {actual_distance * 14 * 12:,}") # 12 tons avg
    
    st.success(" ➔ ".join(path))
else:
    st.error("No valid route found between these cities.")

# --- 5. Interactive Folium Map ---
st.subheader("Live Telematics & Route Map")
m = folium.Map(location=[20.5937, 78.9629], zoom_start=5)

# Draw all network edges (light gray)
for u, v, data in G.edges(data=True):
    folium.PolyLine(
        locations=[CITIES[u], CITIES[v]],
        color="gray",
        weight=1,
        opacity=0.5
    ).add_to(m)

# Draw nodes (Cities)
for city, coords in CITIES.items():
    folium.CircleMarker(
        location=coords,
        radius=6,
        popup=city,
        color="blue",
        fill=True
    ).add_to(m)

# Highlight computed path (Green)
if route_found and len(path) > 1:
    path_coords = [CITIES[node] for node in path]
    folium.PolyLine(
        locations=path_coords,
        color="green",
        weight=4,
        opacity=0.9
    ).add_to(m)

# Render Map in Streamlit
st_folium(m, width=1200, height=500)