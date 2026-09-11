import ReactECharts from "echarts-for-react";

import type { HourDispatch } from "../types";

export function SocChart({ hours, reserve }: { hours: HourDispatch[]; reserve: number }) {
  const option = {
    color: ["#57e3b4"],
    tooltip: { trigger: "axis" },
    grid: { left: 44, right: 18, top: 25, bottom: 34 },
    xAxis: {
      type: "category",
      data: hours.map((item) => `${item.hour.toString().padStart(2, "0")}:00`),
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
      {
        name: "Battery SOC",
        type: "line",
        smooth: true,
        symbol: "none",
        areaStyle: { opacity: 0.12 },
        lineStyle: { width: 3 },
        data: hours.map((item) => item.battery_soc_kwh),
        markLine: {
          silent: true,
          lineStyle: { color: "#f6c453", type: "dashed" },
          label: { color: "#f6c453", formatter: "Reserve" },
          data: [{ yAxis: reserve }]
        }
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: 280 }} />;
}
