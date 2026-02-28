
import React, { useState, useMemo } from 'react';
import { Calculator, Plus, Minus, Trash2, X, Banknote, ShoppingBag, ReceiptText, Info } from 'lucide-react';
import { Menu, Dish, ThemeColor } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CalculatorViewProps {
  menus: Menu[];
  dishes: Dish[];
  themeColor: ThemeColor;
}

const CalculatorView: React.FC<CalculatorViewProps> = ({ menus, dishes, themeColor }) => {
  const [calcItems, setCalcItems] = useState<Record<string, number>>({});
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
    d.menuId === activeTab
  ), [dishes, activeTab]);

  const total = useMemo(() => Object.entries(calcItems).reduce((acc, [dishId, qty]) => {
    const dish = dishes.find(d => d.id === dishId);
    if (!dish) return acc;
    return acc + (dish.price * (qty as number));
  }, 0), [calcItems, dishes]);

  const change = receivedAmount ? parseFloat(receivedAmount) - total : 0;

  const totalItems = Object.values(calcItems).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="flex flex-col h-full relative">
      {/* Header Section - More Modern */}
      <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md pb-4 -mt-4 pt-4 -mx-4 px-4 mb-4 border-b border-slate-200/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-${themeColor}-100 rounded-xl`}>
              <Calculator className={`w-5 h-5 text-${themeColor}-600`} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 leading-tight">Calculadora</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cuenta Rápida</p>
            </div>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={clearCalc}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-100 transition-colors hover:bg-red-100"
          >
            <Trash2 className="w-3 h-3" /> Borrar Todo
          </motion.button>
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-2 py-1">
          {menus.map(menu => (
              <motion.button
                key={menu.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(menu.id)}
                className={`px-5 py-2.5 rounded-2xl whitespace-nowrap text-xs font-bold transition-all border ${
                  activeTab === menu.id 
                    ? (menu.isSpecial ? 'bg-amber-500 border-amber-600 text-white shadow-lg shadow-amber-200' : `bg-${themeColor}-600 border-${themeColor}-700 text-white shadow-lg shadow-${themeColor}-200`) 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {menu.name}
              </motion.button>
            ))}
          </div>
        </div>

      {/* Dish Selection Grid - 2 Columns for better POS feel */}
      <div className="grid grid-cols-2 gap-3 pb-96 mt-2">
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
              className={`relative group p-2.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[50px] ${
                qty > 0 
                  ? (isSpecial ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-500/20' : `bg-${themeColor}-50 border-${themeColor}-200 ring-2 ring-${themeColor}-500/20`) 
                  : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col mb-1">
                <div className="flex justify-between items-start gap-1">
                  <span className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-tight mb-0.5 flex-1">{dish.name}</span>
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
                  className={`w-8 h-8 flex items-center justify-center rounded-xl text-white shadow-md active:scale-95 ${
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

      {/* Floating Modern Checkout Panel - Fixed and centered properly */}
      <AnimatePresence>
        {total > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-0 right-0 z-50 px-4 pointer-events-none flex justify-center"
          >
            <div className="w-full max-w-md pointer-events-auto space-y-3">
              {/* Change Calculator Card - Refined */}
              <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-slate-200 p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 bg-${themeColor}-50 rounded-lg`}>
                    <Banknote className={`w-4 h-4 text-${themeColor}-600`} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">LAS VUELTAS</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setReceivedAmount(total.toString())}
                    className={`text-[9px] font-black px-2.5 py-1.5 rounded-xl border transition-all ${
                      receivedAmount === total.toString() 
                        ? `bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200` 
                        : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    Exacto
                  </motion.button>
                  {[10000, 20000, 50000, 100000].map(val => (
                    <motion.button 
                      key={val}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setReceivedAmount(val.toString())}
                      className={`text-[9px] font-black px-2.5 py-1.5 rounded-xl border transition-all ${
                        receivedAmount === val.toString() 
                          ? `bg-${themeColor}-600 border-${themeColor}-600 text-white shadow-lg shadow-${themeColor}-200` 
                          : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      ${(val/1000)}k
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block ml-1">Recibido</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                    <input 
                      type="number" 
                      value={receivedAmount}
                      onChange={(e) => setReceivedAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-100/50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl p-3.5 pl-7 text-base font-black text-slate-800 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="bg-slate-50/50 rounded-2xl p-3.5 flex flex-col justify-center border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Vueltas</p>
                  <p className={`text-xl font-black tracking-tight ${change < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {change >= 0 ? `$${change.toLocaleString()}` : 'Falta dinero'}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Checkout Bar - Premium Look */}
            <div className={`bg-${themeColor}-600 bg-gradient-to-r from-${themeColor}-600 to-${themeColor}-700 text-white p-5 rounded-[2.5rem] shadow-2xl flex items-center justify-between border border-white/20 relative overflow-hidden`}>
              {/* Decorative Background Elements */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-black/10 rounded-full blur-2xl"></div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
                  <ReceiptText className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Total a Cobrar</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-black">{totalItems} ítems</span>
                  </div>
                  <span className="text-3xl font-black tracking-tighter">${total.toLocaleString()}</span>
                </div>
              </div>
              
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={clearCalc}
                className="bg-white/20 hover:bg-white/30 p-3 rounded-2xl transition-colors backdrop-blur-md border border-white/10 relative z-10"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State - Friendly */}
      {filteredDishes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 px-10 text-center mt-4">
          <div className={`w-20 h-20 bg-${themeColor}-50 rounded-3xl flex items-center justify-center mb-6`}>
            <ShoppingBag className={`w-10 h-10 text-${themeColor}-300`} />
          </div>
          <h3 className="text-slate-800 font-black text-lg mb-2">¿Qué desea el cliente?</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Selecciona los platos para calcular la cuenta rápidamente. No te preocupes, esto no afectará tus ventas del día.
          </p>
        </div>
      )}
    </div>
  );
};

export default CalculatorView;
