import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useStore, getStockState, PAYMENT_METHODS, Sale } from "@/lib/store";
import { useSettings } from "@/lib/settings";
import { SaleDetailModal } from "@/components/SaleDetailModal";
import { Package, ShoppingCart, TrendingUp, AlertTriangle, Eye } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — VertBien" }] }),
  component: Dashboard,
});

type Range = "day" | "week" | "month" | "all";

function Dashboard() {
  const { products, sales } = useStore();
  const { vendedores } = useSettings();
  const [range, setRange] = useState<Range>("day");
  const [vendor, setVendor] = useState<string>("all");
  const [method, setMethod] = useState<string>("all");
  const [stockOpen, setStockOpen] = useState(false);
  const [selected, setSelected] = useState<Sale | null>(null);

  const filtered = useMemo(() => {
    let list = sales;
    if (range !== "all") {
      const now = new Date();
      const start = new Date(now);
      if (range === "day") start.setHours(0, 0, 0, 0);
      else if (range === "week") { start.setDate(now.getDate() - 7); start.setHours(0,0,0,0); }
      else if (range === "month") { start.setMonth(now.getMonth() - 1); start.setHours(0,0,0,0); }
      list = list.filter((s) => new Date(s.fecha) >= start);
    }
    if (vendor !== "all") list = list.filter((s) => s.vendedor === vendor);
    if (method !== "all") list = list.filter((s) => s.metodoPago === method);
    return list;
  }, [sales, range, vendor, method]);

  const total = filtered.reduce((a, s) => a + s.total, 0);
  const ticketAvg = filtered.length ? total / filtered.length : 0;
  const lowProducts = products.filter((p) => getStockState(p) !== "ok");

  const byVendor = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    filtered.forEach((s) => {
      const e = map.get(s.vendedor) || { count: 0, total: 0 };
      e.count += 1; e.total += s.total;
      map.set(s.vendedor, e);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].total - a[1].total);
  }, [filtered]);

  const byMethod = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    PAYMENT_METHODS.forEach((m) => map.set(m, { count: 0, total: 0 }));
    filtered.forEach((s) => {
      const e = map.get(s.metodoPago) || { count: 0, total: 0 };
      e.count += 1; e.total += s.total;
      map.set(s.metodoPago, e);
    });
    return Array.from(map.entries()).filter(([, v]) => v.count > 0);
  }, [filtered]);

  const ranges: { k: Range; label: string }[] = [
    { k: "day", label: "Día" },
    { k: "week", label: "Semana" },
    { k: "month", label: "Mes" },
    { k: "all", label: "Todo" },
  ];

  const rangeLabel = range === "day" ? "hoy" : range === "week" ? "últ. 7 días" : range === "month" ? "últ. 30 días" : "total";

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumen general del negocio</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {ranges.map((r) => (
          <Button key={r.k} size="sm" variant={range === r.k ? "default" : "outline"} onClick={() => setRange(r.k)}>
            {r.label}
          </Button>
        ))}
        <div className="flex gap-2 ml-auto flex-wrap">
          <Select value={vendor} onValueChange={setVendor}>
            <SelectTrigger className="w-[170px] h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los vendedores</SelectItem>
              {vendedores.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="w-[170px] h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los métodos</SelectItem>
              {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Vendido {rangeLabel}</p>
              <p className="text-2xl font-semibold mt-2">${total.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent"><TrendingUp className="w-5 h-5 text-primary" /></div>
          </div>
        </Card>
        <Card className="p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Ticket promedio</p>
              <p className="text-2xl font-semibold mt-2">${ticketAvg.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent"><ShoppingCart className="w-5 h-5 text-primary" /></div>
          </div>
        </Card>
        <Card className="p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Productos activos</p>
              <p className="text-2xl font-semibold mt-2">{products.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent"><Package className="w-5 h-5 text-primary" /></div>
          </div>
        </Card>
        <Card className="p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Stock bajo</p>
              <p className="text-2xl font-semibold mt-2">{lowProducts.length}</p>
              <Button variant="link" size="sm" className="px-0 h-auto mt-1" onClick={() => setStockOpen(true)}>
                <Eye className="w-3 h-3 mr-1" /> Ver detalles
              </Button>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-destructive/10"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="font-semibold mb-3">Ventas por vendedor</h2>
          {byVendor.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Sin ventas en este rango</p>
          ) : (
            <div className="space-y-2">
              {byVendor.map(([name, v]) => (
                <div key={name} className="flex justify-between items-center py-2 border-b border-border/60 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">{v.count} ventas</p>
                  </div>
                  <p className="font-semibold text-primary">${v.total.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold mb-3">Por método de pago</h2>
          {byMethod.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Sin ventas en este rango</p>
          ) : (
            <div className="space-y-2">
              {byMethod.map(([m, v]) => (
                <div key={m} className="flex justify-between items-center py-2 border-b border-border/60 last:border-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{m}</Badge>
                    <span className="text-xs text-muted-foreground">{v.count} ventas</span>
                  </div>
                  <p className="font-semibold text-primary">${v.total.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Últimas ventas</h2>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay ventas registradas.</p>
        ) : (
          <div className="space-y-2">
            {filtered.slice(0, 6).map((s) => (
              <div key={s.id} className="flex justify-between items-center py-2 border-b border-border/60 last:border-0 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{s.vendedor} · {s.items.length} items · <span className="text-muted-foreground">{s.metodoPago}</span></p>
                  <p className="text-xs text-muted-foreground">{new Date(s.fecha).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="font-semibold text-primary">${s.total.toFixed(2)}</p>
                  <Button variant="ghost" size="icon" onClick={() => setSelected(s)}><Eye className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={stockOpen} onOpenChange={setStockOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Productos con stock bajo o crítico</DialogTitle>
            <DialogDescription>{lowProducts.length} productos requieren atención</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {lowProducts.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Todo el stock está en niveles normales</p>}
            {lowProducts.map((p) => {
              const st = getStockState(p);
              return (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className={`w-2 h-10 rounded-full ${st === "critical" ? "bg-destructive" : "bg-amber-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.nombre}</p>
                    <p className="text-xs text-muted-foreground">{p.categoria} · umbrales {p.stockBajo}/{p.stockCritico}</p>
                  </div>
                  <Badge variant={st === "critical" ? "destructive" : "secondary"}>
                    {p.stock} {p.unidad}
                  </Badge>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <SaleDetailModal sale={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}