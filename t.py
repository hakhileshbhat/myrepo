# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException
# pyrefly: ignore [missing-import, parse-error]
from pydantic import BaseModel
from typing import List, Optional

# Initialize the FastAPI app
app = FastAPI(title="SIH Logistics API", description="Core backend for transport and logistics")

# --- 1. Data Models (Schemas) ---
class Location(BaseModel):
    lat: float
    lng: float

class Vehicle(BaseModel):
    vehicle_id: str
    driver_name: str
    capacity_kg: float
    current_location: Location
    status: str = "IDLE"  # IDLE, IN_TRANSIT, MAINTENANCE

class Shipment(BaseModel):
    shipment_id: str
    destination: Location
    weight_kg: float
    status: str = "PENDING"  # PENDING, ASSIGNED, DELIVERED
    assigned_vehicle_id: Optional[str] = None

# --- 2. In-Memory Database (For Hackathon Prototyping) ---
db_vehicles = {}
db_shipments = {}

# --- 3. API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the SIH Logistics API. Go to /docs for the interactive UI."}

# Vehicle Management
@app.post("/vehicles/", response_model=Vehicle)
def add_vehicle(vehicle: Vehicle):
    if vehicle.vehicle_id in db_vehicles:
        raise HTTPException(status_code=400, detail="Vehicle already exists")
    db_vehicles[vehicle.vehicle_id] = vehicle
    return vehicle

@app.get("/vehicles/", response_model=List[Vehicle])
def get_all_vehicles():
    return list(db_vehicles.values())

@app.put("/vehicles/{vehicle_id}/location")
def update_vehicle_location(vehicle_id: str, location: Location):
    if vehicle_id not in db_vehicles:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db_vehicles[vehicle_id].current_location = location
    return {"message": "Location updated successfully", "new_location": location}

# Shipment Management
@app.post("/shipments/", response_model=Shipment)
def create_shipment(shipment: Shipment):
    if shipment.shipment_id in db_shipments:
        raise HTTPException(status_code=400, detail="Shipment already exists")
    db_shipments[shipment.shipment_id] = shipment
    return shipment

# Dispatch Engine (Basic Logic)
@app.post("/dispatch/{shipment_id}")
def assign_shipment_to_vehicle(shipment_id: str, vehicle_id: str):
    if shipment_id not in db_shipments:
        raise HTTPException(status_code=404, detail="Shipment not found")
    if vehicle_id not in db_vehicles:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    shipment = db_shipments[shipment_id]
    vehicle = db_vehicles[vehicle_id]

    if vehicle.capacity_kg < shipment.weight_kg:
        raise HTTPException(status_code=400, detail="Vehicle capacity exceeded")
        
    shipment.assigned_vehicle_id = vehicle_id
    shipment.status = "ASSIGNED"
    vehicle.status = "IN_TRANSIT"
    
    return {"message": f"Shipment {shipment_id} successfully assigned to {vehicle_id}"}