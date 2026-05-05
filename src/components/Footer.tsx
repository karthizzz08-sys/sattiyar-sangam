import { Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { Phone, Mail, MapPin, Heart } from "lucide-react";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="container mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="size-10 rounded-full bg-gold-gradient grid place-items-center"><Heart className="size-5 text-maroon" fill="currentColor"/></div>
            <span className="font-display text-xl font-bold">{t("brand")}</span>
          </div>
          <p className="text-sm opacity-80">{t("footerNote")}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-secondary">Quick Links</h4>
          <ul className="space-y-2 text-sm opacity-90">
            <li><Link to="/" className="hover:text-secondary">Home</Link></li>
            <li><Link to="/search" className="hover:text-secondary">Search</Link></li>
            <li><Link to="/register" className="hover:text-secondary">Register</Link></li>
            <li><Link to="/contact" className="hover:text-secondary">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-secondary">Contact</h4>
          <ul className="space-y-2 text-sm opacity-90">
            <li className="flex gap-2 items-start"><Phone className="size-4 mt-0.5"/> +91 98765 43210</li>
            <li className="flex gap-2 items-start"><Mail className="size-4 mt-0.5"/> info@sattiyarmatrimony.com</li>
            <li className="flex gap-2 items-start"><MapPin className="size-4 mt-0.5"/> Coimbatore, Tamil Nadu</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-secondary">Trust</h4>
          <p className="text-sm opacity-90">100% verified profiles. Privacy-first matchmaking exclusively for the Sattiyar community.</p>
        </div>
      </div>
      <div className="border-t border-secondary/20 py-4 text-center text-xs opacity-75">
        © {new Date().getFullYear()} Sattiyar Matrimony. All rights reserved.
      </div>
    </footer>
  );
}
