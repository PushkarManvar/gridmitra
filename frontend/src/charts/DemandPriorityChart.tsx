import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type { HourInput } from '../types';

export interface DemandPriorityChartProps {
  hours: HourInput[];
}

export function DemandPriorityChart({ hours }: DemandPriorityChartProps) {
  const option = useMemo<EChartsOption>(() => {
    const xAxisData = hours.map((h) => `${h.hour_index}:00`);
    return {
      tooltip: {
        valueFormatter: (value) => Number(value).toFixed(1), trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: '#FFFFFF', borderColor: '#E2DDD2', textStyle: { fontFamily: 'JetBrains Mono', fontSize: 12 } },
      legend: { show: false },
      grid: { left: '2%', right: '2%', top: '10%', bottom: '15%', containLabel: true },
      xAxis: { type: 'category', data: xAxisData, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#7C8B87', fontFamily: 'JetBrains Mono', fontSize: 11 }, boundaryGap: false },
      yAxis: { type: 'value', axisLabel: { color: '#7C8B87', fontFamily: 'JetBrains Mono', fontSize: 11 }, splitLine: { lineStyle: { type: 'dashed', color: '#EDE9E0' } } },
      series: [
        { name: 'P1', type: 'bar', stack: 'demand', data: hours.map((h) => h.p1_demand_kwh), itemStyle: { color: '#BA1A1A' } },
        { name: 'P2', type: 'bar', stack: 'demand', data: hours.map((h) => h.p2_demand_kwh), itemStyle: { color: '#EA580C' } },
        { name: 'P3', type: 'bar', stack: 'demand', data: hours.map((h) => h.p3_demand_kwh), itemStyle: { color: '#D97706' } },
        { name: 'P4', type: 'bar', stack: 'demand', data: hours.map((h) => h.p4_demand_kwh), itemStyle: { color: '#FBBF24' } },
      ],
    };
  }, [hours]);
  return <ReactECharts option={option} style={{ height: '224px', width: '100%' }} />;
}