import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSettings, ACCENT_PRESETS, AccentKey, ThemeMode } from "@/lib/settings";
import { Sun, Moon, Plus, Trash2, Pencil, Check, X, Palette } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Configuración — VertBien" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const s = useSettings();
  const [newSeller, setNewSeller] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const themes: { k: ThemeMode; label: string; icon: typeof Sun }[] = [
    { k: "light", label: "Claro", icon: Sun },
    { k: "dark", label: "Oscuro", icon: Moon },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-1">Personalizá la apariencia y los vendedores</p>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold mb-1">Apariencia</h2>
        <p className="text-xs text-muted-foreground mb-4">Modo claro u oscuro</p>
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          {themes.map((t) => (
            <button
              key={t.k}
              onClick={() => s.setTheme(t.k)}
              className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
                s.theme === t.k ? "border-primary bg-accent/30" : "border-border hover:border-primary/40"
              }`}
            >
              <t.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-1">Color de acento</h2>
        <p className="text-xs text-muted-foreground mb-4">Aplica globalmente a toda la interfaz</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {ACCENT_PRESETS.map((a) => (
            <button
              key={a.key}
              onClick={() => s.setAccent(a.key)}
              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                s.accent === a.key ? "border-primary" : "border-border hover:border-primary/40"
              }`}
            >
              <span
                className="w-8 h-8 rounded-full"
                style={{ background: `oklch(0.62 0.15 ${a.hue})` }}
              />
              <span className="text-xs font-medium">{a.label}</span>
            </button>
          ))}
        </div>
        <div className={`mt-4 p-4 rounded-lg border-2 ${s.accent === "custom" ? "border-primary" : "border-border"}`}>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4" />
            <Label>Personalizado · matiz {s.customHue}°</Label>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={s.customHue}
            onChange={(e) => s.setCustomHue(Number(e.target.value))}
            className="w-full"
            style={{
              background: "linear-gradient(to right, oklch(0.62 0.15 0), oklch(0.62 0.15 60), oklch(0.62 0.15 120), oklch(0.62 0.15 180), oklch(0.62 0.15 240), oklch(0.62 0.15 300), oklch(0.62 0.15 360))",
              borderRadius: "9999px",
              height: "8px",
              appearance: "none",
            }}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-1">Vendedores</h2>
        <p className="text-xs text-muted-foreground mb-4">Gestioná el equipo de ventas. Se sincroniza con ventas y filtros.</p>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Nombre del vendedor/a"
            value={newSeller}
            onChange={(e) => setNewSeller(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newSeller.trim()) {
                s.addVendedor(newSeller);
                setNewSeller("");
                toast.success("Vendedor agregado");
              }
            }}
          />
          <Button
            onClick={() => {
              if (!newSeller.trim()) return;
              s.addVendedor(newSeller);
              setNewSeller("");
              toast.success("Vendedor agregado");
            }}
          >
            <Plus className="w-4 h-4 mr-2" />Agregar
          </Button>
        </div>
        <div className="space-y-2">
          {s.vendedores.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Sin vendedores</p>
          )}
          {s.vendedores.map((v) => (
            <div key={v} className="flex items-center gap-2 p-2 rounded-lg border border-border">
              {editing === v ? (
                <>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1" />
                  <Button size="icon" variant="ghost" onClick={() => { s.renameVendedor(v, editName); setEditing(null); toast.success("Actualizado"); }}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditing(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Badge variant="secondary" className="text-sm">{v}</Badge>
                  <div className="flex-1" />
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(v); setEditName(v); }}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => { s.removeVendedor(v); toast.success("Eliminado"); }}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}