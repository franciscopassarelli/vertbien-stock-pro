import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useStore, getStockState } from "@/lib/store";
import { Plus, Trash2, Tags, Eye, Package } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/categories")({
  head: () => ({ meta: [{ title: "Categorías — VertBien" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { categories, products, addCategory, deleteCategory } = useStore();
  const [name, setName] = useState("");
  const [openCat, setOpenCat] = useState<string | null>(null);

  const counts = categories.map((c) => ({
    name: c,
    total: products.filter((p) => p.categoria === c).length,
    stock: products.filter((p) => p.categoria === c).reduce((a, p) => a + p.stock, 0),
  }));

  const add = () => {
    const v = name.trim();
    if (!v) return;
    addCategory(v);
    setName("");
    toast.success("Categoría creada");
  };

  const remove = (n: string) => {
    const r = deleteCategory(n);
    if (!r.ok) toast.error(r.reason || "No se puede eliminar");
    else toast.success("Categoría eliminada");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">Categorías</h1>
        <p className="text-sm text-muted-foreground mt-1">Organizá tu catálogo</p>
      </div>

      <Card className="p-5">
        <div className="flex gap-2">
          <Input placeholder="Nueva categoría (ej: Cocina)" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
          <Button onClick={add}><Plus className="w-4 h-4 mr-2" />Agregar</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {counts.map((c) => (
          <Card key={c.name} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <Tags className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{c.name}</p>
                  <button
                    type="button"
                    onClick={() => setOpenCat(c.name)}
                    className="text-xs text-muted-foreground hover:text-primary hover:underline text-left"
                  >
                    {c.total} productos · {c.stock} en stock
                  </button>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(c.name)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => setOpenCat(c.name)}>
              <Eye className="w-4 h-4 mr-2" /> Ver detalles
            </Button>
          </Card>
        ))}
      </div>

      <Dialog open={!!openCat} onOpenChange={(o) => !o && setOpenCat(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Categoría: {openCat}</DialogTitle>
            <DialogDescription>Productos asociados a esta categoría</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {openCat && products.filter((p) => p.categoria === openCat).map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {p.url_imagen ? <img src={p.url_imagen} alt={p.nombre} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.nombre}</p>
                  <p className="text-xs text-muted-foreground">${p.precio.toFixed(2)} / {p.unidad}</p>
                </div>
                {(() => {
                  const st = getStockState(p);
                  return (
                    <Badge variant={st === "critical" ? "destructive" : st === "low" ? "outline" : "secondary"}>
                      {p.stock} {p.unidad}
                    </Badge>
                  );
                })()}
              </div>
            ))}
            {openCat && products.filter((p) => p.categoria === openCat).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No hay productos en esta categoría</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
