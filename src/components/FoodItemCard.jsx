import React from 'react';
import ClayCard from './ClayCard';
import { Plus, Minus, Trash2, Edit2 } from 'lucide-react';

export default function FoodItemCard({ item, onQuantityChange, onEdit, onDelete }) {
  const categoryColors = {
    fruits: 'mint',
    snacks: 'yellow',
    meals: 'blue',
    drinks: 'blue',
    sweets: 'pink',
    other: 'lavender'
  };

  return (
    <ClayCard color={categoryColors[item.category] || 'lavender'} className="mb-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-3 py-1 bg-white/60 rounded-full shadow-inner text-orange-700 font-semibold">
              🍬 {item.sugar}g sugar
            </span>
            <span className="px-3 py-1 bg-white/60 rounded-full shadow-inner text-green-700 font-semibold">
              💰 ₹{item.cost.toFixed(2)}
            </span>
            <span className="px-3 py-1 bg-white/60 rounded-full shadow-inner text-purple-700 font-semibold capitalize">
              {item.category}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/50 rounded-[14px] px-2 py-1 shadow-inner">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuantityChange(item.id, item.quantity - 1);
              }}
              disabled={item.quantity <= 0}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-red-200 to-red-100 flex items-center justify-center shadow-md active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:from-red-300 hover:to-red-200"
            >
              <Minus className="w-4 h-4 text-red-900" />
            </button>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const newValue = parseInt(e.target.value) || 0;
                onQuantityChange(item.id, newValue);
              }}
              onBlur={(e) => {
                // Ensure valid value on blur
                const newValue = parseInt(e.target.value) || 0;
                if (newValue !== item.quantity) {
                  onQuantityChange(item.id, newValue);
                }
              }}
              className="w-16 text-center bg-transparent font-bold text-gray-800 outline-none"
              min="0"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuantityChange(item.id, item.quantity + 1);
              }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-green-200 to-green-100 flex items-center justify-center shadow-md active:shadow-inner transition-all hover:from-green-300 hover:to-green-200"
            >
              <Plus className="w-4 h-4 text-green-900" />
            </button>
          </div>
          
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(item);
            }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-100 flex items-center justify-center shadow-md active:shadow-inner transition-all hover:from-blue-300 hover:to-blue-200"
          >
            <Edit2 className="w-4 h-4 text-blue-900" />
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-red-200 to-red-100 flex items-center justify-center shadow-md active:shadow-inner transition-all hover:from-red-300 hover:to-red-200"
          >
            <Trash2 className="w-4 h-4 text-red-900" />
          </button>
        </div>
      </div>
    </ClayCard>
  );
}