import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const nav = useNavigate();
  const { user } = useAuth();
  useEffect(() => {
    nav({ to: user ? "/dashboard" : "/login" });
  }, [user, nav]);
  return null;
}
