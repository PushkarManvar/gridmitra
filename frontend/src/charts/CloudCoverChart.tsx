import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type { WeatherHour } from '../types/weather';

export interface CloudCoverChartProps {
  hours: WeatherHour[];
}

export function CloudCoverChart({ hours }: CloudCoverChartProps) {
  const option = useMemo<EChartsOption>(() => {
    return {
      tooltip: {
        valueFormatter: (value) => `${Number(value).toFixed(0)}%`,
        trigger: 'axis',
        backgroundColor: '#FFFFFF',
        borderColor: '#E2DDD2',
        textStyle: { fontFamily: 'JetBrains Mono, monospace', fontSize: 12 },
      },
      grid: { left: '2%', right: '2%', top: '10%', bottom: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: hours.map((h) => `${h.hour_index}:00`),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#7C8B87', fontFamily: 'JetBrains Mono', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: { color: '#7C8B87', fontFamily: 'JetBrains Mono', fontSize: 11, formatter: '{value}%' },
        splitLine: { lineStyle: { type: 'dashed', color: '#EDE9E0' } },
      },
      series: [
        {
          name: 'Cloud cover',
          type: 'line',
          smooth: 0.2,
          symbol: 'none',
          data: hours.map((h) => h.cloud_cover_percent),
          itemStyle: { color: '#64748B' },
          areaStyle: { color: 'rgba(100, 116, 139, 0.15)' },
        },
      ],
    };
  }, [hours]);

  return <ReactECharts option={option} style={{ height: '224px', width: '100%' }} />;
}