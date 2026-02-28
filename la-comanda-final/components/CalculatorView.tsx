import React, { useState, useMemo } from 'react';
import { Calculator, Plus, Minus, Search, Trash2, X, Banknote, ShoppingBag, ReceiptText, Info } from 'lucide-react';
import { Menu, Dish, ThemeColor } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CalculatorViewProps {
  menus: Menu[];
  dishes: Dish[];
  themeColor: ThemeColor;
}

const CalculatorView: React.FC<CalculatorViewProps> = ({ menus, dishes, themeColor }) => {
  const [calcItems, setCalcItems] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>(menus[0]?.id || '');
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [showDescription, setShowDescription] = useState<Record<string, boolean>>({});

  const toggleDescription = (dishId: string) => {
    setShowDescription(prev => ({ ...prev, [dishId]: !prev[dishId] }));
  };

  const updateCalc = (dishId: string, delta: number) => {
    setCalcItems(prev => {
      const current = prev[dishId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [dishId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [dishId]: next };
    });
  };

  const clearCalc = () => {
    setCalcItems({});
    setReceivedAmount('');
  };

  const filteredDishes = useMemo(() => dishes.filter(d => 
    (searchQuery ? d.name.toLowerCase().includes(searchQuery.toLowerCase()) : d.menuId === activeTab)
  ), [dishes, searchQuery, activeTab]);

  const total = useMemo(() => Object.entries(calcItems).reduce((acc, [dishId, qty]) => {
    const dish = dishes.find(d => d.id === dishId);
    if (!dish) return acc;
    return acc + (dish.price * (qty as number));
  }, 0), [calcItems, dishes]);

  const change = receivedAmount ? parseFloat(receivedAmount) - total : 0;
  const totalItems = Object.values(calcItems).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="flex flex-col h-full relative">
      {/* Header Section */}
      <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md pb-4 -mt-4 pt-4 -mx-4 px-4 mb-4 border-b border-slate-200/50">
        {/* ... header sin cambios ... */}
      </div>

      {/* Dish Selection Grid - Compact */}
      <div className="grid grid-cols-2 gap-2 pb-96">
        {filteredDishes.map(dish => {
          const qty = calcItems[dish.id] || 0;
          const menu = menus.find(m => m.id === dish.menuId);
          const isSpecial = menu?.isSpecial;
          const isDescVisible = showDescription[dish.id];

          return (
            <motion.div 
              key={dish.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative group p-1.5 rounded-xl border transition-all duration-300 flex flex-col justify-between min-h-[65px] ${
                qty > 0 
                  ? (isSpecial ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-500/20' : `bg-${themeColor}-50 border-${themeColor}-200 ring-2 ring-${themeColor}-500/20`) 
                  : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col mb-1">
                <div className="flex justify-between items-start gap-1">
                  <span className="text-[12px] font-bold text-slate-800 leading-tight mb-0.5 flex-1">{dish.name}</span>
                  {dish.description && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDescription(dish.id);
                      }}
                      className={`p-1 rounded-full transition-colors ${isDescVisible ? (isSpecial ? 'bg-amber-100 text-amber-600' : `bg-${themeColor}-100 text-${themeColor}-600`) : 'text-slate-300 hover:text-slate-400'}`}
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <span className={`text-xs font-black ${isSpecial ? 'text-amber-600' : `text-${themeColor}-600`}`}>
                  ${dish.price.toLocaleString()}
                </span>
                
                <AnimatePresence>
                  {isDescVisible && dish.description && (
                    <motion.p 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="text-[9px] text-slate-500 mt-1 leading-tight italic overflow-hidden"
                    >
                      {dish.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1">
                  <AnimatePresence>
                    {qty > 0 && (
                      <motion.button 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        onClick={() => updateCalc(dish.id, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 shadow-sm active:scale-90"
                      >
                        <Minus className="w-3 h-3" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                  
                  <AnimatePresence>
                    {qty > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-4 text-center text-[10px] font-black text-slate-700"
                      >
                        {qty}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updateCalc(dish.id, 1)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-white shadow-md active:scale-95 ${
                    isSpecial ? 'bg-amber-500 shadow-amber-200' : `bg-${themeColor}-600 shadow-${themeColor}-200`
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>

              {qty > 0 && (
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg ${isSpecial ? 'bg-amber-600' : `bg-${themeColor}-600`}`}>
                  {qty}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ... resto del código sin cambios ... */}
    </div>
  );
};

export default CalculatorView;
