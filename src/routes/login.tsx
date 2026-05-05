import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { findByCredentials, setSession } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Login — Sattiyar Matrimony" }] }),
});

function Login() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = findByCredentials(id, pw);
    if (!u) { toast.error("Invalid credentials"); return; }
    setSession(u.id);
    window.dispatchEvent(new Event("sm-auth"));
    toast.success("Welcome back!");
    navigate({ to: u.email === "admin@sattiyar.com" ? "/admin" : "/dashboard" });
  };

  return (
    <div className="min-h-[80vh] grid place-items-center px-4 py-12 bg-sandal-gradient">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-elegant border border-border p-8">
        <div className="text-center mb-6">
          <div className="size-14 rounded-full bg-gold-gradient grid place-items-center mx-auto mb-3 shadow-gold"><Heart className="size-6 text-maroon" fill="currentColor"/></div>
          <h1 className="font-display text-3xl font-bold text-primary">Welcome Back</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to continue your journey</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><Label>Email or Phone</Label><Input value={id} onChange={e=>setId(e.target.value)} required/></div>
          <div className="space-y-1.5"><Label>Password</Label><Input type="password" value={pw} onChange={e=>setPw(e.target.value)} required/></div>
          <button type="button" onClick={()=>toast.info("Please contact admin via WhatsApp to reset")} className="text-xs text-primary hover:underline">Forgot password?</button>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" size="lg">Login</Button>
          <p className="text-sm text-center text-muted-foreground">New here? <Link to="/register" className="text-primary font-semibold hover:underline">Create account</Link></p>
          <p className="text-xs text-center text-muted-foreground pt-2 border-t border-border">Demo: priya@example.com / demo · Admin: admin@sattiyar.com / admin123</p>
        </form>
      </div>
    </div>
  );
}
