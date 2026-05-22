import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sale, useStore } from "@/lib/store";
import { Calendar, CreditCard, User } from "lucide-react";

interface Props {
  sale: Sale | null;
  onOpenChange: (v: boolean) => void;
}

export function SaleDetailModal({ sale, onOpenChange }: Props) {
  const { products } = useStore();
  return (
    <Dialog open={!!sale} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de venta</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {sale?.id}
          </DialogDescription>
        </DialogHeader>
        {sale && (
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="font-medium truncate">{new Date(sale.fecha).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <User className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Vendedor</p>
                  <p className="font-medium truncate">{sale.vendedor}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <CreditCard className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Pago</p>
                  <p className="font-medium truncate">{sale.metodoPago}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-12 text-xs font-medium text-muted-foreground bg-muted/40 px-3 py-2">
                <div className="col-span-6">Producto</div>
                <div className="col-span-3 text-right">Cant.</div>
                <div className="col-span-3 text-right">Subtotal</div>
              </div>
              {sale.items.map((i) => {
                const p = products.find((x) => x.id === i.productId);
                return (
                  <div key={i.productId} className="grid grid-cols-12 px-3 py-2 border-t border-border/60 text-sm items-center">
                    <div className="col-span-6 min-w-0">
                      <p className="font-medium truncate">{i.nombre}</p>
                      <p className="text-xs text-muted-foreground">${i.precio.toFixed(2)} / {p?.unidad ?? "unidad"}</p>
                    </div>
                    <div className="col-span-3 text-right">
                      {i.cantidad} <Badge variant="secondary" className="ml-1">{p?.unidad ?? ""}</Badge>
                    </div>
                    <div className="col-span-3 text-right font-medium">${(i.cantidad * i.precio).toFixed(2)}</div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Total final</span>
              <span className="text-2xl font-semibold text-primary">${sale.total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}