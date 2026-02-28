
import React, { useState } from 'react';
import { Download, ShoppingBag, DollarSign, Trash2, X, Check, Award } from 'lucide-react';
import { Menu, Dish, ThemeColor } from '../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ReportViewProps {
  appName: string;
  menus: Menu[];
  dishes: Dish[];
  sales: Record<string, number>;
  onResetSales: () => void;
  themeColor: ThemeColor;
  hasStoragePermission: boolean;
  onRequestPermission: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ appName, menus, dishes, sales, onResetSales, themeColor, hasStoragePermission, onRequestPermission }) => {
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  const getGrandTotal = () => {
    return dishes.reduce((sum, dish) => sum + (dish.price * (sales[dish.id] || 0)), 0);
  };

  const totalUnitsAll = Object.values(sales).reduce((a: number, b: number) => a + b, 0);
  
  const totalUnitsRegular = dishes.reduce((sum, dish) => {
    const qty = sales[dish.id] || 0;
    if (qty > 0) {
      const menu = menus.find(m => m.id === dish.menuId);
      if (!menu?.isSpecial) {
        return sum + qty;
      }
    }
    return sum;
  }, 0);

  const totalMoneyRegular = dishes.reduce((sum, dish) => {
    const qty = sales[dish.id] || 0;
    if (qty > 0) {
      const menu = menus.find(m => m.id === dish.menuId);
      if (!menu?.isSpecial) {
        return sum + (dish.price * qty);
      }
    }
    return sum;
  }, 0);

  const handleReset = () => {
    onResetSales();
    setIsConfirmingReset(false);
  };

  const topDishes = dishes
    .filter(d => (sales[d.id] || 0) > 0)
    .sort((a, b) => (sales[b.id] || 0) - (sales[a.id] || 0))
    .slice(0, 3);

  const exportPDF = () => {
    if (!hasStoragePermission) {
      onRequestPermission();
      return;
    }
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleString();
    const totalQty = totalUnitsAll;
    const totalMoney = getGrandTotal();

    // Theme colors for PDF
    const themeRGB: Record<ThemeColor, [number, number, number]> = {
      indigo: [79, 70, 229],
      emerald: [16, 185, 129],
      rose: [225, 29, 72],
      amber: [245, 158, 11],
      slate: [71, 85, 105],
      violet: [139, 92, 246],
      cyan: [6, 182, 212]
    };
    const primaryRGB = themeRGB[themeColor] || [79, 70, 229];

    doc.setFontSize(20);
    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.text('INFORME DE VENTAS', 14, 22);
    doc.setTextColor(31, 41, 55);
    doc.text(appName.toUpperCase(), 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Fecha: ${dateStr}`, 14, 40);
    doc.text(`Unidades Totales: ${totalQty}`, 14, 46);
    doc.text(`Venta Total: $${totalMoney.toLocaleString()}`, 14, 52);
    doc.text(`Total Almuerzos: ${totalUnitsRegular}`, 14, 58);
    doc.text(`Venta Almuerzos: $${totalMoneyRegular.toLocaleString()}`, 14, 64);

    const tableRows: any[] = [];
    menus.forEach(menu => {
      const menuDishes = dishes.filter(d => d.menuId === menu.id && (sales[d.id] || 0) > 0);
      if (menuDishes.length > 0) {
        const isSpecial = menu.isSpecial;
        tableRows.push([{ 
          content: menu.name.toUpperCase(), 
          colSpan: 4, 
          styles: { 
            fillColor: isSpecial ? [254, 243, 199] : [241, 245, 249], 
            fontStyle: 'bold', 
            textColor: isSpecial ? [146, 64, 14] : [51, 65, 85] 
          } 
        }]);
        
        let menuSubtotalMoney = 0;
        let menuSubtotalQty = 0;

        menuDishes.forEach(dish => {
          const qty = sales[dish.id] || 0;
          const sub = dish.price * qty;
          menuSubtotalMoney += sub;
          menuSubtotalQty += qty;
          tableRows.push([
            dish.name, 
            `$${dish.price.toLocaleString()}`, 
            qty, 
            `$${sub.toLocaleString()}`
          ]);
        });

        tableRows.push([{ 
          content: `Subtotal ${menu.name}: ${menuSubtotalQty} uds. | $${menuSubtotalMoney.toLocaleString()}`, 
          colSpan: 4, 
          styles: { 
            halign: 'right', 
            fontStyle: 'bold', 
            textColor: isSpecial ? [146, 64, 14] : primaryRGB, 
            fillColor: isSpecial ? [255, 251, 235] : [248, 250, 252] 
          } 
        }]);
      }
    });

    (doc as any).autoTable({
      startY: 70,
      head: [['Plato', 'Precio Unit.', 'Cant.', 'Subtotal']],
      body: tableRows,
      foot: [
        ['', '', 'CANTIDAD TOTAL:', totalQty.toString()],
        ['', '', 'VALOR TOTAL:', `$${totalMoney.toLocaleString()}`]
      ],
      showFoot: 'lastPage',
      theme: 'striped',
      headStyles: { fillColor: primaryRGB },
      footStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255], fontStyle: 'bold' }
    });

       const safeAppName = appName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'reporte';
    const dateFileName = new Date().toISOString().split('T')[0];
    doc.save(`reporte-${safeAppName}-${dateFileName}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className={`bg-gradient-to-br from-${themeColor}-600 to-${themeColor}-800 p-4 rounded-2xl text-white shadow-lg`}>
          <DollarSign className="w-5 h-5 mb-2 bg-white/20 rounded p-1" />
          <p className={`text-${themeColor}-200 text-[10px] uppercase font-bold tracking-widest`}>Total Dinero</p>
          <p className="text-2xl font-bold">${getGrandTotal().toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-4 rounded-2xl text-white shadow-lg">
          <ShoppingBag className="w-5 h-5 mb-2 bg-white/20 rounded p-1" />
          <p className="text-emerald-100 text-[10px] uppercase font-bold tracking-widest">Total ALMUERZOS</p>
          <p className="text-2xl font-bold">{totalUnitsRegular}</p>
        </div>
      </div>

      <div className="space-y-3">
        <button 
          onClick={() => exportPDF()}
         className={`w-full flex items-center justify-center gap-2 bg-${themeColor}-600 text-white p-4 rounded-xl font-bold shadow-md active:scale-95 transition-transform`}
        >
          <Download className="w-5 h-5" /> Exportar Reporte PDF
        </button>

        {isConfirmingReset ? (
          <div className="flex gap-2">
            <button 
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white p-4 rounded-xl font-bold shadow-md active:scale-95"
            >
              <Check className="w-5 h-5" /> Confirmar Limpieza
            </button>
            <button 
              onClick={() => setIsConfirmingReset(false)}
              className="bg-slate-200 text-slate-600 p-4 rounded-xl active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsConfirmingReset(true)}
            className="w-full flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-500 p-4 rounded-xl font-bold active:bg-slate-100 transition-colors disabled:opacity-30"
            disabled={totalUnitsAll === 0}
          >
            <Trash2 className="w-5 h-5" /> Limpiar Ventas
          </button>
        )}
      </div>

      <div className="pt-2">
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Top 3 Más Vendidos</h3>
        {topDishes.length === 0 ? (
          <div className="text-center py-4 text-slate-300 text-xs italic">Sin datos suficientes</div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {topDishes.map((dish, index) => {
              const menu = menus.find(m => m.id === dish.menuId);
              const isSpecial = menu?.isSpecial;
              return (
                <div key={dish.id} className={`flex items-center justify-between p-3 rounded-xl border ${isSpecial ? 'bg-amber-50 border-amber-100' : 'bg-white border-slate-100'} shadow-sm`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                      index === 0 ? 'bg-yellow-400 text-white' : 
                      index === 1 ? 'bg-slate-300 text-white' : 
                      'bg-orange-300 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-700 text-sm">{dish.name}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">{menu?.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-${themeColor}-600 font-bold text-sm`}>{sales[dish.id]} uds.</div>
                    <div className="text-[10px] text-slate-400">${(dish.price * sales[dish.id]).toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-2">
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Ventas Actuales</h3>
        {totalUnitsAll === 0 ? (
             <div className="text-center py-10 text-slate-300 text-xs italic">No hay ventas registradas</div>
        ) : (
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
                <thead>
                <tr className="bg-slate-50 text-slate-500">
                    <th className="text-left p-3 font-semibold text-xs">Producto</th>
                    <th className="text-center p-3 font-semibold text-xs">Cant.</th>
                    <th className="text-right p-3 font-semibold text-xs">Total</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {dishes.filter(d => (sales[d.id] || 0) > 0).map(dish => {
                    const menu = menus.find(m => m.id === dish.menuId);
                    const isSpecial = menu?.isSpecial;
                    return (
                        <tr key={dish.id} className={isSpecial ? 'bg-amber-50/50' : ''}>
                        <td className="p-3">
                            <div className="font-medium text-slate-700">{dish.name}</div>
                            {isSpecial && <span className="text-[8px] text-amber-600 font-bold uppercase">Otras Ventas</span>}
                        </td>
                        <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${isSpecial ? 'bg-amber-200 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{sales[dish.id]}</span>
                        </td>
                        <td className={`p-3 text-right font-bold ${isSpecial ? 'text-amber-600' : `text-${themeColor}-600`}`}>
                            ${(dish.price * sales[dish.id]).toLocaleString()}
                        </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default ReportView;
