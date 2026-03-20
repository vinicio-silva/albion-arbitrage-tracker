import React, { useMemo } from 'react';
import { AlbionPriceData, formatGMT3 } from '../services/api';
import { ShoppingCart, TrendingUp, HandCoins, Clock } from 'lucide-react';

interface StatsCardsProps {
  data: AlbionPriceData[];
}

export function StatsCards({ data }: StatsCardsProps) {
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    let bestBuyPrice = Infinity;
    let bestBuyCity = '--';
    let bestBuyDate = '';

    let bestSellPrice = 0;
    let bestSellCity = '--';
    let bestSellDate = '';

    data.forEach(cityData => {
      const ask = cityData.sell_price_min;
      const bid = cityData.buy_price_max;

      if (ask > 0 && ask < bestBuyPrice) {
        bestBuyPrice = ask;
        bestBuyCity = cityData.city;
        bestBuyDate = cityData.sell_price_min_date;
      }

      if (bid > 0 && bid > bestSellPrice) {
        bestSellPrice = bid;
        bestSellCity = cityData.city;
        bestSellDate = cityData.buy_price_max_date;
      }
    });

    if (bestBuyPrice === Infinity) bestBuyPrice = 0;

    const rawProfit = (bestSellPrice > 0 && bestBuyPrice > 0 && bestSellPrice > bestBuyPrice) 
      ? bestSellPrice - bestBuyPrice 
      : 0;
      
    const profitPremium = (bestSellPrice > 0 && bestBuyPrice > 0 && bestSellPrice > bestBuyPrice)
      ? (bestSellPrice * 0.96) - bestBuyPrice
      : 0;

    const profitNoPremium = (bestSellPrice > 0 && bestBuyPrice > 0 && bestSellPrice > bestBuyPrice)
      ? (bestSellPrice * 0.92) - bestBuyPrice
      : 0;

    const percentPremium = bestBuyPrice > 0 ? (profitPremium / bestBuyPrice) * 100 : 0;
    const percentNoPremium = bestBuyPrice > 0 ? (profitNoPremium / bestBuyPrice) * 100 : 0;

    return { bestBuyCity, bestBuyPrice, bestBuyDate, bestSellCity, bestSellPrice, bestSellDate, profitMargin: rawProfit, profitPremium, profitNoPremium, percentPremium, percentNoPremium };
  }, [data]);

  if (!stats) return null;

  return (
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <ShoppingCart size={18} color="var(--success)" />
          <h3 className="label-base" style={{ margin: 0 }}>Cheapest to Buy</h3>
        </div>
        <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success)' }}>
          {stats.bestBuyPrice.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 400 }}>silver</span>
        </p>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>in {stats.bestBuyCity}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} /> {formatGMT3(stats.bestBuyDate)}
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <HandCoins size={18} color="var(--accent-primary)" />
          <h3 className="label-base" style={{ margin: 0 }}>Best to Sell</h3>
        </div>
        <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
          {stats.bestSellPrice.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 400 }}>silver</span>
        </p>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>in {stats.bestSellCity}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} /> {formatGMT3(stats.bestSellDate)}
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', borderColor: stats.profitPremium > 0 ? 'rgba(16, 185, 129, 0.3)' : undefined }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <TrendingUp size={18} color={stats.profitPremium > 0 ? "var(--success)" : "var(--text-muted)"} />
          <h3 className="label-base" style={{ margin: 0 }}>Profit After Tax</h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Premium (-4%)</span>
            <span style={{ fontWeight: 600, color: stats.profitPremium > 0 ? 'var(--success)' : 'var(--danger)' }}>
              {stats.profitPremium > 0 ? '+' : ''}{Math.floor(stats.profitPremium).toLocaleString()} 
              <span style={{ fontSize: '0.75rem', marginLeft: '4px', opacity: 0.8 }}>({stats.percentPremium.toFixed(1)}%)</span>
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No Premium (-8%)</span>
            <span style={{ fontWeight: 600, color: stats.profitNoPremium > 0 ? 'var(--success)' : 'var(--danger)' }}>
              {stats.profitNoPremium > 0 ? '+' : ''}{Math.floor(stats.profitNoPremium).toLocaleString()}
              <span style={{ fontSize: '0.75rem', marginLeft: '4px', opacity: 0.8 }}>({stats.percentNoPremium.toFixed(1)}%)</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
