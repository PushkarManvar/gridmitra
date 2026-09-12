import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { DispatchHour } from '../types';

export interface DemandPriorityChartProps {
  hours: DispatchHour[];
}

export function DemandPriorityChart({ hours }: DemandPriorityChartProps) {
  const option = useMemo<EChartsOption>(() => {
    const xAxisData = hours.map((h) => `${h.hour}:00`);
    return {
      tooltip: {
        valueFormatter: (value) => Number(value).toFixed(1), trigger: 'axis', backgroundColor: '#FFFFFF', borderColor: '#E2DDD2', textStyle: { fontFamily: 'JetBrains Mono', fontSize: 12 } },
      legend: { show: false },
      grid: { left: '2%', right: '2%', top: '10%', bottom: '15%', containLabel: true },
      xAxis: { type: 'category', data: xAxisData, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#7C8B87', fontFamily: 'JetBrains Mono', fontSize: 11 }, boundaryGap: false },
      yAxis: { type: 'value', axisLabel: { color: '#7C8B87', fontFamily: 'JetBrains Mono', fontSize: 11 }, splitLine: { lineStyle: { type: 'dashed', color: '#EDE9E0' } } },
      series: [
        {
          name: 'Total Demand', type: 'line', data: hours.map(h => 80 + Math.random() * 40 + (h.hour === 19 ? 80 : 0)),
          itemStyle: { color: '#BA1A1A' }, symbol: 'none', smooth: 0.2,
          areaStyle: { color: 'rgba(186, 26, 26, 0.1)' }
        }
      ],
    };
  }, [hours]);
  return <ReactECharts option={option} style={{ height: '224px', width: '100%' }} />;
}
