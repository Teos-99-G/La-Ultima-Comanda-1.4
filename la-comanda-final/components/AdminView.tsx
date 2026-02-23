
import React, { useState } from 'react';
import { Plus, Trash2, Edit2, ChevronDown, ChevronRight, Check, Download, Upload, FileJson, X } from 'lucide-react';
import { Menu, Dish, ThemeColor } from '../types';

interface AdminViewProps {
  menus: Menu[];
  setMenus: React.Dispatch<React.SetStateAction<Menu[]>>;
  dishes: Dish[];
  setDishes: React.Dispatch<React.SetStateAction<Dish[]>>;
  onSaveConfig: () => void;
  onLoadConfig: (e: React.ChangeEvent<HTMLInputElement>) => void;
  themeColor: ThemeColor;
  onRequestLoad: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

const AdminView: React.FC<AdminViewProps> = ({ menus, setMenus, dishes, setDishes, onSaveConfig, onLoadConfig, themeColor, onRequestLoad }) => {
  const [newMenuName, setNewMenuName] = useState('');
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newDish, setNewDish] = useState({ name: '', price: '' });

  const addMenu = () => {
    if (!newMenuName.trim()) return;
    const menu: Menu = { id: generateId(), name: newMenuName };
    setMenus(prev => [...prev, menu]);
    setNewMenuName('');
  };

  const addSpecialMenu = () => {
    const menu: Menu = { id: generateId(), name: 'OTRAS VENTAS', isSpecial: true };
    setMenus(prev => [...prev, menu]);
  };

  const deleteMenu = (id: string) => {
    setMenus(prev => prev.filter(m => m.id !== id));
    setDishes(prev => prev.filter(d => d.menuId !== id));
    if (expandedMenuId === id) setExpandedMenuId(null);
    setConfirmDeleteId(null);
  };

  const updateMenuName = (id: string, newName: string) => {
    if (!newName.trim()) return;
    setMenus(prev => prev.map(m => m.id === id ? { ...m, name: newName } : m));
    setEditingMenuId(null);
  };

  const addDish = (menuId: string) => {
    if (!newDish.name.trim() || !newDish.price) return;
    const dish: Dish = {
      id: generateId(),
      menuId,
      name: newDish.name,
      price: parseFloat(newDish.price)
    };
    setDishes(prev => [...prev, dish]);
    setNewDish({ name: '', price: '' });
  };

  const deleteDish = (id: string) => {
    setDishes(prev => prev.filter(d => d.id !== id));
    setConfirmDeleteId(null);
  };

  const updateDish = (id: string, updates: Partial<Dish>) => {
    setDishes(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    setEditingDishId(null);
  };

  return (
    <div className="space-y-6">
      {/* Respaldo de Menú Section */}
      <section className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
        <div className="flex items-center gap-2 mb-3 text-white">
          <FileJson className={`w-5 h-5 text-${themeColor}-400`} />
          <h2 className="text-sm font-bold uppercase tracking-wider">Cargar / Guardar Menú</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onSaveConfig}
            className={`flex items-center justify-center gap-2 bg-${themeColor}-600 text-white py-4 rounded-xl text-xs font-bold active:bg-${themeColor}-700 shadow-md`}
          >
            <Download className="w-4 h-4" /> Guardar
          </button>
         <button 
            onClick={onRequestLoad}
            className="flex items-center justify-center gap-2 bg-slate-600 text-white py-4 rounded-xl text-xs font-bold cursor-pointer active:bg-slate-500 shadow-md"
          >
            <Upload className="w-4 h-4" /> Cargar
            <input 
              id="load-file-input"
              type="file" 
              accept=".txt" 
              onChange={onLoadConfig} 
              className="hidden" 
            />
          </button>
        </div>
      </section>

      {/* Add Menu Section */}
      <section className={`bg-white p-4 rounded-xl border-2 border-dashed border-${themeColor}-200`}>
        <h2 className={`text-xs font-bold text-${themeColor}-600 uppercase tracking-wider mb-2`}>Nueva Categoría</h2>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Ej: Bebidas, Postres..."
            className="flex-1 p-3 bg-slate-50 rounded-lg border border-slate-200 outline-none text-sm"
            value={newMenuName}
            onChange={(e) => setNewMenuName(e.target.value)}
          />
          <button onClick={addMenu} className={`bg-${themeColor}-600 text-white p-4 rounded-xl active:scale-95 shadow-lg`}>
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Add Special Menu Section */}
      <section className="bg-amber-50 p-4 rounded-xl border-2 border-dashed border-amber-200">
        <h2 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Otras Ventas</h2>
        <button 
          onClick={addSpecialMenu} 
          className="w-full bg-amber-500 text-white py-3 rounded-xl active:scale-95 shadow-lg font-bold text-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> AGREGAR SECCIÓN OTRAS VENTAS
        </button>
      </section>

      {/* Menu List */}
      <div className="space-y-4 pb-10">
        {menus.map(menu => (
          <div key={menu.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${menu.isSpecial ? 'border-amber-200' : 'border-slate-200'}`}>
            <div className={`flex items-stretch border-b h-16 ${menu.isSpecial ? 'border-amber-100 bg-amber-50/30' : 'border-slate-100'}`}>
              <div 
                className="flex-1 flex items-center gap-3 px-4 active:bg-slate-50 cursor-pointer"
                onClick={() => setExpandedMenuId(expandedMenuId === menu.id ? null : menu.id)}
              >
                <div className={menu.isSpecial ? 'text-amber-400' : 'text-slate-400'}>
                  {expandedMenuId === menu.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
                {editingMenuId === menu.id ? (
                  <input 
                    autoFocus 
                    className={`flex-1 p-1 text-sm border-b-2 outline-none font-bold ${menu.isSpecial ? 'border-amber-500' : `border-${themeColor}-500`}`} 
                    defaultValue={menu.name} 
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => updateMenuName(menu.id, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && updateMenuName(menu.id, e.currentTarget.value)}
                  />
                ) : (
                  <span className={`font-bold text-sm uppercase tracking-tight ${menu.isSpecial ? 'text-amber-700' : 'text-slate-800'}`}>
                    {menu.name} {menu.isSpecial && <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded ml-2">ESPECIAL</span>}
                  </span>
                )}
              </div>
              
              <div className="flex items-center px-2 gap-1">
                {confirmDeleteId === menu.id ? (
                  <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg">
                    <button 
                      onClick={() => deleteMenu(menu.id)}
                      className="bg-red-600 text-white text-[10px] px-3 py-2 rounded-md font-bold uppercase"
                    >
                      Borrar
                    </button>
                    <button 
                      onClick={() => setConfirmDeleteId(null)}
                      className="p-2 text-slate-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => setEditingMenuId(menu.id)}
                      className={`p-3 text-slate-400 active:text-${themeColor}-600 active:bg-${themeColor}-50 rounded-xl`}
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setConfirmDeleteId(menu.id)}
                      className="p-3 text-slate-400 active:text-red-600 active:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {expandedMenuId === menu.id && (
              <div className="p-4 space-y-4 bg-white">
                <div className={`${menu.isSpecial ? 'bg-amber-50 border-amber-100' : `bg-${themeColor}-50 border-${themeColor}-100`} p-4 rounded-xl border`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${menu.isSpecial ? 'text-amber-400' : `text-${themeColor}-400`}`}>Nuevo Plato</p>
                  <div className="grid grid-cols-4 gap-2">
                    <input type="text" placeholder="Nombre" className="col-span-2 p-3 text-sm rounded-lg border border-white" value={newDish.name} onChange={(e) => setNewDish({ ...newDish, name: e.target.value })} />
                    <input type="number" placeholder="$" className="col-span-1 p-3 text-sm rounded-lg border border-white font-bold" value={newDish.price} onChange={(e) => setNewDish({ ...newDish, price: e.target.value })} />
                    <button onClick={() => addDish(menu.id)} className={`col-span-1 text-white flex items-center justify-center rounded-xl active:scale-95 shadow-md ${menu.isSpecial ? 'bg-amber-500' : 'bg-emerald-500'}`}><Plus className="w-6 h-6" /></button>
                  </div>
                </div>

                <ul className="divide-y divide-slate-100">
                  {dishes.filter(d => d.menuId === menu.id).map(dish => (
                    <li key={dish.id} className="py-4 flex items-center justify-between">
                      {editingDishId === dish.id ? (
                        <div className="flex gap-2 flex-1 items-center">
                          <input className={`flex-1 p-2 text-sm border rounded-lg outline-none ${menu.isSpecial ? 'border-amber-500' : `border-${themeColor}-500`}`} defaultValue={dish.name} id={`edit-name-${dish.id}`} />
                          <input className={`w-20 p-2 text-sm border rounded-lg outline-none font-bold ${menu.isSpecial ? 'border-amber-500' : `border-${themeColor}-500`}`} type="number" defaultValue={dish.price} id={`edit-price-${dish.id}`} />
                          <button onClick={() => {
                              const name = (document.getElementById(`edit-name-${dish.id}`) as HTMLInputElement).value;
                              const price = parseFloat((document.getElementById(`edit-price-${dish.id}`) as HTMLInputElement).value);
                              updateDish(dish.id, { name, price });
                          }} className={`p-3 text-white rounded-xl ${menu.isSpecial ? 'bg-amber-500' : 'bg-emerald-500'}`}><Check className="w-5 h-5" /></button>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800">{dish.name}</span>
                            <span className={`text-xs font-bold tracking-tight ${menu.isSpecial ? 'text-amber-600' : `text-${themeColor}-600`}`}>${dish.price.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => setEditingDishId(dish.id)} className={`p-3 text-slate-300 active:text-${themeColor}-600 active:bg-${themeColor}-50 rounded-xl`}><Edit2 className="w-4 h-4" /></button>
                            {confirmDeleteId === dish.id ? (
                               <button 
                                 onClick={() => deleteDish(dish.id)}
                                 className="bg-red-600 text-white text-[10px] px-2 py-2 rounded-md font-bold uppercase"
                               >
                                 Confirmar
                               </button>
                            ) : (
                               <button onClick={() => setConfirmDeleteId(dish.id)} className="p-3 text-slate-300 active:text-red-500 active:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                            )}
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                  {dishes.filter(d => d.menuId === menu.id).length === 0 && (
                    <p className="text-center py-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Categoría vacía</p>
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminView;
