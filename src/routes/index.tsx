import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase"; // <--- Importa tu cliente

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const nav = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Prueba de conexión rápida
    async function testDb() {
      const { data, error } = await supabase.from('productos').select('*');
      if (error) console.error("Error al conectar a Supabase:", error.message);
      else console.log("¡Conexión exitosa! Productos encontrados:", data);
    }
    
    testDb(); // Ejecutamos la prueba

    // Luego redirigimos normalmente
    nav({ to: user ? "/dashboard" : "/login" });
  }, [user, nav]);

  return null;
}