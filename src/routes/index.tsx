import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import heroImg from "@/assets/hero.jpg";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Search, Shield, Sparkles, Star, Users } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [age, setAge] = useState("25");
  const [gender, setGender] = useState("Female");
  const [location, setLocation] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/search", search: { age: Number(age), gender, location } as any });
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Tamil wedding couple" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
        </div>
        <div className="relative container mx-auto px-4 py-20 md:py-32 text-primary-foreground">
          <div className="max-w-2xl animate-fade-up">
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/40 text-sm mb-4">
              <Sparkles className="size-4 text-secondary" /> Exclusively for Sattiyar Community
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
              {t("heroTitle")}
            </h1>
            <p className="mt-4 text-lg opacity-90">{t("heroSub")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gold-gradient text-maroon hover:opacity-90 font-semibold shadow-gold">
                <Link to="/register"><Heart className="mr-2"/>Register Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                <Link to="/login">Login</Link>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[{n:"10K+",l:"Profiles"},{n:"2K+",l:"Matches"},{n:"500+",l:"Marriages"}].map(s => (
                <div key={s.l} className="text-center">
                  <div className="font-display text-3xl font-bold text-secondary">{s.n}</div>
                  <div className="text-xs opacity-80">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick search */}
      <section className="container mx-auto px-4 -mt-12 relative z-10">
        <form onSubmit={onSearch} className="bg-card rounded-2xl shadow-elegant border border-border p-6 md:p-8 grid md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-4 -mb-2 flex items-center gap-2 text-primary">
            <Search className="size-5"/><h3 className="font-display text-xl font-bold">{t("quickSearch")}</h3>
          </div>
          <div>
            <Label className="text-xs">{t("age")}</Label>
            <Input type="number" min={18} max={70} value={age} onChange={e=>setAge(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">{t("gender")}</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="Female">{t("female")}</SelectItem>
                <SelectItem value="Male">{t("male")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">{t("location")}</Label>
            <Input placeholder="City" value={location} onChange={e=>setLocation(e.target.value)} />
          </div>
          <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90">{t("findMatches")}</Button>
        </form>
      </section>

      {/* Why us */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary"><span className="ornament">Why Choose Us</span></h2>
          <p className="text-muted-foreground mt-2">A trusted home for Sattiyar families</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: "100% Verified", desc: "Every profile is manually verified for authenticity." },
            { icon: Users, title: "Community First", desc: "Exclusively serving Sattiyar families across Tamil Nadu." },
            { icon: Heart, title: "Sacred Matches", desc: "Traditional values blended with modern matchmaking." },
          ].map(f => (
            <div key={f.title} className="bg-card border border-border rounded-xl p-8 text-center hover:shadow-elegant transition-all hover:-translate-y-1">
              <div className="size-14 rounded-full bg-gold-gradient grid place-items-center mx-auto mb-4 shadow-gold">
                <f.icon className="size-6 text-maroon"/>
              </div>
              <h3 className="font-display text-xl font-bold text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Success stories */}
      <section className="bg-sandal-gradient py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary"><span className="ornament">{t("successStories")}</span></h2>
            <p className="text-muted-foreground mt-2">{t("storiesSub")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Karthik & Priya", img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600", quote: "We met here in 2024 and got married this Aadi month. Forever grateful!" },
              { name: "Arun & Divya", img: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600", quote: "A beautiful journey. Our families instantly connected." },
              { name: "Vignesh & Meena", img: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600", quote: "Trustworthy platform. Our parents loved the experience." },
            ].map(s => (
              <div key={s.name} className="bg-card rounded-xl overflow-hidden shadow-elegant border border-border">
                <img src={s.img} alt={s.name} loading="lazy" className="w-full h-56 object-cover"/>
                <div className="p-6">
                  <h3 className="font-display text-lg font-bold text-primary">{s.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2 italic">"{s.quote}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary"><span className="ornament">{t("testimonials")}</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Lakshmi R.", text: "Easy to use and very respectful of our traditions." },
            { name: "Selvam K.", text: "Found my daughter's match within 3 months. Highly recommended." },
            { name: "Ravi P.", text: "Profiles are genuine. Customer support is excellent." },
          ].map(t => (
            <div key={t.name} className="bg-card border border-border rounded-xl p-6">
              <div className="flex gap-1 text-secondary mb-3">{Array.from({length:5}).map((_,i)=><Star key={i} className="size-4" fill="currentColor"/>)}</div>
              <p className="text-sm text-muted-foreground italic">"{t.text}"</p>
              <p className="mt-3 font-semibold text-primary text-sm">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
