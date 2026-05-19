import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { Plus, Trash2, Tags } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/categories")({
  head: () => ({ meta: [{ title: "Categorías — VertBien" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { categories, products, addCategory, deleteCategory } = useStore();
  const [name, setName] = useState("");

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
                  <p className="text-xs text-muted-foreground">{c.total} productos · {c.stock} en stock</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(c.name)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
