
import React, { useState } from 'react';
import { Calculator, Plus, Minus, Search, Trash2, X, Banknote } from 'lucide-react';
import { Menu, Dish, ThemeColor } from '../types';

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

  const filteredDishes = dishes.filter(d => 
    (searchQuery ? d.name.toLowerCase().includes(searchQuery.toLowerCase()) : d.menuId === activeTab)
  );

  const total = Object.entries(calcItems).reduce((acc, [dishId, qty]) => {
    const dish = dishes.find(d => d.id === dishId);
    if (!dish) return acc;
    return acc + (dish.price * (qty as number));
  }, 0);

  const change = receivedAmount ? parseFloat(receivedAmount) - total : 0;

  return (
    <div className="flex flex-col h-full relative">
      {/* Header Section */}
      <div className="sticky top-0 z-20 bg-slate-50 pb-2 -mt-4 pt-4 -mx-4 px-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calculator className={`w-5 h-5 text-${themeColor}-600`} />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Calculadora de Cuenta</h2>
          </div>
          <button 
            onClick={clearCalc}
            className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1 active:scale-95"
          >
            <Trash2 className="w-3 h-3" /> Limpiar
          </button>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar plato..."
            className={`w-full pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-${themeColor}-500`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {!searchQuery && (
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
            {menus.map(menu => (
              <button
                key={menu.id}
                onClick={() => setActiveTab(menu.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                  activeTab === menu.id 
                    ? (menu.isSpecial ? 'bg-amber-500 text-white' : `bg-${themeColor}-600 text-white`) 
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {menu.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dish Selection List */}
      <div className="grid grid-cols-1 gap-2 pb-80">
        {filteredDishes.map(dish => {
          const qty = calcItems[dish.id] || 0;

          return (
            <div key={dish.id} className={`bg-white p-3 rounded-xl border flex items-center justify-between ${qty > 0 ? `border-${themeColor}-200 bg-${themeColor}-50/10` : 'border-slate-100'}`}>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">{dish.name}</span>
                <span className={`text-xs font-bold text-${themeColor}-600`}>
                  ${dish.price.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {qty > 0 && (
                  <button 
                    onClick={() => updateCalc(dish.id, -1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 active:scale-90"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
                {qty > 0 && <span className="w-4 text-center text-sm font-bold">{qty}</span>}
                <button 
                  onClick={() => updateCalc(dish.id, 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-white active:scale-90 bg-${themeColor}-600`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Total Bar */}
      {total > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md z-30 px-4 animate-in slide-in-from-bottom-4 duration-300 space-y-2">
          {/* Change Calculator Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Banknote className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Calculadora de Vueltas</span>
              </div>
              <div className="flex gap-1">
                {[10000, 20000, 50000, 100000].map(val => (
                  <button 
                    key={val}
                    onClick={() => setReceivedAmount(val.toString())}
                    className={`text-[8px] font-bold px-2 py-1 rounded-md border transition-colors ${receivedAmount === val.toString() ? `bg-${themeColor}-600 border-${themeColor}-600 text-white` : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                  >
                    ${(val/1000)}k
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-[8px] font-bold text-slate-400 uppercase mb-1 block">Recibido</label>
                <input 
                  type="number" 
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  placeholder="Ej: 100000"
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-slate-200 outline-none"
                />
              </div>
              <div className="flex-1 text-right">
                <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Vueltas</p>
                <p className={`text-xl font-black ${change < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  ${change >= 0 ? change.toLocaleString() : 'Falta dinero'}
                </p>
              </div>
            </div>
          </div>

          {/* Main Total Bar */}
          <div className={`bg-${themeColor}-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/20 backdrop-blur-md`}>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total a Cobrar</span>
              <span className="text-2xl font-black">${total.toLocaleString()}</span>
            </div>
            <button 
              onClick={clearCalc}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculatorView;
