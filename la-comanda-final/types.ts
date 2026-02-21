
export interface Dish {
  id: string;
  menuId: string;
  name: string;
  price: number;
}

export interface Menu {
  id: string;
  name: string;
  isSpecial?: boolean;
}

export interface Sale {
  dishId: string;
  quantity: number;
}

export interface SavedReport {
  id: string;
  date: string;
  totalMoney: number;
  totalQty: number;
  snapshot: {
    sales: Record<string, number>;
    dishes: Dish[];
    menus: Menu[];
  };
}

export type ViewType = 'admin' | 'sales' | 'report';

export type ThemeColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate' | 'violet' | 'cyan';
