from fastapi import FastAPI, Query
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="SymbioTech Impact Calculator")

# CO2 reduction factors by material type (tons CO2 per ton of material)
CO2_FACTORS = {
    "fly_ash": 0.5,
    "steel_slag": 0.4,
    "waste_heat": 0.8,
    "chemical_byproduct": 0.6,
    "textile_waste": 0.3,
    "default": 0.35
}

# Water savings factors (liters per ton)
WATER_FACTORS = {
    "fly_ash": 500,
    "steel_slag": 300,
    "chemical_byproduct": 800,
    "default": 400
}

# Energy savings factors (MWh per ton)
ENERGY_FACTORS = {
    "fly_ash": 0.8,
    "steel_slag": 0.5,
    "waste_heat": 1.2,
    "default": 0.6
}

class ImpactCalculation(BaseModel):
    co2_reduced_tons: float
    landfill_diverted_tons: float
    raw_material_saved_tons: float
    water_saved_liters: float
    energy_saved_mwh: float
    cost_savings_estimate: float

@app.get("/api/impact/calculate", response_model=ImpactCalculation)
async def calculate_impact(
    waste_tons: float = Query(..., description="Waste quantity in tons"),
    material_type: str = Query(..., description="Type of waste material")
):
    """
    Calculate environmental impact of waste diversion
    """
    # Normalize material type
    material_key = material_type.lower().replace(" ", "_")
    
    # Get factors
    co2_factor = CO2_FACTORS.get(material_key, CO2_FACTORS["default"])
    water_factor = WATER_FACTORS.get(material_key, WATER_FACTORS["default"])
    energy_factor = ENERGY_FACTORS.get(material_key, ENERGY_FACTORS["default"])
    
    # Calculate impacts
    co2_reduced = waste_tons * co2_factor
    landfill_diverted = waste_tons
    raw_material_saved = waste_tons * 0.8  # 80% raw material substitution
    water_saved = waste_tons * water_factor
    energy_saved = waste_tons * energy_factor
    
    # Estimate cost savings (₹ per ton, varies by material)
    cost_per_ton = {
        "fly_ash": 1500,
        "steel_slag": 2000,
        "waste_heat": 5000,
        "default": 1800
    }
    cost_savings = waste_tons * cost_per_ton.get(material_key, cost_per_ton["default"])
    
    return ImpactCalculation(
        co2_reduced_tons=round(co2_reduced, 2),
        landfill_diverted_tons=round(landfill_diverted, 2),
        raw_material_saved_tons=round(raw_material_saved, 2),
        water_saved_liters=round(water_saved, 2),
        energy_saved_mwh=round(energy_saved, 2),
        cost_savings_estimate=round(cost_savings, 2)
    )

@app.get("/api/impact/sustainability-score")
async def calculate_sustainability_score(
    waste_diverted: float = Query(0, description="Total waste diverted in tons"),
    co2_reduced: float = Query(0, description="Total CO2 reduced in tons"),
    matches_completed: int = Query(0, description="Number of completed matches"),
    months_active: int = Query(1, description="Months on platform")
):
    """
    Calculate sustainability score (0-100)
    """
    # Component scores (each 0-25)
    waste_score = min(25, waste_diverted / 10)
    carbon_score = min(25, co2_reduced / 5)
    collaboration_score = min(25, matches_completed * 2)
    consistency_score = min(25, months_active * 2)
    
    total_score = waste_score + carbon_score + collaboration_score + consistency_score
    
    return {
        "overall_score": round(total_score, 1),
        "breakdown": {
            "waste_diversion": round(waste_score, 1),
            "carbon_reduction": round(carbon_score, 1),
            "collaboration": round(collaboration_score, 1),
            "consistency": round(consistency_score, 1)
        },
        "rating": get_rating(total_score)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)