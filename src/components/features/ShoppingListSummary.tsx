// ShoppingListSummary component for displaying shopping list overview and recommendations
// Part of HIGH Priority Feature Components implementation

import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  MapPin, 
  Clock, 
  Star, 
  Plus, 
  Check, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  Package
} from 'lucide-react';
import { cn } from '../../utils/helpers';

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price?: number;
  isCompleted: boolean;
  isEssential: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface Market {
  id: string;
  name: string;
  distance: number; // in km
  rating: number;
  estimatedCost: number;
  hasDelivery: boolean;
  deliveryFee?: number;
  estimatedTime: number; // in minutes
  address: string;
  isOpen: boolean;
}

export interface ShoppingListSummaryProps {
  items: ShoppingItem[];
  markets?: Market[];
  totalEstimatedCost?: number;
  completedItems?: number;
  showRecommendations?: boolean;
  showMarkets?: boolean;
  onItemToggle?: (itemId: string) => void;
  onAddItem?: () => void;
  onMarketSelect?: (market: Market) => void;
  className?: string;
}

const priorityColors = {
  low: 'text-gray-600 bg-gray-100',
  medium: 'text-yellow-600 bg-yellow-100',
  high: 'text-red-600 bg-red-100'
};

const categoryIcons = {
  'Fruits & Vegetables': '🥬',
  'Dairy & Eggs': '🥛',
  'Meat & Seafood': '🥩',
  'Pantry': '🥫',
  'Bakery': '🍞',
  'Frozen': '🧊',
  'Beverages': '🥤',
  'Snacks': '🍿',
  'Health & Beauty': '🧴',
  'Household': '🧽'
};

export const ShoppingListSummary = forwardRef<HTMLDivElement, ShoppingListSummaryProps>(
  (
    {
      items,
      markets = [],
      totalEstimatedCost = 0,
      completedItems = 0,
      showRecommendations = true,
      showMarkets = true,
      onItemToggle,
      onAddItem,
      onMarketSelect,
      className
    },
    ref
  ) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showCompleted, setShowCompleted] = useState(false);

    const totalItems = items.length;
    const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    const remainingItems = totalItems - completedItems;

    // Group items by category
    const itemsByCategory = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, ShoppingItem[]>);

    // Get categories with items
    const categories = Object.keys(itemsByCategory);

    // Filter items based on selection
    const filteredItems = selectedCategory 
      ? itemsByCategory[selectedCategory] || []
      : items.filter(item => showCompleted || !item.isCompleted);

    // Get essential items
    const essentialItems = items.filter(item => item.isEssential && !item.isCompleted);

    // Get high priority items
    const highPriorityItems = items.filter(item => item.priority === 'high' && !item.isCompleted);

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price);
    };

    const formatDistance = (distance: number) => {
      return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
    };

    return (
      <div ref={ref} className={cn('space-y-6', className)}>
        {/* Summary Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Shopping List</h3>
                <p className="text-sm text-gray-600">
                  {completedItems} of {totalItems} items completed
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(totalEstimatedCost)}
              </div>
              <div className="text-sm text-gray-600">Estimated total</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">{Math.round(completionPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="h-2 bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{remainingItems}</div>
              <div className="text-xs text-gray-600">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{completedItems}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{categories.length}</div>
              <div className="text-xs text-gray-600">Categories</div>
            </div>
          </div>
        </div>

        {/* Essential Items Alert */}
        {essentialItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-800">Essential Items</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {essentialItems.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-md"
                >
                  {item.name}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                  !selectedCategory
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                All ({totalItems})
              </button>
              {categories.map((category) => {
                const categoryItems = itemsByCategory[category];
                const completed = categoryItems.filter(item => item.isCompleted).length;
                const total = categoryItems.length;
                
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center space-x-1',
                      selectedCategory === category
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    <span>{categoryIcons[category] || '📦'}</span>
                    <span>{category}</span>
                    <span className="text-xs">({completed}/{total})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Shopping Items */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">
                {selectedCategory ? `${selectedCategory} Items` : 'Shopping Items'}
              </h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className={cn(
                    'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                    showCompleted
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-blue-100 text-blue-700'
                  )}
                >
                  {showCompleted ? 'Hide Completed' : 'Show Completed'}
                </button>
                <button
                  onClick={onAddItem}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    'p-4 flex items-center space-x-3 transition-colors',
                    item.isCompleted && 'bg-gray-50 opacity-75'
                  )}
                >
                  <button
                    onClick={() => onItemToggle?.(item.id)}
                    className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                      item.isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-500'
                    )}
                  >
                    {item.isCompleted && <Check className="w-3 h-3" />}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h5 className={cn(
                        'font-medium',
                        item.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                      )}>
                        {item.name}
                      </h5>
                      {item.isEssential && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Essential
                        </span>
                      )}
                      <span className={cn(
                        'px-2 py-1 text-xs rounded-full',
                        priorityColors[item.priority]
                      )}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{item.quantity} {item.unit}</span>
                      {item.price && (
                        <span className="font-medium">{formatPrice(item.price)}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-500">{item.category}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredItems.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No items found</p>
              </div>
            )}
          </div>
        </div>

        {/* Market Recommendations */}
        {showMarkets && markets.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">Recommended Markets</h4>
            </div>
            <div className="divide-y divide-gray-200">
              {markets.map((market) => (
                <motion.div
                  key={market.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onMarketSelect?.(market)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-medium text-gray-900">{market.name}</h5>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">{market.rating}</span>
                        </div>
                        {!market.isOpen && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Closed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{formatDistance(market.distance)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{market.estimatedTime} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium">{formatPrice(market.estimatedCost)}</span>
                        </div>
                        {market.hasDelivery && (
                          <div className="flex items-center space-x-1">
                            <Package className="w-4 h-4" />
                            <span>Delivery</span>
                            {market.deliveryFee && (
                              <span>({formatPrice(market.deliveryFee)})</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{market.address}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

ShoppingListSummary.displayName = 'ShoppingListSummary';

export default ShoppingListSummary;
