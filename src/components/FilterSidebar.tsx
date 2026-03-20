import React, { useState, useEffect } from 'react';
import { Select } from './ui/Select';
import { MultiSelect } from './ui/MultiSelect';
import { Filter, Search } from 'lucide-react';
import { FetchPricesParams, fetchItemsList, MinifiedItem } from '../services/api';

const LOCATIONS = [
  { label: 'Caerleon', value: 'Caerleon' },
  { label: 'Thetford', value: 'Thetford' },
  { label: 'Fort Sterling', value: 'Fort Sterling' },
  { label: 'Lymhurst', value: 'Lymhurst' },
  { label: 'Bridgewatch', value: 'Bridgewatch' },
  { label: 'Martlock', value: 'Martlock' },
  { label: 'Black Market', value: 'Black Market' },
  { label: 'Brecilien', value: 'Brecilien' },
];

const QUALITIES = [
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
  { label: '3 Days', value: 72 },
];

interface FilterSidebarProps {
  onSearch: (params: FetchPricesParams) => void;
  isLoading: boolean;
}

export function FilterSidebar({ onSearch, isLoading }: FilterSidebarProps) {
  const [itemsList, setItemsList] = useState<MinifiedItem[]>([]);
  const [itemIdInput, setItemIdInput] = useState('');
  
  const [locations, setLocations] = useState<string[]>([
    'Caerleon', 'Thetford', 'Lymhurst', 'Fort Sterling', 'Martlock', 'Bridgewatch', 'Black Market'
  ]);
  const [quality, setQuality] = useState<number>(1);
  const [staleHours, setStaleHours] = useState<number>(2);
  const [outlierMultiplier, setOutlierMultiplier] = useState<number>(4);

  useEffect(() => {
    let mounted = true;
    fetchItemsList().then(data => {
      if (mounted) setItemsList(data);
    });
    return () => { mounted = false; };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemIdInput) return;
    
    let finalItemId = itemIdInput;

    const matchedItem = itemsList.find(i => 
      i.label.toLowerCase() === itemIdInput.toLowerCase() || 
      i.value.toLowerCase() === itemIdInput.toLowerCase()
    );
    if (matchedItem) {
      finalItemId = matchedItem.value;

      setItemIdInput(matchedItem.value); 
    }

    onSearch({
      itemId: finalItemId,
      locations,
      quality,
      maxStaleHours: staleHours,
      outlierMultiplier: outlierMultiplier
    });
  };

  const displayedItems = React.useMemo(() => {
    if (!itemsList.length) return [];
    if (!itemIdInput) return itemsList.slice(0, 100);
    const search = itemIdInput.toLowerCase();
    return itemsList
      .filter(i => i.label.toLowerCase().includes(search) || i.value.toLowerCase().includes(search))
      .slice(0, 100);
  }, [itemsList, itemIdInput]);

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Filter size={20} color="var(--accent-primary)" />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Filters</h2>
      </div>

      <div style={{ width: '100%', marginBottom: '16px' }}>
        <label className="label-base">Item (Search)</label>
        <div style={{ position: 'relative' }}>
          <input 
            list="itemDatalist"
            className="input-base"
            value={itemIdInput}
            onChange={e => setItemIdInput(e.target.value)}
            placeholder="e.g. Adept's Bag ou T4_BAG"
            required
            style={{ paddingRight: '32px' }}
          />
          <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        </div>
        <datalist id="itemDatalist">
          {displayedItems.map(item => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </datalist>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
          Start typing to search thousands of items.
        </span>
      </div>
      
      <MultiSelect 
        label="Locations" 
        options={LOCATIONS} 
        value={locations} 
        onChange={setLocations} 
        placeholder="Select cities..." 
      />
      
      <Select 
        label="Quality / Enchantment" 
        options={QUALITIES} 
        value={quality} 
        onChange={e => setQuality(Number(e.target.value))} 
      />

      <div style={{ marginBottom: '16px' }}>
        <label className="label-base">Max Stale Time</label>
        <select 
          className="input-base" 
          value={staleHours} 
          onChange={e => setStaleHours(Number(e.target.value))}
        >
          {STALE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label className="label-base">Fake Orders (xBid)</label>
        <input 
          type="number" 
          className="input-base" 
          value={outlierMultiplier} 
          onChange={e => setOutlierMultiplier(Math.max(1, Number(e.target.value)))} 
          min={1} 
          step={0.5}
        />
      </div>
      
      <button 
        type="submit" 
        className="btn-primary" 
        disabled={isLoading || !itemIdInput}
        style={{ marginTop: '16px' }}
      >
        <Search size={18} />
        {isLoading ? 'Scanning Market...' : 'Find Arbitrage'}
      </button>
    </form>
  );
}
