# 🚛 SIH Logistics & Routing: Windows PowerShell Execution Guide

This guide provides instructions to set up, run, and interact with the Logistics & Routing services using **Windows PowerShell**.

---

## 🛠️ Step 1: Environment Setup

### Option A: Global Python Environment (Quick Start)
To install the dependencies globally for your user profile using your specific Python path:

```powershell
& C:/Users/Admin/AppData/Local/Programs/Python/Python314/python.exe -m pip install fastapi uvicorn pydantic streamlit folium streamlit-folium networkx pandas
```

### Option B: Isolated Virtual Environment (Recommended)
To prevent dependency conflicts, initialize and use a virtual environment:

```powershell
# 1. Create the virtual environment in your project folder
& C:/Users/Admin/AppData/Local/Programs/Python/Python314/python.exe -m venv .venv

# 2. Enable execution of scripts if blocked (run as Administrator if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# 3. Activation of the virtual environment
.venv\Scripts\Activate.ps1

# 4. Install the required modules
pip install fastapi uvicorn pydantic streamlit folium streamlit-folium networkx pandas
```

---

## 🚀 Step 2: Running the Applications

### 1. Run the Main Backend API (`t.py`)
Run the FastAPI development server on port `8000`:

```powershell
& C:/Users/Admin/AppData/Local/Programs/Python/Python314/python.exe -m uvicorn t:app --port 8000 --reload
```
*   **API Home Page:** [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
*   **Interactive Swagger Documentation:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 2. Run the GatiSetu Streamlit Dashboard (`import streamlit as st.py`)
Launch the Streamlit visualization engine on port `8501`:

```powershell
& C:/Users/Admin/AppData/Local/Programs/Python/Python314/python.exe -m streamlit run "import streamlit as st.py" --server.port 8501
```
*   **Dashboard URL:** [http://localhost:8501](http://localhost:8501)

---

### 3. Run the LogiTrack API (`from datetime import datetime.py`)
If you want to run the secondary API (LogiTrack) instead of `t.py`, start it on a separate port (e.g., `8080`) to avoid conflicts:

```powershell
& C:/Users/Admin/AppData/Local/Programs/Python/Python314/python.exe -m uvicorn "from datetime import datetime:app" --port 8080 --reload
```
*   **Interactive Documentation:** [http://127.0.0.1:8080/docs](http://127.0.0.1:8080/docs)

---

## 🧪 Step 3: Testing the APIs with PowerShell Commands
You can interact with the endpoints directly from another PowerShell terminal using `Invoke-RestMethod`.

### A. Testing the Main API (`t.py` on Port `8000`)

#### 1. Register a New Vehicle
```powershell
$vehicleBody = @{
    vehicle_id = "V-IND-402"
    driver_name = "Rajesh Sharma"
    capacity_kg = 5000.0
    current_location = @{ lat = 12.9716; lng = 77.5946 } # Bengaluru
    status = "IDLE"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/vehicles/" -Method Post -Body $vehicleBody -ContentType "application/json"
```

#### 2. Get All Registered Vehicles
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/vehicles/" -Method Get
```

#### 3. Create a Shipment
```powershell
$shipmentBody = @{
    shipment_id = "SH-7892"
    destination = @{ lat = 13.0827; lng = 80.2707 } # Chennai
    weight_kg = 3200.0
    status = "PENDING"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/shipments/" -Method Post -Body $shipmentBody -ContentType "application/json"
```

#### 4. Dispatch and Assign Shipment to Vehicle
Assigns shipment `SH-7892` to vehicle `V-IND-402`:
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/dispatch/SH-7892?vehicle_id=V-IND-402" -Method Post
```

#### 5. Update Vehicle Location
```powershell
$locationBody = @{ lat = 13.0033; lng = 76.1004 } | ConvertTo-Json # Hassan

Invoke-RestMethod -Uri "http://127.0.0.1:8000/vehicles/V-IND-402/location" -Method Put -Body $locationBody -ContentType "application/json"
```

---

### B. Testing the LogiTrack API (`from datetime import datetime.py` on Port `8080`)

#### 1. Register a Vehicle
```powershell
$logiVehicle = @{
    id = "V-MUM-801"
    driver_name = "Amit Patel"
    capacity_kg = 8000.0
    current_lat = 18.9894
    current_lng = 73.0276
    is_available = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8080/vehicles/" -Method Post -Body $logiVehicle -ContentType "application/json"
```

#### 2. Create a Shipment
```powershell
$logiShipment = @{
    id = "SH-MUM-DEL"
    origin = "Mumbai"
    destination = "Delhi"
    weight_kg = 6500.0
    status = "Pending"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8080/shipments/" -Method Post -Body $logiShipment -ContentType "application/json"
```

#### 3. Trigger Auto-Dispatch
Auto-matches the shipment with the first available vehicle that has enough capacity:
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8080/dispatch/SH-MUM-DEL" -Method Post
```
