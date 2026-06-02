import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, Unit, useStore, UNITS, UNIT_LABELS } from "@/lib/store";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: Product | null;
}

const empty = {
  nombre: "",
  categoria: "",
  precio: 0,
  unidad: "unidad" as Unit,
  stock: 0,
  url_imagen: "",
  stockBajo: 10,
  stockCritico: 3,
};

export function ProductModal({ open, onOpenChange, editing }: Props) {
  const { categories, addProduct, updateProduct } = useStore();
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (editing) {
      const { id: _id, ...rest } = editing;
      setForm(rest);
    } else {
      setForm(empty);
    }
  }, [editing, open]);

  const handleImage = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, url_imagen: String(reader.result) }));
    reader.readAsDataURL(file);
  };

const save = async () => {
    // 1. Validaciones
    if (!form.nombre.trim()) return toast.error("El nombre es obligatorio");
    if (!form.categoria) return toast.error("Seleccioná una categoría");
    if (form.precio <= 0) return toast.error("El precio debe ser mayor a 0");
    if (form.stock <= 0) return toast.error("El stock debe ser mayor a 0");
    if (form.stockCritico >= form.stockBajo) return toast.error("Stock crítico debe ser menor que stock bajo");

  try {
    const productToSave = { 
      ...form, 
      url_imagen: "" // FORZAMOS A VACÍO TEMPORALMENTE
    };
    
    if (editing) {
      await updateProduct(editing.id, productToSave);
    } else {
      await addProduct(productToSave); // Enviamos sin imagen
    }
    onOpenChange(false);
    toast.success("Producto guardado");
  } catch (error: any) {
    console.error("Error completo:", error); // MIRA LA CONSOLA AQUÍ
    toast.error("Error: " + error.message);
  }
};
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          <DialogDescription>
            Completá los datos del producto. Los campos nombre y categoría son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="flex gap-4 items-center">
            <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/40 shrink-0">
              {form.url_imagen ? (
                <img src={form.url_imagen} alt="" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="img" className="text-sm">Imagen del producto</Label>
              <Input id="img" type="file" accept="image/*" onChange={(e) => handleImage(e.target.files?.[0])} className="mt-1" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unidad</Label>
              <Select value={form.unidad} onValueChange={(v: Unit) => setForm({ ...form, unidad: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => <SelectItem key={u} value={u}>{UNIT_LABELS[u]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Precio</Label>
              <Input type="number" step="0.01" min="0.01" value={form.precio} onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input type="number" step="0.01" min="0.01" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Umbral stock bajo</Label>
              <Input type="number" step="0.01" min="0" value={form.stockBajo} onChange={(e) => setForm({ ...form, stockBajo: Number(e.target.value) })} />
              <p className="text-xs text-muted-foreground">Se muestra en amarillo</p>
            </div>
            <div className="space-y-2">
              <Label>Umbral stock crítico</Label>
              <Input type="number" step="0.01" min="0" value={form.stockCritico} onChange={(e) => setForm({ ...form, stockCritico: Number(e.target.value) })} />
              <p className="text-xs text-muted-foreground">Se muestra en rojo</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
