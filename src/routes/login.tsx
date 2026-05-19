import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/components/LoginForm";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Ingresar — VertBien" }] }),
  component: LoginForm,
});
