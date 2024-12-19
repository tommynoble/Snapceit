import React from 'react';
import { useReceipts } from '../../components/dashboard/receipts/ReceiptContext';
import { Receipt } from '../../components/dashboard/receipts/ReceiptContext';
import { walmartApi } from '../../services/walmartApi';

interface PriceComparison {
  itemName: string;
  yourPrice: number;
  walmartPrice: number | null;
  walmartUrl: string | null;
  loading: boolean;
  error: string | null;
}

export function PriceMatchPage() {
  const { receipts } = useReceipts();
  const [selectedReceipt, setSelectedReceipt] = React.useState<Receipt | null>(null);
  const [comparisons, setComparisons] = React.useState<Record<string, PriceComparison>>({});

  const handleCompare = async (itemName: string, price: number) => {
    // Update loading state
    setComparisons(prev => ({
      ...prev,
      [itemName]: {
        itemName,
        yourPrice: price,
        walmartPrice: null,
        walmartUrl: null,
        loading: true,
        error: null
      }
    }));

    try {
      const match = await walmartApi.findBestPriceMatch(itemName, price);
      
      setComparisons(prev => ({
        ...prev,
        [itemName]: {
          itemName,
          yourPrice: price,
          walmartPrice: match?.salePrice || null,
          walmartUrl: match?.productUrl || null,
          loading: false,
          error: !match ? 'No matching products found' : null
        }
      }));
    } catch (error) {
      setComparisons(prev => ({
        ...prev,
        [itemName]: {
          itemName,
          yourPrice: price,
          walmartPrice: null,
          walmartUrl: null,
          loading: false,
          error: 'Error fetching price comparison'
        }
      }));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Price Match</h1>
        <p className="text-white/70">Compare your receipt items with current prices from Walmart</p>
      </div>

      {/* Receipt Selection */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Select Receipt</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {receipts.map((receipt) => (
            <button
              key={receipt.id}
              onClick={() => setSelectedReceipt(receipt)}
              className={`p-4 rounded-lg border transition-all ${
                selectedReceipt?.id === receipt.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/10 hover:border-white/20 bg-white/5'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-white font-medium">{receipt.merchant}</span>
                <span className="text-white/70">${receipt.total.toFixed(2)}</span>
              </div>
              <div className="text-sm text-white/60">
                {new Date(receipt.date).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Receipt Items */}
      {selectedReceipt && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Items to Compare</h2>
          <div className="space-y-4">
            {selectedReceipt.items.map((item, index) => {
              const comparison = comparisons[item.name];
              const savings = comparison?.walmartPrice 
                ? (comparison.yourPrice - comparison.walmartPrice).toFixed(2)
                : null;

              return (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{item.name}</h3>
                      <p className="text-white/60">Your price: ${item.price.toFixed(2)}</p>
                      
                      {comparison && (
                        <div className="mt-2">
                          {comparison.loading ? (
                            <p className="text-white/60">Loading comparison...</p>
                          ) : comparison.error ? (
                            <p className="text-red-400">{comparison.error}</p>
                          ) : (
                            <>
                              <p className="text-white/60">
                                Walmart price: ${comparison.walmartPrice?.toFixed(2)}
                              </p>
                              {savings && Number(savings) > 0 && (
                                <p className="text-green-400 mt-1">
                                  Potential savings: ${savings}
                                </p>
                              )}
                              {comparison.walmartUrl && (
                                <a
                                  href={comparison.walmartUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
                                >
                                  View at Walmart
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {!comparison && (
                        <button
                          onClick={() => handleCompare(item.name, item.price)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        >
                          Compare
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {receipts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-white/70 mb-4">No receipts found</div>
          <p className="text-white/50">Upload receipts to start comparing prices</p>
        </div>
      )}
    </div>
  );
}