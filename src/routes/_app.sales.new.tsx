import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore, VENDEDORAS, SaleItem, Sale } from "@/lib/store";
import { Plus, Minus, Trash2, Search, Package } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/sales/new")({
  head: () => ({ meta: [{ title: "Nueva Venta — VertBien" }] }),
  component: NewSale,
});

function NewSale() {
  const { products, addSale, updateProduct } = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [vendedor, setVendedor] = useState("");
  const [metodo, setMetodo] = useState<Sale["metodoPago"]>("Efectivo");

  const filtered = useMemo(
    () => products.filter((p) => p.nombre.toLowerCase().includes(q.toLowerCase())).slice(0, 12),
    [products, q]
  );

  const addToCart = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setCart((c) => {
      const existing = c.find((i) => i.productId === id);
      if (existing) return c.map((i) => i.productId === id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...c, { productId: id, nombre: p.nombre, precio: p.precio, cantidad: 1 }];
    });
  };
  const updateQty = (id: string, delta: number) => {
    setCart((c) => c.map((i) => i.productId === id ? { ...i, cantidad: Math.max(0.1, i.cantidad + delta) } : i));
  };
  const removeItem = (id: string) => setCart((c) => c.filter((i) => i.productId !== id));

  const total = cart.reduce((a, i) => a + i.precio * i.cantidad, 0);

  const confirm = () => {
    if (!vendedor) return toast.error("Seleccioná una vendedora");
    if (cart.length === 0) return toast.error("Agregá productos al carrito");
    addSale({ items: cart, vendedor, metodoPago: metodo, total });
    cart.forEach((i) => {
      const p = products.find((x) => x.id === i.productId);
      if (p) {
        const { id, ...rest } = p;
        updateProduct(id, { ...rest, stock: Math.max(0, p.stock - i.cantidad) });
      }
    });
    toast.success("Venta registrada");
    nav({ to: "/sales" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl">
      <div className="lg:col-span-2 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Nueva venta</h1>
          <p className="text-sm text-muted-foreground mt-1">Buscá productos y armá el ticket</p>
        </div>
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar producto..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" autoFocus />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {filtered.map((p) => (
              <button key={p.id} onClick={() => addToCart(p.id)} className="text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-colors">
                <div className="w-full aspect-square rounded-md bg-muted mb-2 overflow-hidden flex items-center justify-center">
                  {p.url_imagen ? <img src={p.url_imagen} alt={p.nombre} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-muted-foreground" />}
                </div>
                <p className="text-sm font-medium truncate">{p.nombre}</p>
                <p className="text-xs text-muted-foreground">${p.precio.toFixed(2)} · {p.unidad}</p>
              </button>
            ))}
            {filtered.length === 0 && <p className="text-sm text-muted-foreground col-span-full text-center py-6">Sin resultados</p>}
          </div>
        </Card>
      </div>

      <Card className="p-5 h-fit lg:sticky lg:top-20" style={{ boxShadow: "var(--shadow-soft)" }}>
        <h2 className="font-semibold mb-4">Ticket</h2>
        <div className="space-y-2 mb-4 max-h-80 overflow-auto">
          {cart.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Carrito vacío</p>}
          {cart.map((i) => (
            <div key={i.productId} className="flex items-center gap-2 py-2 border-b border-border/60 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{i.nombre}</p>
                <p className="text-xs text-muted-foreground">${i.precio.toFixed(2)} × {i.cantidad}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQty(i.productId, -1)}><Minus className="w-3 h-3" /></Button>
                <span className="text-sm w-8 text-center">{i.cantidad}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQty(i.productId, 1)}><Plus className="w-3 h-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeItem(i.productId)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <div className="space-y-2">
            <Label>Vendedora</Label>
            <Select value={vendedor} onValueChange={setVendedor}>
              <SelectTrigger><SelectValue placeholder="Seleccionar vendedora" /></SelectTrigger>
              <SelectContent>
                {VENDEDORAS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Método de pago</Label>
            <Select value={metodo} onValueChange={(v: Sale["metodoPago"]) => setMetodo(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
                <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                <SelectItem value="QR">QR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-muted-foreground">Total</span>
            <span className="text-2xl font-semibold text-primary">${total.toFixed(2)}</span>
          </div>
          <Button className="w-full" size="lg" onClick={confirm}>Confirmar venta</Button>
        </div>
      </Card>
    </div>
  );
}
