from typing import Literal

from pydantic import BaseModel, Field, model_validator


class HourInput(BaseModel):
    hour: int = Field(ge=0, le=23)
    critical_load_kwh: float = Field(ge=0)
    flexible_load_kwh: float = Field(ge=0)
    solar_available_kwh: float = Field(ge=0)
    wind_available_kwh: float = Field(ge=0)


class BatteryConfig(BaseModel):
    capacity_kwh: float = Field(gt=0)
    initial_soc_kwh: float = Field(ge=0)
    min_soc_kwh: float = Field(ge=0)
    max_soc_kwh: float = Field(gt=0)
    max_charge_kw: float = Field(gt=0)
    max_discharge_kw: float = Field(gt=0)
    charge_efficiency: float = Field(gt=0, le=1)
    discharge_efficiency: float = Field(gt=0, le=1)
    reserve_target_kwh: float = Field(ge=0)
    throughput_cost_per_kwh: float = Field(ge=0)

    @model_validator(mode="after")
    def validate_soc_bounds(self) -> "BatteryConfig":
        if self.max_soc_kwh > self.capacity_kwh:
            raise ValueError("max_soc_kwh cannot exceed capacity_kwh")
        if self.min_soc_kwh > self.max_soc_kwh:
            raise ValueError("min_soc_kwh cannot exceed max_soc_kwh")
        if not self.min_soc_kwh <= self.initial_soc_kwh <= self.max_soc_kwh:
            raise ValueError("initial_soc_kwh must be inside the hard SOC bounds")
        if self.reserve_target_kwh > self.max_soc_kwh:
            raise ValueError("reserve_target_kwh cannot exceed max_soc_kwh")
        return self


class DieselConfig(BaseModel):
    max_power_kw: float = Field(gt=0)
    cost_per_kwh: float = Field(ge=0)
    emission_kg_per_kwh: float = Field(ge=0)


class ObjectiveWeights(BaseModel):
    carbon_price_per_kg: float = Field(default=0.05, ge=0)
    flexible_unserved_penalty_per_kwh: float = Field(default=1_000, gt=0)
    critical_unserved_penalty_per_kwh: float = Field(default=10_000, gt=0)
    reserve_shortfall_penalty_per_kwh: float = Field(default=12_000, gt=0)

    @model_validator(mode="after")
    def validate_priority_order(self) -> "ObjectiveWeights":
        if self.critical_unserved_penalty_per_kwh <= self.flexible_unserved_penalty_per_kwh:
            raise ValueError("critical-load penalty must exceed flexible-load penalty")
        if self.reserve_shortfall_penalty_per_kwh <= self.critical_unserved_penalty_per_kwh:
            raise ValueError("reserve-shortfall penalty must exceed critical-load penalty")
        return self


class OptimizationRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    hours: list[HourInput]
    battery: BatteryConfig
    diesel: DieselConfig
    objective: ObjectiveWeights = Field(default_factory=ObjectiveWeights)

    @model_validator(mode="after")
    def validate_hours(self) -> "OptimizationRequest":
        if len(self.hours) != 24:
            raise ValueError("exactly 24 hourly records are required")
        if sorted(item.hour for item in self.hours) != list(range(24)):
            raise ValueError("hours must be unique and cover 0 through 23")
        return self


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
