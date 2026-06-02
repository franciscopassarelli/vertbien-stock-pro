import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore, Sale, PAYMENT_METHODS } from "@/lib/store";
import { useSettings } from "@/lib/settings";
import { SaleDetailModal } from "@/components/SaleDetailModal";
import { Plus, TrendingUp, ShoppingCart, Eye } from "lucide-react";

export const Route = createFileRoute("/_app/sales/")({
  head: () => ({ meta: [{ title: "Ventas — VertBien" }] }),
  component: SalesPage,
});

function SalesPage() {
  const { sales } = useStore();
  const { vendedores } = useSettings();
  const [range, setRange] = useState<"day" | "week" | "month" | "all">("day");
  const [vendor, setVendor] = useState<string>("all");
  const [method, setMethod] = useState<string>("all");
  const [selected, setSelected] = useState<Sale | null>(null);

  const filteredSales = useMemo(() => {
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

  const totalRange = filteredSales.reduce((a, s) => a + s.total, 0);
  const ticketAvg = filteredSales.length ? totalRange / filteredSales.length : 0;
  const rangeLabel = range === "day" ? "hoy" : range === "week" ? "últ. 7 días" : range === "month" ? "últ. 30 días" : "total";

  const ranges: { k: typeof range; label: string }[] = [
    { k: "day", label: "Día" },
    { k: "week", label: "Semana" },
    { k: "month", label: "Mes" },
    { k: "all", label: "Todo" },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Ventas</h1>
          <p className="text-sm text-muted-foreground mt-1">Historial completo de operaciones</p>
        </div>
        <Button asChild><Link to="/sales/new"><Plus className="w-4 h-4 mr-2" />Nueva venta</Link></Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {ranges.map((r) => (
          <Button key={r.k} size="sm" variant={range === r.k ? "default" : "outline"} onClick={() => setRange(r.k)}>
            {r.label}
          </Button>
        ))}
        <div className="flex gap-2 ml-auto">
          <Select value={vendor} onValueChange={setVendor}>
            <SelectTrigger className=" h-8"><SelectValue placeholder="Vendedor" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los vendedores</SelectItem>
              {vendedores.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className=" h-8"><SelectValue placeholder="Método" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los métodos</SelectItem>
              {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Total {rangeLabel}</p>
              <p className="text-2xl font-semibold mt-2">${totalRange.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
        </Card>
        <Card className="p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Ticket promedio</p>
              <p className="text-2xl font-semibold mt-2">${ticketAvg.toFixed(2)}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
        </Card>
        <Card className="p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Ventas {rangeLabel}</p>
              <p className="text-2xl font-semibold mt-2">{filteredSales.length}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Método</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{String(s.id).slice(0, 8)}</TableCell>
                <TableCell>{s.fecha ? new Date(s.fecha).toLocaleString() : "sin fecha"}</TableCell>
                <TableCell>{s.items.length} items</TableCell>
                <TableCell>{s.vendedor}</TableCell>
                <TableCell><Badge variant="secondary">{s.metodoPago}</Badge></TableCell>
                <TableCell className="text-right font-semibold">${s.total.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setSelected(s)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredSales.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No hay ventas en este rango</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <SaleDetailModal sale={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
