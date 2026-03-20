import React, { useState, useRef } from 'react';
import { Play, Square, Trophy, MapPin, TrendingUp, Clock, Settings, ListOrdered, Copy, Check, ArrowRight } from 'lucide-react';
import { fetchItemsList, fetchPrices, AlbionPriceData, formatGMT3 } from '../services/api';

interface Opportunity {
  itemId: string;
  itemName: string;
  qualityLevel: number;
  bestBuyCity: string;
  bestBuyPrice: number;
  bestBuyDate: string;
  bestSellCity: string;
  bestSellPrice: number;
  bestSellDate: string;
  profitMargin: number;
  profitPremium: number;
  profitNoPremium: number;
  percentPremium: number;
  percentNoPremium: number;
}

const DELAY_MS = 1050;

const QUALITIES = [
  { label: 'All Qualities (1-5)', value: 0 },
  { label: 'Normal (1)', value: 1 },
  { label: 'Good (2)', value: 2 },
  { label: 'Outstanding (3)', value: 3 },
  { label: 'Excellent (4)', value: 4 },
  { label: 'Masterpiece (5)', value: 5 },
];

const STALE_OPTIONS = [
  { label: '5 Minutes', value: 5 / 60 },
  { label: '15 Minutes', value: 15 / 60 },
  { label: '30 Minutes', value: 0.5 },
  { label: '1 Hour', value: 1 },
  { label: '2 Hours', value: 2 },
  { label: '4 Hours', value: 4 },
  { label: '12 Hours', value: 12 },
  { label: '24 Hours', value: 24 },
];

const CITIES = ['Caerleon', 'Thetford', 'Lymhurst', 'Fort Sterling', 'Martlock', 'Bridgewatch', 'Black Market'];

function getQualityTag(q: number) {
  if (q === 1) return '';
  if (q === 2) return ' (Good)';
  if (q === 3) return ' (Outstanding)';
  if (q === 4) return ' (Excellent)';
  if (q === 5) return ' (Masterpiece)';
  return '';
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      title="Copy to clipboard"
      style={{ 
        background: 'transparent', 
        border: 'none', 
        cursor: 'pointer', 
        color: copied ? 'var(--success)' : 'var(--text-muted)',
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px',
        opacity: copied ? 1 : 0.6,
        transition: 'all 0.2s'
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
      onMouseLeave={e => { if(!copied) e.currentTarget.style.opacity = '0.6' }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

export function RouteScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  
  const [buyCity, setBuyCity] = useState<string>('Lymhurst');
  const [sellCity, setSellCity] = useState<string>('Black Market');
  
  const [staleHours, setStaleHours] = useState<number>(2);
  const [outlierMultiplier, setOutlierMultiplier] = useState<number>(4);
  const [quality, setQuality] = useState<number>(1);
  const [topRankLimit, setTopRankLimit] = useState<number>(50);
  const [sortBy, setSortByState] = useState<'profit'|'percentage'>('profit');
  const sortByRef = useRef<'profit'|'percentage'>('profit');
  const abortRef = useRef(false);

  const setSortBy = (val: 'profit'|'percentage') => {
    setSortByState(val);
    sortByRef.current = val;
    setOpportunities(prev => {
      const sorted = [...prev].sort((a,b) => val === 'profit' ? b.profitPremium - a.profitPremium : b.percentPremium - a.percentPremium);
      return sorted;
    });
  };

  const startScan = async () => {
    setIsScanning(true);
    abortRef.current = false;
    setOpportunities([]);

    const items = await fetchItemsList();
    const CHUNK_SIZE = 70;
    setProgress({ current: 0, total: items.length });

    const nameMap = new Map(items.map(i => [i.value, i.label]));


    while (!abortRef.current) {
      let itemsProcessed = 0;
      
      for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        if (abortRef.current) break;

        const chunk = items.slice(i, i + CHUNK_SIZE);
        const chunkIds = chunk.map(c => c.value).join(',');
        
        try {

          const locations = Array.from(new Set([buyCity, sellCity]));
          
          const prices = await fetchPrices({
            itemId: chunkIds,
            locations: locations,
            quality: quality === 0 ? undefined : quality,
            maxStaleHours: staleHours,
            outlierMultiplier: outlierMultiplier
          });


          const grouped = prices.reduce((acc, curr) => {
            const key = `${curr.item_id}@@${curr.quality}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(curr);
            return acc;
          }, {} as Record<string, AlbionPriceData[]>);

          const newOpps: Opportunity[] = [];

          Object.keys(grouped).forEach(key => {
            const cityData = grouped[key];
            const rawItemId = key.split('@@')[0];
            const rawQuality = Number(key.split('@@')[1]);

            let bestBuyPrice = Infinity;
            let bestBuyDate = '';
            let bestSellPrice = 0;
            let bestSellDate = '';

            cityData.forEach(d => {
              if (d.city === buyCity) {
                const ask = d.sell_price_min;
                if (ask > 0 && ask < bestBuyPrice) {
                  bestBuyPrice = ask;
                  bestBuyDate = d.sell_price_min_date;
                }
              }
              if (d.city === sellCity) {
                const bid = d.buy_price_max;
                if (bid > 0 && bid > bestSellPrice) {
                  bestSellPrice = bid;
                  bestSellDate = d.buy_price_max_date;
                }
              }
            });

            if (bestBuyPrice !== Infinity && bestSellPrice > 0 && bestSellPrice > bestBuyPrice) {
              const rawProfit = bestSellPrice - bestBuyPrice;
              const profitPremium = (bestSellPrice * 0.96) - bestBuyPrice;
              const profitNoPremium = (bestSellPrice * 0.92) - bestBuyPrice;

              newOpps.push({
                itemId: rawItemId,
                itemName: `${nameMap.get(rawItemId) || rawItemId}${getQualityTag(rawQuality)}`,
                qualityLevel: rawQuality,
                bestBuyCity: buyCity,
                bestBuyPrice,
                bestBuyDate,
                bestSellCity: sellCity,
                bestSellPrice,
                bestSellDate,
                profitMargin: rawProfit,
                profitPremium,
                profitNoPremium,
                percentPremium: (profitPremium / bestBuyPrice) * 100,
                percentNoPremium: (profitNoPremium / bestBuyPrice) * 100
              });
            }
          });

          if (newOpps.length > 0) {
            setOpportunities(prev => {
              const oppMap = new Map();
              [...prev, ...newOpps].forEach(opp => {
                oppMap.set(`${opp.itemId}-${opp.qualityLevel}`, opp);
              });
              
              const merged = Array.from(oppMap.values());
              merged.sort((a,b) => sortByRef.current === 'profit' ? b.profitPremium - a.profitPremium : b.percentPremium - a.percentPremium);
              return merged.slice(0, Math.min(topRankLimit, 200)); 
            });
          }
        } catch (err) {
          console.error("Scanner error on chunk", err);
        }

        itemsProcessed += chunk.length;
        setProgress({ current: itemsProcessed, total: items.length });

        if (!abortRef.current) {
          await new Promise(res => setTimeout(res, DELAY_MS));
        }
      }
    } 
    
    setIsScanning(false);
  };

  const stopScan = () => {
    abortRef.current = true;
    setIsScanning(false);
  };

  const percentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <section className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={24} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600, margin: 0 }}>LOC A ➔ LOC B Scanner</h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Focus on a specific trade route. Choose the city to buy from and the city to sell to, ranking items by profit margin strictly on this path.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', flexWrap: 'wrap', width: '100%' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} title="The starting city where to buy the items.">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Buy in</label>
            <select 
              className="input-base" 
              style={{ width: '130px', padding: '6px', fontSize: '0.9rem' }} 
              value={buyCity} 
              onChange={e => setBuyCity(e.target.value)}
              disabled={isScanning}
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <ArrowRight size={16} color="var(--text-muted)" />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }} title="The destination city where to sell the items.">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sell to</label>
            <select 
              className="input-base" 
              style={{ width: '130px', padding: '6px', fontSize: '0.9rem' }} 
              value={sellCity} 
              onChange={e => setSellCity(e.target.value)}
              disabled={isScanning}
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} title="Filter results by specific item quality level.">
            <Settings size={16} color="var(--text-muted)" />
            <select 
              className="input-base" 
              style={{ width: '170px', padding: '6px', fontSize: '0.9rem' }} 
              value={quality} 
              onChange={e => setQuality(Number(e.target.value))}
              disabled={isScanning}
            >
              {QUALITIES.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} title="Ignore market data older than this threshold to avoid outdated prices.">
            <select 
              className="input-base" 
              style={{ width: '110px', padding: '6px', fontSize: '0.9rem' }} 
              value={staleHours} 
              onChange={e => setStaleHours(Number(e.target.value))}
              disabled={isScanning}
              title="Max Stale Time"
            >
              {STALE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} title="Ignore ask prices that are X times higher than the best bid (Filters out manipulated items).">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} title="Fake Order (xBid)">xBid</label>
            <input 
              type="number" 
              className="input-base" 
              style={{ width: '55px', padding: '6px', fontSize: '0.9rem' }}
              value={outlierMultiplier} 
              onChange={e => setOutlierMultiplier(Math.max(1, Number(e.target.value)))} 
              min={1} 
              step={0.5}
              disabled={isScanning}
              title="Fake Order Multiplier"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} title="Order the table by highest silver amount or highest ROI percentage.">
            <ListOrdered size={16} color="var(--text-muted)" />
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sort By</label>
            <select 
              className="input-base" 
              style={{ width: '110px', padding: '6px', fontSize: '0.9rem' }} 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value as 'profit'|'percentage')}
              disabled={isScanning}
              title="Sort By"
            >
              <option value="profit">Amount</option>
              <option value="percentage">ROI %</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} title="Limit the table to display only the top N best opportunities.">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Top Ranks</label>
            <input 
              type="number" 
              className="input-base" 
              style={{ width: '55px', padding: '6px', fontSize: '0.9rem' }}
              value={topRankLimit} 
              onChange={e => setTopRankLimit(Math.min(200, Math.max(1, Number(e.target.value))))} 
              min={1} 
              max={200}
              disabled={isScanning}
              title="Top Ranks Limit"
            />
          </div>

          {!isScanning ? (
            <button className="btn-primary" style={{ width: 'auto', marginLeft: 'auto', padding: '8px 16px', fontSize: '0.9rem' }} onClick={startScan}>
              <Play size={16} />
              Start Scan
            </button>
          ) : (
            <button className="btn-primary" style={{ width: 'auto', marginLeft: 'auto', padding: '8px 16px', fontSize: '0.9rem', background: 'var(--danger)' }} onClick={stopScan}>
              <Square size={16} />
              Stop Scanner
            </button>
          )}
        </div>
      </div>

      {(isScanning || progress.current > 0) && (
        <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', height: '8px', position: 'relative', marginTop: '8px' }}>
          <div style={{ 
            height: '100%', 
            width: `${percentage}%`, 
            background: 'linear-gradient(90deg, var(--accent-primary), var(--success))',
            transition: 'width 0.3s ease-out'
          }} />
        </div>
      )}

      {opportunities.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', color: 'var(--success)' }}>
            <Trophy size={18} /> Top {Math.min(topRankLimit, opportunities.length)} Flips Discovered
          </h3>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', paddingBottom: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px' }}>Item</th>
                  <th style={{ padding: '12px' }}>Cheapest to Buy</th>
                  <th style={{ padding: '12px' }}>Best to Sell</th>
                  <th style={{ padding: '12px', color: 'var(--success)' }}>Profit (After Tax)</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp, i) => (
                  <tr key={opp.itemId + i} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '12px', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{opp.itemName}</span>
                        <CopyButton text={opp.itemName.replace(/ \((Good|Outstanding|Excellent|Masterpiece)\)$/, '')} />
                      </div>
                      <span style={{fontSize:'0.75rem', color:'var(--text-muted)', display:'block', marginTop:'4px'}}>{opp.itemId}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>{opp.bestBuyPrice.toLocaleString()} </span>
                      <small style={{ color: 'var(--text-muted)' }}>in {opp.bestBuyCity}</small>
                      <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', marginTop: '2px', opacity: 0.8 }}><Clock size={10} style={{display:'inline', marginBottom:'-1px'}}/> {formatGMT3(opp.bestBuyDate)}</small>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{opp.bestSellPrice.toLocaleString()} </span>
                      <small style={{ color: 'var(--text-muted)' }}>in {opp.bestSellCity}</small>
                      <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', marginTop: '2px', opacity: 0.8 }}><Clock size={10} style={{display:'inline', marginBottom:'-1px'}}/> {formatGMT3(opp.bestSellDate)}</small>
                    </td>
                    <td style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontWeight: 700, color: opp.profitPremium > 0 ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp size={14} /> {opp.profitPremium > 0 ? '+' : ''}{Math.floor(opp.profitPremium).toLocaleString()} <span style={{fontSize: '0.75rem', fontWeight: 500, opacity: 0.9}}>({opp.percentPremium.toFixed(1)}%)</span> <span style={{fontSize: '0.65rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '4px'}}>w/ Prem</span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: opp.profitNoPremium > 0 ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                         {opp.profitNoPremium > 0 ? '+' : ''}{Math.floor(opp.profitNoPremium).toLocaleString()} <span style={{fontSize: '0.75rem', fontWeight: 500, opacity: 0.9}}>({opp.percentNoPremium.toFixed(1)}%)</span> <span style={{fontSize: '0.65rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '4px'}}>No Prem</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
