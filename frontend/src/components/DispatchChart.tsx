import ReactECharts from "echarts-for-react";

import type { HourDispatch } from "../types";

export function DispatchChart({ hours }: { hours: HourDispatch[] }) {
  const labels = hours.map((item) => `${item.hour.toString().padStart(2, "0")}:00`);
  const option = {
    backgroundColor: "transparent",
    color: ["#f6c453", "#70b7ff", "#ff8066", "#57e3b4"],
    tooltip: { trigger: "axis" },
    legend: { textStyle: { color: "#b9d8d0" } },
    grid: { left: 44, right: 18, top: 46, bottom: 34 },
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: { color: "#8db4aa", interval: 2 },
      axisLine: { lineStyle: { color: "#315b52" } }
    },
    yAxis: {
      type: "value",
      name: "kWh",
      nameTextStyle: { color: "#8db4aa" },
      axisLabel: { color: "#8db4aa" },
      splitLine: { lineStyle: { color: "rgba(141,180,170,0.12)" } }
    },
    series: [
      { name: "Solar", type: "bar", stack: "supply", data: hours.map((item) => item.solar_kwh) },
      { name: "Wind", type: "bar", stack: "supply", data: hours.map((item) => item.wind_kwh) },
      { name: "Diesel", type: "bar", stack: "supply", data: hours.map((item) => item.diesel_kwh) },
      {
        name: "Battery discharge",
        type: "bar",
        stack: "supply",
        data: hours.map((item) => item.battery_discharge_kwh)
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: 360 }} />;
}
