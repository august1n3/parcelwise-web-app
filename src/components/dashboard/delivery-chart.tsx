'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import { useMemo } from 'react';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { Delivery } from '@/lib/types';


export default function DeliveryChart({ deliveries }: { deliveries: Delivery[] }) {
  const chartData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    for (const delivery of deliveries) {
      statusCounts[delivery.status] = (statusCounts[delivery.status] || 0) + 1;
    }
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));
  }, [deliveries]);

  const chartConfig = {
    count: {
      label: 'Count',
    },
    'On Time': {
      label: 'On Time',
      color: 'hsl(var(--chart-2))',
    },
    Delivered: {
      label: 'Delivered',
      color: 'hsl(var(--chart-1))',
    },
    Pending: {
      label: 'Pending',
      color: 'hsl(var(--chart-4))',
    },
    Anomaly: {
      label: 'Anomaly',
      color: 'hsl(var(--destructive))',
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="status"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="count" radius={5}>
          {chartData.map((entry) => (
            <Cell key={entry.status} fill={chartConfig[entry.status as keyof typeof chartConfig]?.color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
