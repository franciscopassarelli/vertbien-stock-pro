import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useStore, Product } from "@/lib/store";
import { ProductModal } from "@/components/ProductModal";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/products")({
  head: () => ({ meta: [{ title: "Productos — VertBien" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const { products, deleteProduct } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [q, setQ] = useState("");

  const filtered = products.filter((p) =>
    p.nombre.toLowerCase().includes(q.toLowerCase()) || p.categoria.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} productos en el sistema</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Nuevo producto
        </Button>
      </div>

      <Card className="p-4">
        <Input placeholder="Buscar por nombre o categoría..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md mb-4" />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                    {p.url_imagen ? <img src={p.url_imagen} alt={p.nombre} className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{p.nombre}</TableCell>
                <TableCell><Badge variant="secondary">{p.categoria}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{p.unidad}</TableCell>
                <TableCell className="text-right">${p.precio.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <span className={p.stock < 5 ? "text-destructive font-medium" : ""}>{p.stock}</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setOpen(true); }}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { deleteProduct(p.id); toast.success("Producto eliminado"); }}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Sin resultados</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <ProductModal open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}
