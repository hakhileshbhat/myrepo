# 🚛 SIH Logistics & Routing Projects

Welcome to the **Logistics & Routing** repository. This workspace contains a suite of tools, API backends, and dashboard prototypes built for transport, dispatch, and routing optimization (originally designed for the Smart India Hackathon).

---

## 📂 Project Structure & Key Files

Here is an overview of the key programs in this directory:

### 1. Backend APIs
*   **[`t.py`](file:///d:/Programs/t.py)**: The main **SIH Logistics API** built with FastAPI. It handles:
    *   **Data Models**: Location coordinates, Vehicle specs (capacity, status), and Shipment weight/destination details.
    *   **Vehicle & Shipment Management**: Endpoints to register vehicles, update live locations, and create shipments.
    *   **Dispatch Engine**: Basic logic that assigns shipments to vehicles based on weight constraints.
*   **[`from datetime import datetime.py`](file:///d:/Programs/from%20datetime%20import%20datetime.py)**: The **LogiTrack API** (FastAPI) which provides:
    *   Similar models for vehicles and shipments.
    *   An auto-dispatch endpoint that matches shipments to the first available vehicle with sufficient capacity.

### 2. Frontend Dashboards & Visualizations
*   **[`import streamlit as st.py`](file:///d:/Programs/import%20streamlit%20as%20st.py)**: **GatiSetu Command / AI Route Optimizer** built with Streamlit and Folium.
    *   Uses **Dijkstra's Algorithm** (via NetworkX) to find the shortest path across a national highway network of major Indian cities.
    *   Dynamic route planning parameters to avoid coastal monsoon routes or expressway traffic.
    *   Calculates optimal distance, estimated transit time, and transit costs.
    *   Displays an interactive map using Folium.

### 3. Other Utilities
*   **[`rocketlaunchcode.c`](file:///d:/Programs/rocketlaunchcode.c)**: A C-based command-line console simulation for a password-protected rocket launch control.
*   **[`helloworld.py`](file:///d:/Programs/helloworld.py)**: A simple terminal-based parity checker script.

---

## 🛠️ Error Analysis & Fix Solution

### The Issue
When trying to run the backend or frontend servers, you may encounter the following error:
```text
Traceback (most recent call last):
  File "d:\Programs\t.py", line 2, in <module>
    from fastapi import FastAPI, HTTPException
ModuleNotFoundError: No module named 'fastapi'
```
This occurs because **FastAPI** (and other necessary packages like Streamlit, NetworkX, Folium, Pydantic, etc.) are not installed in your current Python environment.

---

### Step-by-Step Fix

To resolve this and get all systems running, execute the following commands in your PowerShell or Command Prompt.

#### 1. Install All Project Dependencies
Run the command below using the specific Python interpreter path you are currently using:

```powershell
& C:/Users/Admin/AppData/Local/Programs/Python/Python314/python.exe -m pip install fastapi uvicorn pydantic streamlit folium streamlit-folium networkx pandas
```

*If you prefer a virtual environment, you can set one up:*
```powershell
# Create virtual environment
& C:/Users/Admin/AppData/Local/Programs/Python/Python314/python.exe -m venv .venv

# Activate virtual environment
.venv\Scripts\Activate.ps1

# Install packages inside virtual environment
pip install fastapi uvicorn pydantic streamlit folium streamlit-folium networkx pandas
```

---

## 🚀 How to Run the Applications

### A. Run the SIH Logistics API (`t.py`)
1. Start the development server using Uvicorn:
   ```powershell
   & C:/Users/Admin/AppData/Local/Programs/Python/Python314/python.exe -m uvicorn t:app --reload
   ```
2. Open your browser and navigate to:
   *   **API Root**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
   *   **Interactive API Docs (Swagger UI)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) (Use this to test the POST and GET endpoints directly in your browser).

### B. Run the GatiSetu Streamlit Dashboard (`import streamlit as st.py`)
1. Run the Streamlit server:
   ```powershell
   & C:/Users/Admin/AppData/Local/Programs/Python/Python314/python.exe -m streamlit run "import streamlit as st.py"
   ```
2. The dashboard will automatically open in your browser at:
   *   [http://localhost:8501](http://localhost:8501)