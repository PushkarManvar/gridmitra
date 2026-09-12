import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type { DispatchHour } from '../types';

export interface BatterySOCChartProps {
  hours: DispatchHour[];
  reserveTargetKwh: number;
  capacityKwh: number;
}

export function BatterySOCChart({ hours, reserveTargetKwh, capacityKwh }: BatterySOCChartProps) {
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
      legend: {
        bottom: 0,
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontFamily: 'Geist, sans-serif', fontSize: 12, color: '#52605D' },
      },
      grid: {
        left: '12%',
        right: '4%',
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
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        name: 'Battery energy (kWh)',
        nameLocation: 'middle',
        nameGap: 36,
        max: capacityKwh,
        nameTextStyle: { color: '#7C8B87', fontFamily: 'Geist, sans-serif', fontSize: 11 },
        axisLabel: { color: '#7C8B87', fontFamily: 'JetBrains Mono', fontSize: 11 },
        splitLine: { lineStyle: { type: 'dashed', color: '#EDE9E0' } },
      },
      series: [
        {
          name: 'Battery energy',
          type: 'line',
          smooth: 0.2,
          symbol: 'none',
          data: hours.map((h) => h.battery_energy_end_kwh),
          itemStyle: { color: '#0D5748' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(13, 87, 72, 0.2)' },
                { offset: 1, color: 'rgba(13, 87, 72, 0.02)' },
              ],
            },
          },
        },
        {
          name: 'Reserve Target',
          type: 'line',
          markLine: {
            silent: true,
            symbol: 'none',
            data: [{ yAxis: reserveTargetKwh }],
            lineStyle: { color: '#EA580C', type: 'dashed' },
            label: { show: false },
          },
        },
      ],
    };
  }, [hours, reserveTargetKwh, capacityKwh]);

  return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} />;
}