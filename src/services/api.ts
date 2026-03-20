export interface AlbionPriceData {
  item_id: string;
  city: string;
  quality: number;
  sell_price_min: number;
  sell_price_min_date: string;
  sell_price_max: number;
  sell_price_max_date: string;
  buy_price_min: number;
  buy_price_min_date: string;
  buy_price_max: number;
  buy_price_max_date: string;
}

export interface FetchPricesParams {
  itemId: string;
  locations: string[];
  quality?: number;
  maxStaleHours?: number;
  outlierMultiplier?: number;
}

export async function fetchPrices(params: FetchPricesParams): Promise<AlbionPriceData[]> {
  const { itemId, locations, quality, maxStaleHours = 2, outlierMultiplier = 4 } = params;
  

  const safeIds = itemId.split(',').map(id => encodeURIComponent(id.trim())).join(',');
  const url = new URL(`https://west.albion-online-data.com/api/v2/stats/prices/${safeIds}.json`);
  
  const queryParams = new URLSearchParams();
  if (locations && locations.length > 0) queryParams.append('locations', locations.join(','));
  if (quality) queryParams.append('qualities', quality.toString());

  url.search = queryParams.toString();

  const response = await fetch(url.toString(), {
    headers: {
      'Accept-Encoding': 'gzip, deflate'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Albion API: ${response.status} ${response.statusText}`);
  }

  const data: AlbionPriceData[] = await response.json();


  const now = Date.now();
  const staleMs = maxStaleHours * 3600000;
  const outlierMult = outlierMultiplier;

  const activeData = data.filter(d => {

    const sellDate = new Date(d.sell_price_min_date + 'Z').getTime();
    const buyDate = new Date(d.buy_price_max_date + 'Z').getTime();
    

    if (d.sell_price_min === 0 && d.buy_price_max === 0) return false;


    if (d.buy_price_max > 0 && d.sell_price_min > d.buy_price_max * outlierMult) {

      d.sell_price_min = 0; 
    }

    if (d.sell_price_min > 0 && (now - sellDate) > staleMs) {
      d.sell_price_min = 0;
    }
    if (d.buy_price_max > 0 && (now - buyDate) > staleMs) {
      d.buy_price_max = 0;
    }


    return d.sell_price_min > 0 || d.buy_price_max > 0;
  });

  return activeData;
};

export interface MinifiedItem {
  value: string;
  label: string;
}

export function formatGMT3(dateString?: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString + 'Z');
    return d.toLocaleString('pt-BR', { 
      timeZone: 'America/Sao_Paulo', 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (e) {
    return dateString;
  }
}

let cachedItems: MinifiedItem[] | null = null;
export const fetchItemsList = async (): Promise<MinifiedItem[]> => {
  if (cachedItems) return cachedItems;
  try {
    const res = await fetch('/items-min.json');
    if (!res.ok) throw new Error('Failed to load items list');
    cachedItems = await res.json();
    return cachedItems!;
  } catch (err) {
    console.error(err);
    return [];
  }
};
