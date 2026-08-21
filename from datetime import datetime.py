from datetime import datetime
from enum import Enum
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import antigravity


app = FastAPI(title="LogiTrack API", version="1.0.0")

class ShipmentStatus(str, Enum):
    PENDING = "Pending"
    IN_TRANSIT = "In Transit"
    DELIVERED = "Delivered"
    CANCELLED = "Cancelled"

class Vehicle(BaseModel):
    id: str
    driver_name: str
    capacity_kg: float
    current_lat: float
    current_lng: float
    is_available: bool = True

class Shipment(BaseModel):
    id: str
    origin: str
    destination: str
    weight_kg: float
    status: ShipmentStatus = ShipmentStatus.PENDING
    assigned_vehicle_id: Optional[str] = None
    created_at: datetime = datetime.utcnow()

# In-memory storage for demonstration
vehicles_db: dict[str, Vehicle] = {}
shipments_db: dict[str, Shipment] = {}

@app.post("/vehicles/", response_model=Vehicle)
def register_vehicle(vehicle: Vehicle):
    vehicles_db[vehicle.id] = vehicle
    return vehicle

@app.post("/shipments/", response_model=Shipment)
def create_shipment(shipment: Shipment):
    shipments_db[shipment.id] = shipment
    return shipment

@app.post("/dispatch/{shipment_id}", response_model=Shipment)
def auto_dispatch(shipment_id: str):
    shipment = shipments_db.get(shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    # Match available vehicle with sufficient capacity
    available_vehicle = next(
        (v for v in vehicles_db.values() if v.is_available and v.capacity_kg >= shipment.weight_kg),
        None
    )
    if not available_vehicle:
        raise HTTPException(status_code=400, detail="No suitable vehicle available")

    available_vehicle.is_available = False
    shipment.assigned_vehicle_id = available_vehicle.id
    shipment.status = ShipmentStatus.IN_TRANSIT
    return shipment

@app.get("/shipments/", response_model=List[Shipment])
def list_shipments(status: Optional[ShipmentStatus] = None):
    if status:
        return [s for s in shipments_db.values() if s.status == status]
    return list(shipments_db.values())