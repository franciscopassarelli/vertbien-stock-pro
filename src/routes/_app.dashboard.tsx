import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — VertBien" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { products, sales } = useStore();
  const today = new Date().toDateString();
  const todaySales = sales.filter((s) => new Date(s.fecha).toDateString() === today);
  const totalToday = todaySales.reduce((a, s) => a + s.total, 0);
  const ticketAvg = todaySales.length ? totalToday / todaySales.length : 0;
  const lowStock = products.filter((p) => p.stock < 5).length;

  const stats = [
    { label: "Total vendido hoy", value: `$${totalToday.toFixed(2)}`, icon: TrendingUp },
    { label: "Ticket promedio", value: `$${ticketAvg.toFixed(2)}`, icon: ShoppingCart },
    { label: "Productos activos", value: products.length, icon: Package },
    { label: "Stock bajo", value: lowStock, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumen general del negocio</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 border-border/60" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-semibold mt-2 text-foreground">{s.value}</p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Últimas ventas</h2>
        {sales.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay ventas registradas.</p>
        ) : (
          <div className="space-y-2">
            {sales.slice(0, 5).map((s) => (
              <div key={s.id} className="flex justify-between items-center py-2 border-b border-border/60 last:border-0">
                <div>
                  <p className="text-sm font-medium">{s.vendedor} · {s.items.length} items</p>
                  <p className="text-xs text-muted-foreground">{new Date(s.fecha).toLocaleString()}</p>
                </div>
                <p className="font-semibold text-primary">${s.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
