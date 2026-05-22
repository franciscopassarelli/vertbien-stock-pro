import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

export type Unit = "unidad" | "kg" | "gramo" | "litro" | "ml";

export const UNITS: Unit[] = ["unidad", "kg", "gramo", "litro", "ml"];
export const UNIT_LABELS: Record<Unit, string> = {
  unidad: "Unidad",
  kg: "Kilogramo",
  gramo: "Gramo",
  litro: "Litro",
  ml: "Mililitro",
};

export interface Product {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  unidad: Unit;
  stock: number;
  url_imagen: string;
  stockBajo: number;
  stockCritico: number;
}

export interface SaleItem {
  productId: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface Sale {
  id: string;
  fecha: string;
  items: SaleItem[];
  vendedor: string;
  metodoPago: PaymentMethod;
  total: number;
}

export type PaymentMethod =
  | "Efectivo"
  | "Transferencia"
  | "Débito"
  | "Crédito"
  | "QR"
  | "Mercado Pago";

export const PAYMENT_METHODS: PaymentMethod[] = [
  "Efectivo",
  "Transferencia",
  "Débito",
  "Crédito",
  "QR",
  "Mercado Pago",
];

export type StockState = "ok" | "low" | "critical";
export function getStockState(p: Product): StockState {
  if (p.stock <= p.stockCritico) return "critical";
  if (p.stock <= p.stockBajo) return "low";
  return "ok";
}

interface StoreState {
  products: Product[];
  categories: string[];
  sales: Sale[];
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Omit<Product, "id">) => void;
  deleteProduct: (id: string) => void;
  addCategory: (name: string) => void;
  deleteCategory: (name: string) => { ok: boolean; reason?: string };
  addSale: (s: Omit<Sale, "id" | "fecha">) => void;
}

const StoreCtx = createContext<StoreState | null>(null);

const KEY = "vertbien-store-v1";

const seed = {
  categories: ["Limpieza", "Cocina", "Personal"],
  products: [
    { id: "p1", nombre: "Detergente Concentrado", categoria: "Limpieza", precio: 1200, unidad: "litro" as Unit, stock: 25, url_imagen: "", stockBajo: 10, stockCritico: 3 },
    { id: "p2", nombre: "Aceite de Girasol", categoria: "Cocina", precio: 1800, unidad: "litro" as Unit, stock: 18, url_imagen: "", stockBajo: 8, stockCritico: 2 },
    { id: "p3", nombre: "Jabón en Polvo", categoria: "Limpieza", precio: 950, unidad: "kg" as Unit, stock: 40, url_imagen: "", stockBajo: 15, stockCritico: 5 },
    { id: "p4", nombre: "Esponja Multiuso", categoria: "Limpieza", precio: 350, unidad: "unidad" as Unit, stock: 60, url_imagen: "", stockBajo: 20, stockCritico: 5 },
  ],
  sales: [] as Sale[],
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Migración: asegurar campos nuevos
        parsed.products = (parsed.products || []).map((p: any) => ({
          stockBajo: 10,
          stockCritico: 3,
          ...p,
        }));
        setState(parsed);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }, [state, hydrated]);

  const addProduct = useCallback((p: Omit<Product, "id">) => {
    setState((s: any) => ({ ...s, products: [...s.products, { ...p, id: crypto.randomUUID() }] }));
  }, []);
  const updateProduct = useCallback((id: string, p: Omit<Product, "id">) => {
    setState((s: any) => ({ ...s, products: s.products.map((x: Product) => x.id === id ? { ...p, id } : x) }));
  }, []);
  const deleteProduct = useCallback((id: string) => {
    setState((s: any) => ({ ...s, products: s.products.filter((x: Product) => x.id !== id) }));
  }, []);
  const addCategory = useCallback((name: string) => {
    setState((s: any) => s.categories.includes(name) ? s : ({ ...s, categories: [...s.categories, name] }));
  }, []);
  const deleteCategory = useCallback((name: string) => {
    let result: { ok: boolean; reason?: string } = { ok: true };
    setState((s: any) => {
      const hasStock = s.products.some((p: Product) => p.categoria === name && p.stock > 0);
      if (hasStock) { result = { ok: false, reason: "La categoría tiene productos con stock activo." }; return s; }
      return { ...s, categories: s.categories.filter((c: string) => c !== name) };
    });
    return result;
  }, []);
  const addSale = useCallback((s: Omit<Sale, "id" | "fecha">) => {
    setState((st: any) => ({ ...st, sales: [{ ...s, id: crypto.randomUUID(), fecha: new Date().toISOString() }, ...st.sales] }));
  }, []);

  return (
    <StoreCtx.Provider value={{ ...state, addProduct, updateProduct, deleteProduct, addCategory, deleteCategory, addSale }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}
