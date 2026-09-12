import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { DispatchHour } from '../types';

export interface DispatchChartProps {
  hours: DispatchHour[];
}

export function DispatchChart({ hours }: DispatchChartProps) {
  const option = useMemo<EChartsOption>(() => {
    const xAxisData = hours.map((h) => `${h.hour}:00`);

    return {
      tooltip: {
        valueFormatter: (value) => Number(value).toFixed(1),
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#FFFFFF',
        borderColor: '#E2DDD2',
        textStyle: { fontFamily: 'JetBrains Mono, monospace', fontSize: 12 },
      },
      legend: {
        bottom: 0,
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontFamily: 'Geist, sans-serif', fontSize: 12, color: '#52605D' },
      },
      grid: {
        left: '2%',
        right: '2%',
        top: '10%',
        bottom: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#7C8B87', fontFamily: 'JetBrains Mono', fontSize: 11 },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        name: 'Energy (kWh)',
        nameTextStyle: { color: '#7C8B87', fontFamily: 'Geist, sans-serif', padding: [0, 0, 0, 20] },
        axisLabel: { color: '#7C8B87', fontFamily: 'JetBrains Mono', fontSize: 11 },
        splitLine: { lineStyle: { type: 'dashed', color: '#EDE9E0' } },
      },
      series: [
        {
          name: 'Solar',
          type: 'bar',
          stack: 'supply',
          data: hours.map(h => h.solar_used_kwh),
          itemStyle: { color: '#D97706' },
        },
        {
          name: 'Wind',
          type: 'bar',
          stack: 'supply',
          data: hours.map(h => h.wind_used_kwh),
          itemStyle: { color: '#0284C7' },
        },
        {
          name: 'BESS Discharge',
          type: 'bar',
          stack: 'supply',
          data: hours.map(h => h.battery_discharge_kwh),
          itemStyle: { color: '#2563EB' },
        },
        {
          name: 'Diesel',
          type: 'bar',
          stack: 'supply',
          data: hours.map(h => h.diesel_kwh),
          itemStyle: { color: '#EA580C' },
        },
        {
          name: 'BESS Charge',
          type: 'bar',
          stack: 'demand',
          data: hours.map(h => -h.battery_charge_kwh), // Negative for charge visual
          itemStyle: { color: '#60A5FA' },
        },
        {
          name: 'Demand',
          type: 'line',
          data: hours.map(h => h.solar_used_kwh + h.wind_used_kwh + h.diesel_kwh + h.battery_discharge_kwh - h.battery_charge_kwh),
          itemStyle: { color: '#1A2220' },
          symbol: 'none',
          smooth: 0.2,
        }
      ],
    };
  }, [hours]);

  return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} />;
}
