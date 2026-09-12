import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type { HourInput } from '../types';

export interface EnergyOutlookChartProps {
  hours: HourInput[];
}

export function EnergyOutlookChart({ hours }: EnergyOutlookChartProps) {
  const option = useMemo<EChartsOption>(() => {
    const xAxisData = hours.map((h) => `${h.hour_index}:00`);

    return {
      tooltip: {
        valueFormatter: (value) => Number(value).toFixed(1),
        trigger: 'axis',
        backgroundColor: '#FFFFFF',
        borderColor: '#E2DDD2',
        textStyle: { fontFamily: 'JetBrains Mono, monospace', fontSize: 12 },
      },
      legend: { show: false },
      grid: {
        left: '2%', right: '2%', top: '10%', bottom: '15%', containLabel: true,
      },
      xAxis: {
        type: 'category', data: xAxisData,
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { color: '#7C8B87', fontFamily: 'JetBrains Mono', fontSize: 11 },
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#7C8B87', fontFamily: 'JetBrains Mono', fontSize: 11 },
        splitLine: { lineStyle: { type: 'dashed', color: '#EDE9E0' } },
      },
      series: [
        {
          name: 'Demand',
          type: 'line',
          data: hours.map((h) => h.p1_demand_kwh + h.p2_demand_kwh + h.p3_demand_kwh + h.p4_demand_kwh),
          itemStyle: { color: '#1A2220' },
          symbol: 'none', smooth: 0.2,
        },
        {
          name: 'Solar',
          type: 'line',
          data: hours.map((h) => h.solar_available_kwh),
          itemStyle: { color: '#D97706' },
          symbol: 'none', smooth: 0.2,
          areaStyle: { color: 'rgba(217, 119, 6, 0.1)' },
        },
        {
          name: 'Wind',
          type: 'line',
          data: hours.map((h) => h.wind_available_kwh),
          itemStyle: { color: '#5B8C87' },
          symbol: 'none', smooth: 0.2,
          areaStyle: { color: 'rgba(91, 140, 135, 0.1)' },
        },
      ],
    };
  }, [hours]);

  return <ReactECharts option={option} style={{ height: '270px', width: '100%' }} />;
}