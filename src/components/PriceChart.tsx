import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AlbionPriceData } from '../services/api';

interface PriceChartProps {
  data: AlbionPriceData[];
}

export function PriceChart({ data }: PriceChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    

    return [...data].sort((a, b) => {
      const askA = a.sell_price_min || Infinity;
      const askB = b.sell_price_min || Infinity;
      return askA - askB;
    });
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No accurate data available for chart. Try selecting a different item or location.
      </div>
    );
  }

  const formatTooltip = (value: any, name: any) => {
    const label = name === 'sell_price_min' ? 'Lowest Sell Order (Ask)' : 'Highest Buy Order (Bid)';
    return [`${Number(value).toLocaleString()} silver`, label];
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '350px', padding: '10px 0' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis 
            dataKey="city" 
            stroke="var(--text-secondary)"
            tick={{ fill: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}
            tickMargin={12}
          />
          <YAxis 
            stroke="var(--text-secondary)" 
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
            tickMargin={8}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-glass)', backdropFilter: 'blur(8px)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
            itemStyle={{ fontWeight: 600 }}
            formatter={formatTooltip}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }} 
            formatter={(value) => value === 'sell_price_min' ? 'Price to Buy (Lowest Ask)' : 'Price to Sell (Highest Bid)'}
          />
          <Bar dataKey="sell_price_min" fill="var(--success)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="buy_price_max" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
