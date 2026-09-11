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


Severity = Literal["info", "warning", "critical"]
RunStatus = Literal["optimal", "emergency_plan", "failed"]


class Site(BaseModel):
    site_id: str = Field(min_length=1)
    site_name: str = Field(min_length=1, max_length=100)
    timezone: str = Field(min_length=1)
    currency: str = Field(min_length=3, max_length=3)
    start_time: str = Field(min_length=1)
    interval_hours: float = Field(default=1, gt=0)


class SolarConfig(BaseModel):
    enabled: bool = True
    capacity_kw: float = Field(ge=0)


class WindConfig(BaseModel):
    enabled: bool = True
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
    def validate_bounds(self) -> "BatteryConfig":
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
    enabled: bool = True
    maximum_kw: float = Field(ge=0)
    fuel_consumption_l_per_kwh: float = Field(ge=0)
    fuel_price_per_l: float = Field(ge=0)
    emission_factor_kg_co2_per_l: float = Field(ge=0)


class Assets(BaseModel):
    solar: SolarConfig = Field(default_factory=SolarConfig)
    wind: WindConfig = Field(default_factory=WindConfig)
    battery: BatteryConfig
    diesel: DieselConfig = Field(default_factory=DieselConfig)


class OperatingPolicy(BaseModel):
    carbon_price_per_kg_co2: float = Field(default=0.05, ge=0)


class HourInput(BaseModel):
    hour_index: int = Field(ge=0, le=23)
    timestamp: str = Field(default="")
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
    operating_policy: OperatingPolicy = Field(default_factory=OperatingPolicy)
    hours: list[HourInput]

    @model_validator(mode="after")
    def validate_hours(self) -> "OptimizationRequest":
        if len(self.hours) != 24:
            raise ValueError("exactly 24 hourly records are required")
        if sorted(item.hour_index for item in self.hours) != list(range(24)):
            raise ValueError("hour_index values must be unique and cover 0 through 23")
        if self.site.interval_hours != 1:
            raise ValueError("interval_hours must equal 1 for the MVP")
        return self


class DispatchHour(BaseModel):
    hour_index: int
    timestamp: str
    solar_available_kwh: float
    solar_used_kwh: float
    wind_available_kwh: float
    wind_used_kwh: float
    battery_energy_start_kwh: float
    battery_charge_kwh: float
    battery_discharge_kwh: float
    battery_energy_end_kwh: float
    diesel_generation_kwh: float
    p1_demand_kwh: float
    p2_demand_kwh: float
    p3_demand_kwh: float
    p4_demand_kwh: float
    p1_served_kwh: float
    p2_served_kwh: float
    p3_served_kwh: float
    p4_served_kwh: float
    p1_unserved_kwh: float
    p2_unserved_kwh: float
    p3_unserved_kwh: float
    p4_unserved_kwh: float
    renewable_curtailment_kwh: float
    fuel_cost: float
    co2_kg: float


class OptimizationSummary(BaseModel):
    total_demand_kwh: float
    total_served_kwh: float
    total_unserved_kwh: float
    p1_unserved_kwh: float
    p2_unserved_kwh: float
    p3_unserved_kwh: float
    p4_unserved_kwh: float
    diesel_energy_kwh: float
    diesel_fuel_l: float
    fuel_cost: float
    co2_kg: float
    renewable_available_kwh: float
    renewable_used_kwh: float
    renewable_curtailment_kwh: float
    renewable_share_percent: float
    p1_reliability_percent: float
    final_battery_energy_kwh: float
    reserve_shortfall_kwh: float


class Explanation(BaseModel):
    code: str
    severity: Severity
    hour_index: int | None = None
    message: str
    evidence: dict[str, float]


class Warning(BaseModel):
    code: str
    severity: Severity
    message: str
    hour_index: int | None = None


class Persistence(BaseModel):
    saved: bool
    message: str | None = None


class OptimizationResponse(BaseModel):
    run_id: str
    status: RunStatus
    scenario_id: str
    summary: OptimizationSummary
    dispatch_hours: list[DispatchHour]
    baseline_summary: OptimizationSummary
    explanations: list[Explanation]
    warnings: list[Warning]
    persistence: Persistence


class ValidationErrorBody(BaseModel):
    code: str
    message: str
    fields: list[dict[str, str]]