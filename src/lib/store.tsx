import { createContext, useEffect, useState, ReactNode, useCallback, useContext } from "react";
import { supabase } from "@/lib/supabase";
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
  // Ahora todas son async porque tocan Supabase
  addProduct: (p: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, p: Omit<Product, "id">) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<{ ok: boolean; reason?: string }>;
  addSale: (s: Omit<Sale, "id" | "fecha">) => Promise<void>;
}
const StoreCtx = createContext<StoreState | null>(null);

const KEY = "vertbien-store-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ 
    categories: ["Limpieza", "Cocina", "Personal"], 
    products: [] as Product[], 
    sales: [] as Sale[] 
  });

  // 1. Carga inicial desde Supabase
  useEffect(() => {
    async function loadData() {
      const { data: productos } = await supabase.from('productos').select('*');
      const { data: categorias } = await supabase.from('categorias').select('nombre');
      const { data: ventas } = await supabase
  .from('ventas')
  .select(`
    *,
    items_venta (
      producto_id,
      nombre,
      cantidad,
      precio
    )
  `);

 if (ventas) {
  const mappedSales = ventas.map((v: any) => {

    console.log("Datos crudos de esta venta:", v);

    return {
      
      id: v.id,
      // Nos aseguramos de leer la fecha correctamente
      fecha: v.fecha ? v.fecha : new Date().toISOString(),
      vendedor: v.vendedor,
      // Importante: usamos el nombre de columna REAL de tu tabla de Supabase
      metodoPago: v.metodo_pago, 
      total: v.total,
      items: v.items_venta ? v.items_venta.map((i: any) => ({
        productId: i.producto_id,
        nombre: i.nombre,
        cantidad: i.cantidad,
        precio: i.precio
      })) : []
    }; 
    });
  setState((s) => ({ ...s, sales: mappedSales }));
}

if (productos) {
        // Mapeo: Base de datos (snake_case) -> Aplicación (camelCase)
        const mappedProducts = productos.map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          categoria: p.categoria,
          precio: p.precio,
          unidad: p.unidad,
          stock: p.stock,
          url_imagen: p.url_imagen,
          stockBajo: p.stock_bajo,
          stockCritico: p.stock_critico
        }));
        setState((s) => ({ ...s, products: mappedProducts }));
      }

      if (categorias) {
      setState((s) => ({ ...s, categories: categorias.map(c => c.nombre) }));
    }

   
    }
    loadData();
  }, []);

  const addCategory = useCallback(async (name: string) => {
    const {error} = await supabase.from('categorias').insert([{ nombre: name }]);
    if (!error) {
      setState((s: any) => s.categories.includes(name) ? s : ({ ...s, categories: [...s.categories, name] }));
    }else {
        console.error("Error al agregar categoría:", error);
 }  
  }, []);

  const deleteCategory = useCallback(async (name: string) => {
  // Primero borramos de Supabase
  const { error } = await supabase.from('categorias').delete().eq('nombre', name);
  
  if (!error) {
    setState((s) => ({ 
      ...s, 
      categories: s.categories.filter((c: string) => c !== name) 
    }));
    return { ok: true };
  }
  return { ok: false, reason: "Error al borrar en base de datos" };
}, []);

  


  // 2. Acciones centralizadas
  const addProduct = useCallback(async (p: Omit<Product, "id">) => {
    const { data, error } = await supabase.from('productos').insert([{
      nombre: p.nombre,
      categoria: p.categoria,
      precio: p.precio,
      stock: p.stock,
      stock_bajo: p.stockBajo,
      stock_critico: p.stockCritico,
      unidad: p.unidad,
      url_imagen: p.url_imagen
    }]).select().single();

    if (!error && data) {
      const newProduct = { ...data, stockBajo: data.stock_bajo, stockCritico: data.stock_critico };
      setState((s) => ({ ...s, products: [...s.products, newProduct] }));
    }
  }, []);

  const updateProduct = useCallback(async (id: string, p: Omit<Product, "id">) => {
    const { error } = await supabase.from('productos').update({
      nombre: p.nombre,
      categoria: p.categoria,
      precio: p.precio,
      stock: p.stock,
      stock_bajo: p.stockBajo,
      stock_critico: p.stockCritico,
      unidad: p.unidad,
      url_imagen: p.url_imagen
    }).eq('id', id);

    if (!error) {
      setState((s) => ({ 
        ...s, 
        products: s.products.map((x) => x.id === id ? { ...p, id } : x) 
      }));
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (!error) {
      setState((s) => ({ ...s, products: s.products.filter((x) => x.id !== id) }));
    }
  }, []);

 const addSale = useCallback(async (s: Omit<Sale, "id" | "fecha">) => {
  // 1. Insertar la venta
  const { data: venta, error: vError } = await supabase
    .from('ventas')
    .insert([{ total: s.total, vendedor: s.vendedor, metodo_pago: s.metodoPago }])
    .select()
    .single();

  if (vError || !venta) return;

  // 2. Preparar y enviar los items asociados al ID de la nueva venta
  const itemsConId = s.items.map(item => ({
    venta_id: venta.id,
    producto_id: item.productId,
    nombre: item.nombre,
    cantidad: item.cantidad,
    precio: item.precio
  }));

  const { error: iError } = await supabase.from('items_venta').insert(itemsConId);
  
  if (!iError) {
    setState((st: any) => ({ ...st, sales: [{ ...venta, items: s.items }, ...st.sales] }));
  }
}, []);
 


  return (
    <StoreCtx.Provider value={{ ...state, addProduct, updateProduct, deleteProduct, addCategory, deleteCategory, addSale }}>
      {children}
    </StoreCtx.Provider>

    
  );

  
}

// ... (después del return del StoreProvider y antes de que termine el archivo)

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}