import React, { useState, useEffect } from 'react';
import { Settings, ShoppingCart, BarChart3, Palette, Calculator } from 'lucide-react';
import { Menu, Dish, ViewType, ThemeColor } from './types';
import AdminView from './components/AdminView';
import SalesView from './components/SalesView';
import ReportView from './components/ReportView';
import CalculatorView from './components/CalculatorView';

const THEMES: ThemeColor[] = ['indigo', 'emerald', 'rose', 'amber', 'slate', 'violet', 'cyan'];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('sales');
  
  const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
    return (localStorage.getItem('resto_theme') as ThemeColor) || 'indigo';
  });

  const [appName, setAppName] = useState<string>(() => {
    return localStorage.getItem('resto_app_name') || '';
  });

  const [showAuthor, setShowAuthor] = useState(false);

  const [menus, setMenus] = useState<Menu[]>(() => {
    const saved = localStorage.getItem('resto_menus');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [dishes, setDishes] = useState<Dish[]>(() => {
    const saved = localStorage.getItem('resto_dishes');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [sales, setSales] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('resto_sales');
    try { return saved ? JSON.parse(saved) : {}; } catch { return {}; }
  });

  useEffect(() => { localStorage.setItem('resto_menus', JSON.stringify(menus)); }, [menus]);
  useEffect(() => { localStorage.setItem('resto_dishes', JSON.stringify(dishes)); }, [dishes]);
  useEffect(() => { localStorage.setItem('resto_sales', JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem('resto_app_name', appName); }, [appName]);
  useEffect(() => { localStorage.setItem('resto_theme', themeColor); }, [themeColor]);

  const updateSale = (dishId: string, delta: number) => {
    setSales(prev => {
      const current = prev[dishId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [dishId]: next };
    });
  };

  const resetSales = () => {
    setSales({});
  };

  const cycleTheme = () => {
    const currentIndex = THEMES.indexOf(themeColor);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setThemeColor(THEMES[nextIndex]);
  };

  return (
    <div className="flex flex-col h-dvh max-w-md mx-auto bg-white shadow-2xl">

      {/* HEADER FIJO */}
      <header className={`sticky top-0 z-30 bg-${themeColor}-600 text-white p-4 shadow-md flex justify-between items-center`}>
        <div className="flex items-center gap-2 flex-1">
          <input 
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="text-xl font-bold uppercase tracking-tight bg-transparent border-none outline-none focus:ring-2 focus:ring-white/50 rounded px-1 w-full max-w-[200px]"
            placeholder="NOMBRE DEL LOCAL"
          />
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={cycleTheme}
            className={`p-2 rounded-full bg-${themeColor}-500 hover:bg-${themeColor}-400 transition-colors`}
          >
            <Palette className="w-4 h-4" />
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowAuthor(!showAuthor)}
              className={`bg-${themeColor}-500 px-2 py-1 rounded text-[10px] font-bold`}
            >
              V 1.4
            </button>

            {showAuthor && (
              <div className="absolute right-0 top-full mt-2 bg-slate-800 text-white text-[10px] py-2 px-3 rounded shadow-xl z-50">
                By: Johan Mateo García Sánchez
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CONTENIDO SCROLL */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 bg-slate-50">
        {activeView === 'admin' && (
          <AdminView 
            menus={menus} 
            setMenus={setMenus} 
            dishes={dishes} 
            setDishes={setDishes}
            themeColor={themeColor}
          />
        )}

        {activeView === 'sales' && (
          <SalesView 
            menus={menus} 
            dishes={dishes} 
            sales={sales} 
            updateSale={updateSale} 
            themeColor={themeColor} 
          />
        )}

        {activeView === 'report' && (
          <ReportView 
            appName={appName}
            menus={menus} 
            dishes={dishes} 
            sales={sales}
            onResetSales={resetSales}
            themeColor={themeColor}
          />
        )}

        {activeView === 'calculator' && (
          <CalculatorView 
            menus={menus} 
            dishes={dishes} 
            themeColor={themeColor} 
          />
        )}
      </main>

      {/* NAV FIJO ABAJO */}
      <nav className="sticky bottom-0 z-30 bg-white border-t border-slate-200 flex justify-around p-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        
        <button 
          onClick={() => setActiveView('admin')} 
          className={`flex flex-col items-center p-2 rounded-xl ${
            activeView === 'admin'
              ? `bg-${themeColor}-50 text-${themeColor}-600`
              : 'text-slate-400'
          }`}
        >
          <Settings className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-bold">AJUSTES</span>
        </button>

        <button 
          onClick={() => setActiveView('sales')} 
          className={`flex flex-col items-center p-2 rounded-xl ${
            activeView === 'sales'
              ? `bg-${themeColor}-50 text-${themeColor}-600`
              : 'text-slate-400'
          }`}
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-bold">VENTAS</span>
        </button>

        <button 
          onClick={() => setActiveView('calculator')} 
          className={`flex flex-col items-center p-2 rounded-xl ${
            activeView === 'calculator'
              ? `bg-${themeColor}-50 text-${themeColor}-600`
              : 'text-slate-400'
          }`}
        >
          <Calculator className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-bold">CALC</span>
        </button>

        <button 
          onClick={() => setActiveView('report')} 
          className={`flex flex-col items-center p-2 rounded-xl ${
            activeView === 'report'
              ? `bg-${themeColor}-50 text-${themeColor}-600`
              : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-bold">CIERRE</span>
        </button>

      </nav>

    </div>
  );
};

export default App;
