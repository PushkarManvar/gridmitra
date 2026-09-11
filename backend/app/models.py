from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field, model_validator


class ScenarioType(str, Enum):
    normal = "normal"
    cloudy = "cloudy"
    demand_spike = "demand_spike"
    high_diesel_price = "high_diesel_price"
    battery_degradation = "battery_degradation"
    combined_stress = "combined_stress"
    custom = "custom"


class Site(BaseModel):
    site_id: str = Field(min_length=1)
    site_name: str = Field(min_length=1, max_length=100)
    timezone: str = Field(min_length=1)
    currency: str = Field(pattern=r"^[A-Z]{3}$")
    start_time: str = Field(min_length=1)
    interval_hours: int

    @model_validator(mode="after")
    def validate_interval(self) -> "Site":
        if self.interval_hours != 1:
            raise ValueError("interval_hours must equal 1 for the MVP")
        return self


class SolarConfig(BaseModel):
    enabled: bool
    capacity_kw: float = Field(ge=0)


class WindConfig(BaseModel):
    enabled: bool
    capacity_kw: float = Field(ge=0)


class BatteryConfig(BaseModel):
    capacity_kwh: float = Field(gt=0)
    initial_energy_kwh: float = Field(ge=0)
    minimum_energy_kwh: float = Field(ge=0)
    maximum_energy_kwh: float = Field(gt=0)
    maximum_charge_kw: float = Field(ge=0)
    maximum_discharge_kw: float = Field(ge=0)
    charge_efficiency: float = Field(gt=0, le=1)
    discharge_efficiency: float = Field(gt=0, le=1)
    terminal_reserve_target_kwh: float = Field(ge=0)
    wear_cost_per_kwh: float = Field(ge=0)

    @model_validator(mode="after")
    def validate_energy_bounds(self) -> "BatteryConfig":
        if self.maximum_energy_kwh > self.capacity_kwh:
            raise ValueError("maximum_energy_kwh cannot exceed capacity_kwh")
        if self.minimum_energy_kwh > self.maximum_energy_kwh:
            raise ValueError("minimum_energy_kwh cannot exceed maximum_energy_kwh")
        if not self.minimum_energy_kwh <= self.initial_energy_kwh <= self.maximum_energy_kwh:
            raise ValueError("initial_energy_kwh must be inside the hard energy bounds")
        if self.terminal_reserve_target_kwh > self.maximum_energy_kwh:
            raise ValueError("terminal_reserve_target_kwh cannot exceed maximum_energy_kwh")
        return self


class DieselConfig(BaseModel):
    enabled: bool
    maximum_kw: float = Field(ge=0)
    fuel_consumption_l_per_kwh: float = Field(ge=0)
    fuel_price_per_l: float = Field(ge=0)
    emission_factor_kg_co2_per_l: float = Field(ge=0)


class Assets(BaseModel):
    solar: SolarConfig
    wind: WindConfig
    battery: BatteryConfig
    diesel: DieselConfig


class OperatingPolicy(BaseModel):
    carbon_price_per_kg_co2: float = Field(ge=0)


class HourInput(BaseModel):
    hour_index: int = Field(ge=0, le=23)
    timestamp: str = Field(min_length=1)
    solar_available_kwh: float = Field(ge=0)
    wind_available_kwh: float = Field(ge=0)
    p1_demand_kwh: float = Field(ge=0)
    p2_demand_kwh: float = Field(ge=0)
    p3_demand_kwh: float = Field(ge=0)
    p4_demand_kwh: float = Field(ge=0)


class OptimizationRequest(BaseModel):
    scenario_id: str = Field(min_length=1)
    scenario_name: str = Field(min_length=1, max_length=100)
    scenario_type: ScenarioType
    site: Site
    assets: Assets
    operating_policy: OperatingPolicy
    hours: list[HourInput]

    @model_validator(mode="after")
    def validate_hours(self) -> "OptimizationRequest":
        if len(self.hours) != 24:
            raise ValueError("exactly 24 hourly records are required")
        if sorted(item.hour_index for item in self.hours) != list(range(24)):
            raise ValueError("hour_index values must be unique and cover 0 through 23")
        return self


# ---------------------------------------------------------------------------
# Response schemas. Status and response-shape migration is task T2.3; the
# optimizer (T3.x) still constructs these names, so they are preserved here.
# ---------------------------------------------------------------------------


class HourDispatch(BaseModel):
    hour: int
    solar_kwh: float
    wind_kwh: float
    diesel_kwh: float
    battery_charge_kwh: float
    battery_discharge_kwh: float
    battery_soc_kwh: float
    unserved_critical_kwh: float
    unserved_flexible_kwh: float


class OptimizationSummary(BaseModel):
    operating_cost: float
    emissions_kg: float
    diesel_energy_kwh: float
    renewable_used_kwh: float
    renewable_share_pct: float
    unserved_critical_kwh: float
    unserved_flexible_kwh: float
    reserve_shortfall_kwh: float
    final_soc_kwh: float


class OptimizationResponse(BaseModel):
    status: Literal["optimal", "feasible"]
    hours: list[HourDispatch]
    summary: OptimizationSummary
    explanations: list[str]
