import { Link } from "@tanstack/react-router";
import { Profile } from "@/lib/store";
import { MapPin, Briefcase, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfileCard({ p }: { p: Profile }) {
  return (
    <div className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 animate-fade-up">
      <div className="aspect-[4/5] overflow-hidden bg-muted relative">
        {p.photo ? (
          <img src={p.photo} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full grid place-items-center bg-gold-gradient text-maroon text-5xl font-display">{p.name[0]}</div>
        )}
        <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">{p.age} yrs</div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-display text-lg font-bold text-primary truncate">{p.name}</h3>
        <p className="text-xs text-muted-foreground flex items-center gap-1"><GraduationCap className="size-3.5"/>{p.education}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1"><Briefcase className="size-3.5"/>{p.occupation}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="size-3.5"/>{p.city}, {p.state}</p>
        <Button asChild size="sm" className="w-full mt-2 bg-primary hover:bg-primary/90">
          <Link to="/profile/$id" params={{ id: p.id }}>View Profile</Link>
        </Button>
      </div>
    </div>
  );
}
