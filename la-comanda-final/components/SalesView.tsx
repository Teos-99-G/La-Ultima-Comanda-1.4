
import React, { useState, useEffect } from 'react';
import { Plus, Minus, Search, ShoppingCart, Info } from 'lucide-react';
import { Menu, Dish, ThemeColor } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SalesViewProps {
  menus: Menu[];
  dishes: Dish[];
  sales: Record<string, number>;
  updateSale: (dishId: string, delta: number) => void;
  themeColor: ThemeColor;
}

const SalesView: React.FC<SalesViewProps> = ({ menus, dishes, sales, updateSale, themeColor }) => {
  const [activeTab, setActiveTab] = useState<string>(menus[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDescription, setShowDescription] = useState<Record<string, boolean>>({});

  const toggleDescription = (dishId: string) => {
    setShowDescription(prev => ({ ...prev, [dishId]: !prev[dishId] }));
  };

  // Sincronizar la pestaña activa cuando los menús cambian (importación)
  useEffect(() => {
    if (menus.length > 0) {
      // Si no hay pestaña activa o la que estaba ya no existe, ponemos la primera
      if (!activeTab || !menus.find(m => m.id === activeTab)) {
        setActiveTab(menus[0].id);
      }
    } else {
      setActiveTab('');
    }
  }, [menus]);

  const filteredDishes = dishes.filter(d => 
    (searchQuery ? d.name.toLowerCase().includes(searchQuery.toLowerCase()) : d.menuId === activeTab)
  );

  const totalValue = dishes.reduce((acc, dish) => {
    const qty = sales[dish.id] || 0;
    return acc + (dish.price * qty);
  }, 0);

  return (
    <div className="flex flex-col h-full relative">
      {/* Sticky Header for Search and Tabs */}
      <div className="sticky top-0 z-20 bg-slate-50 pb-2 -mt-4 pt-4 -mx-4 px-4 shadow-sm mb-4">
        {/* Search Bar */}
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

        {/* Menu Category Tabs */}
        {!searchQuery && (
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
            {menus.map(menu => {
              const isActive = activeTab === menu.id;
              const isSpecial = menu.isSpecial;
              
              let colorClasses = isActive 
                ? `bg-${themeColor}-600 text-white` 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200';
              
              if (isSpecial) {
                colorClasses = isActive 
                  ? 'bg-amber-500 text-white shadow-md' 
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200';
              }

              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveTab(menu.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${colorClasses}`}
                >
                  {menu.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Dish List */}
      <div className="grid grid-cols-1 gap-3 pb-4">
        {filteredDishes.map(dish => {
          const qty = sales[dish.id] || 0;
          const menu = menus.find(m => m.id === dish.menuId);
          const isSpecial = menu?.isSpecial;
          const isDescVisible = showDescription[dish.id];

          return (
            <div key={dish.id} className={`bg-white p-3 rounded-xl border shadow-sm flex flex-col gap-2 ${isSpecial ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{dish.name}</span>
                    {dish.description && (
                      <button 
                        onClick={() => toggleDescription(dish.id)}
                        className={`p-1 rounded-full transition-colors ${isDescVisible ? (isSpecial ? 'bg-amber-100 text-amber-600' : `bg-${themeColor}-100 text-${themeColor}-600`) : 'text-slate-300 hover:text-slate-400'}`}
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${isSpecial ? 'text-amber-600' : `text-${themeColor}-600`}`}>${dish.price.toLocaleString()}</span>
                </div>
                <div className={`flex items-center gap-3 p-1 rounded-lg ${isSpecial ? 'bg-amber-100/50' : 'bg-slate-50'}`}>
                  <button 
                    onClick={() => updateSale(dish.id, -1)}
                    className={`p-1.5 rounded-md transition-colors ${qty > 0 ? 'bg-white shadow-sm ' + (isSpecial ? 'text-amber-600' : `text-${themeColor}-600`) : 'text-slate-300 cursor-not-allowed'}`}
                    disabled={qty === 0}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className={`w-8 text-center font-bold ${qty > 0 ? (isSpecial ? 'text-amber-700' : `text-${themeColor}-700`) : 'text-slate-400'}`}>
                    {qty}
                  </span>
                  <button 
                    onClick={() => updateSale(dish.id, 1)}
                    className={`p-1.5 text-white rounded-md shadow-sm active:scale-95 transition-transform ${isSpecial ? 'bg-amber-500' : `bg-${themeColor}-600`}`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {isDescVisible && dish.description && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-slate-500 italic border-t border-slate-100 pt-2 leading-relaxed">
                      {dish.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        {filteredDishes.length === 0 && (
          <div className="text-center py-16 px-6">
            <div className={`w-16 h-16 bg-${themeColor}-50 text-${themeColor}-300 rounded-full flex items-center justify-center mx-auto mb-4`}>
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h3 className="text-slate-800 font-bold mb-2">
              {searchQuery ? 'No se encontraron resultados' : menus.length === 0 ? '¡Bienvenido!' : 'Categoría vacía'}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {searchQuery 
                ? `No pudimos encontrar "${searchQuery}". Intenta con otro nombre.`
                : menus.length === 0 
                  ? 'Tranquilo, tú encárgate de vender, que yo me encargo de las cuentas. Para comenzar, ve a la pestaña de AJUSTES y crea tus primeras categorías y platos.' 
                  : 'Aún no has agregado platos a esta categoría. Puedes hacerlo en la pestaña de AJUSTES.'}
            </p>
            {menus.length === 0 && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-left">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2">Pasos rápidos:</p>
                <ul className="text-xs text-indigo-800 space-y-2">
                  <li className="flex gap-2"><span>1.</span> <span>Ve a <b>AJUSTES</b></span></li>
                  <li className="flex gap-2"><span>2.</span> <span>Crea una <b>Categoría</b> (ej: Almuerzos)</span></li>
                  <li className="flex gap-2"><span>3.</span> <span>Agrega <b>Platos</b> con su precio</span></li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesView;
