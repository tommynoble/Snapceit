interface WalmartProduct {
  itemId: string;
  name: string;
  salePrice: number;
  productUrl: string;
  thumbnailImage?: string;
  customerRating?: number;
  numReviews?: number;
  availableOnline: boolean;
}

interface WalmartSearchResponse {
  items: WalmartProduct[];
  totalResults: number;
  query: string;
}

class WalmartApiService {
  private readonly baseUrl = 'https://api.walmart.com/v3/items/search';
  private readonly apiKey: string;

  constructor() {
    const apiKey = process.env.VITE_WALMART_API_KEY;
    if (!apiKey) {
      throw new Error('Walmart API key is not configured');
    }
    this.apiKey = apiKey;
  }

  async searchProducts(query: string): Promise<WalmartProduct[]> {
    try {
      const response = await fetch(`${this.baseUrl}?query=${encodeURIComponent(query)}`, {
        headers: {
          'WM_SEC.ACCESS_TOKEN': this.apiKey,
          'WM_QOS.CORRELATION_ID': crypto.randomUUID(),
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Walmart API error: ${response.statusText}`);
      }

      const data: WalmartSearchResponse = await response.json();
      return data.items;
    } catch (error) {
      console.error('Error searching Walmart products:', error);
      throw error;
    }
  }

  async findBestPriceMatch(productName: string, targetPrice: number): Promise<WalmartProduct | null> {
    try {
      const products = await this.searchProducts(productName);
      
      if (products.length === 0) {
        return null;
      }

      // Sort products by price similarity to target price
      const sortedProducts = products.sort((a, b) => {
        const aPriceDiff = Math.abs(a.salePrice - targetPrice);
        const bPriceDiff = Math.abs(b.salePrice - targetPrice);
        return aPriceDiff - bPriceDiff;
      });

      return sortedProducts[0];
    } catch (error) {
      console.error('Error finding price match:', error);
      throw error;
    }
  }
}

export const walmartApi = new WalmartApiService();
