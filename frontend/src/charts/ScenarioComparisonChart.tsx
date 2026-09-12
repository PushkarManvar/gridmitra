import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';

export interface ScenarioComparisonChartProps {
  color: string;
}

export function ScenarioComparisonChart({ color }: ScenarioComparisonChartProps) {
  const option = useMemo<EChartsOption>(() => {
    const data = Array.from({ length: 24 }).map((_, i) => 80 + Math.random() * 40 + (i === 19 ? 80 : 0));
    return {
      tooltip: {
        valueFormatter: (value) => Number(value).toFixed(1), trigger: 'axis' },
      grid: { left: 0, right: 0, top: 0, bottom: 0 },
      xAxis: { type: 'category', show: false, boundaryGap: false },
      yAxis: { type: 'value', show: false },
      series: [{
        type: 'line', data,
        itemStyle: { color }, symbol: 'none', smooth: 0.2,
        areaStyle: { color: 'rgba(0,0,0,0.05)' }
      }],
    };
  }, [color]);
  return <ReactECharts option={option} style={{ height: '160px', width: '100%' }} />;
}
