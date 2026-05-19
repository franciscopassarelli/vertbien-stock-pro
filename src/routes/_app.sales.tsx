import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore } from "@/lib/store";
import { Plus, TrendingUp, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/_app/sales")({
  head: () => ({ meta: [{ title: "Ventas — VertBien" }] }),
  component: SalesPage,
});

function SalesPage() {
  const { sales } = useStore();
  const today = new Date().toDateString();
  const todaySales = sales.filter((s) => new Date(s.fecha).toDateString() === today);
  const totalToday = todaySales.reduce((a, s) => a + s.total, 0);
  const ticketAvg = todaySales.length ? totalToday / todaySales.length : 0;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Ventas</h1>
          <p className="text-sm text-muted-foreground mt-1">Historial completo de operaciones</p>
        </div>
        <Button asChild><Link to="/sales/new"><Plus className="w-4 h-4 mr-2" />Nueva venta</Link></Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Total hoy</p>
              <p className="text-2xl font-semibold mt-2">${totalToday.toFixed(2)}</p>
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
              <p className="text-xs text-muted-foreground uppercase">Ventas hoy</p>
              <p className="text-2xl font-semibold mt-2">{todaySales.length}</p>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{s.id.slice(0, 8)}</TableCell>
                <TableCell>{new Date(s.fecha).toLocaleString()}</TableCell>
                <TableCell>{s.items.length} items</TableCell>
                <TableCell>{s.vendedor}</TableCell>
                <TableCell><Badge variant="secondary">{s.metodoPago}</Badge></TableCell>
                <TableCell className="text-right font-semibold">${s.total.toFixed(2)}</TableCell>
              </TableRow>
            ))}
            {sales.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No hay ventas registradas</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
