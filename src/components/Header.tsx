import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { getCurrentUser, setSession, isAdmin, seedIfEmpty } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X } from "lucide-react";

export default function Header() {
  const { t, lang, setLang } = useLang();
  const [user, setUser] = useState(getCurrentUser());
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    seedIfEmpty();
    setUser(getCurrentUser());
    const handler = () => setUser(getCurrentUser());
    window.addEventListener("storage", handler);
    window.addEventListener("sm-auth", handler);
    return () => { window.removeEventListener("storage", handler); window.removeEventListener("sm-auth", handler); };
  }, []);

  const logout = () => { setSession(null); window.dispatchEvent(new Event("sm-auth")); navigate({ to: "/" }); };

  const NavLinks = () => (
    <>
      <Link to="/" className="hover:text-secondary transition-colors" onClick={() => setOpen(false)}>{t("home")}</Link>
      <Link to="/search" className="hover:text-secondary transition-colors" onClick={() => setOpen(false)}>{t("search")}</Link>
      <Link to="/contact" className="hover:text-secondary transition-colors" onClick={() => setOpen(false)}>{t("contact")}</Link>
      {user && <Link to="/dashboard" className="hover:text-secondary transition-colors" onClick={() => setOpen(false)}>{t("dashboard")}</Link>}
      {isAdmin(user) && <Link to="/admin" className="hover:text-secondary transition-colors" onClick={() => setOpen(false)}>{t("admin")}</Link>}
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-elegant">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-10 rounded-full bg-gold-gradient grid place-items-center shadow-gold">
            <Heart className="size-5 text-maroon" fill="currentColor" />
          </div>
          <span className="font-display text-xl md:text-2xl font-bold">{t("brand")}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "en" ? "ta" : "en")}
            className="px-3 py-1.5 text-xs rounded-full bg-secondary/20 hover:bg-secondary/30 transition-colors border border-secondary/40"
          >
            {lang === "en" ? "தமிழ்" : "EN"}
          </button>
          {user ? (
            <Button variant="secondary" size="sm" onClick={logout} className="hidden sm:inline-flex">{t("logout")}</Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-primary-foreground hover:bg-secondary/20">
                <Link to="/login">{t("login")}</Link>
              </Button>
              <Button asChild size="sm" className="bg-gold-gradient text-maroon hover:opacity-90 font-semibold">
                <Link to="/register">{t("register")}</Link>
              </Button>
            </>
          )}
          <button className="md:hidden ml-1" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="md:hidden bg-primary border-t border-secondary/20 px-4 py-3 flex flex-col gap-3 text-sm">
          <NavLinks />
          {user && <button onClick={logout} className="text-left">{t("logout")}</button>}
        </nav>
      )}
    </header>
  );
}
