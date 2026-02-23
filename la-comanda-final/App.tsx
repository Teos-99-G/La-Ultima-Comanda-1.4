
import React, { useState, useEffect } from 'react';
import { Settings, ShoppingCart, BarChart3, Palette } from 'lucide-react';
import { Menu, Dish, ViewType, ThemeColor } from './types';
import AdminView from './components/AdminView';
import SalesView from './components/SalesView';
import ReportView from './components/ReportView';

const THEMES: ThemeColor[] = ['indigo', 'emerald', 'rose', 'amber', 'slate', 'violet', 'cyan','blue', 'green', 'red', 'yellow', 'pink', 'purple', 'teal','orange', 'lime', 'fuchsia', 'sky', 'stone'];

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

  const resetSales = () => setSales({});

  const saveConfigToFile = () => {
    const config = { menus, dishes };
    const blob = new Blob([JSON.stringify(config)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `menu_jana_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadConfigFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const config = JSON.parse(content);
        
        if (config && Array.isArray(config.menus) && Array.isArray(config.dishes)) {
          setMenus(config.menus);
          setDishes(config.dishes);
          alert(`Menú cargado: ${config.menus.length} categorías y ${config.dishes.length} platos.`);
        } else {
          alert('El archivo no tiene el formato correcto.');
        }
      } catch {
        alert('Error al leer el archivo. Intenta con otro respaldo.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const cycleTheme = () => {
    const currentIndex = THEMES.indexOf(themeColor);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setThemeColor(THEMES[nextIndex]);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white shadow-2xl relative text-slate-900">

      {/* HEADER FIJO */}
      <header className={`fixed top-0 left-0 right-0 max-w-md mx-auto bg-${themeColor}-600 text-white p-4 shadow-md z-30 flex justify-between items-center transition-colors duration-500`}>
        
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
            title="Cambiar Color"
          >
            <Palette className="w-4 h-4" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowAuthor(!showAuthor)}
              className={`bg-${themeColor}-500 px-2 py-1 rounded text-[10px] font-bold shrink-0 active:scale-95 transition-transform`}
            >
              V 1.4
            </button>
            {showAuthor && (
              <div className="absolute right-0 top-full mt-2 bg-slate-800 text-white text-[10px] py-2 px-3 rounded shadow-xl whitespace-nowrap z-50 animate-in fade-in slide-in-from-top-1 border border-slate-700">
                By: Johan Mateo García Sánchez
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CONTENIDO CON ESPACIO PARA HEADER Y FOOTER */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-4 pt-20 pb-24 bg-slate-50">

        {activeView === 'admin' && (
          <AdminView 
            menus={menus} 
            setMenus={setMenus} 
            dishes={dishes} 
            setDishes={setDishes}
            onSaveConfig={saveConfigToFile}
            onLoadConfig={loadConfigFromFile}
            themeColor={themeColor}
          />
        )}

        {activeView === 'sales' && (
          <SalesView menus={menus} dishes={dishes} sales={sales} updateSale={updateSale} themeColor={themeColor} />
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

      </main>

      {/* MENU INFERIOR FIJO */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 flex justify-around p-2 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">

        <button onClick={() => setActiveView('admin')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeView === 'admin' ? `bg-${themeColor}-50 text-${themeColor}-600` : 'text-slate-400'}`}>
          <Settings className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-bold">AJUSTES</span>
        </button>

        <button onClick={() => setActiveView('sales')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeView === 'sales' ? `bg-${themeColor}-50 text-${themeColor}-600` : 'text-slate-400'}`}>
          <ShoppingCart className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-bold">VENTAS</span>
        </button>

        <button onClick={() => setActiveView('report')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeView === 'report' ? `bg-${themeColor}-50 text-${themeColor}-600` : 'text-slate-400'}`}>
          <BarChart3 className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-bold">CIERRE</span>
        </button>

      </nav>

    </div>
  );
};

export default App;
