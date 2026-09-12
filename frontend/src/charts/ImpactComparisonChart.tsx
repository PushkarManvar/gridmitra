import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type { OptimizationSummary } from '../types';

export interface ImpactComparisonChartProps {
  optimized: OptimizationSummary;
  baseline: OptimizationSummary;
}

const METRICS = [
  { key: 'diesel_energy_kwh', label: 'Diesel (kWh)' },
  { key: 'fuel_cost', label: 'Fuel cost' },
  { key: 'co2_kg', label: 'CO2 (kg)' },
  { key: 'renewable_used_kwh', label: 'Renewable (kWh)' },
] as const;

export function ImpactComparisonChart({ optimized, baseline }: ImpactComparisonChartProps) {
  const option = useMemo<EChartsOption>(() => {
    return {
      tooltip: {
        valueFormatter: (value) => Number(value).toFixed(1),
        trigger: 'axis',
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
      grid: { left: '2%', right: '2%', top: '10%', bottom: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: METRICS.map((m) => m.label),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#7C8B87', fontFamily: 'JetBrains Mono', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#7C8B87', fontFamily: 'JetBrains Mono', fontSize: 11 },
        splitLine: { lineStyle: { type: 'dashed', color: '#EDE9E0' } },
      },
      series: [
        {
          name: 'Reactive baseline',
          type: 'bar',
          data: METRICS.map((m) => baseline[m.key]),
          itemStyle: { color: '#9CA3AF' },
        },
        {
          name: 'GridMitra',
          type: 'bar',
          data: METRICS.map((m) => optimized[m.key]),
          itemStyle: { color: '#0D5748' },
        },
      ],
    };
  }, [optimized, baseline]);

  return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} />;
}