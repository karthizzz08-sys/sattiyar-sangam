import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getCurrentUser, getProfiles, Profile, seedIfEmpty } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Briefcase, GraduationCap, Heart, MessageCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/$id")({
  component: ProfileDetail,
  head: ({ params }) => ({ meta: [{ title: `Profile — Sattiyar Matrimony` }, { name: "description", content: `View profile ${params.id}` }] }),
});

function ProfileDetail() {
  const { id } = Route.useParams();
  const [p, setP] = useState<Profile | null>(null);
  const [activeImg, setActiveImg] = useState<string>("");
  const me = typeof window !== "undefined" ? getCurrentUser() : null;

  useEffect(() => {
    seedIfEmpty();
    const found = getProfiles().find(x => x.id === id) || null;
    setP(found);
    setActiveImg(found?.photo || found?.photos?.[0] || "");
  }, [id]);

  if (!p) {
    return <div className="container mx-auto px-4 py-20 text-center"><p className="text-muted-foreground">Profile not found.</p><Button asChild className="mt-4"><Link to="/search">Back to Search</Link></Button></div>;
  }

  const gallery = [p.photo, ...(p.photos || [])].filter(Boolean) as string[];
  const canSeeContact = !!me && (p.showContact !== false || me.id === p.id);
  const waMsg = encodeURIComponent(`Namaste, I saw your profile on Sattiyar Matrimony (${p.name}). I would like to connect.`);
  const waLink = `https://wa.me/91${p.phone}?text=${waMsg}`;

  const expressInterest = () => {
    if (!me) { toast.error("Please login to express interest"); return; }
    toast.success(`Interest sent to ${p.name} ❤`);
  };

  return (
    <div className="bg-sandal-gradient min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link to="/search" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-4"><ArrowLeft className="size-4"/>Back</Link>
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-6">
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl overflow-hidden bg-card border border-border shadow-elegant">
              {activeImg ? <img src={activeImg} alt={p.name} className="w-full h-full object-cover"/> : <div className="w-full h-full grid place-items-center bg-gold-gradient text-maroon font-display text-7xl">{p.name[0]}</div>}
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {gallery.map((g,i)=>(
                  <button key={i} onClick={()=>setActiveImg(g)} className={`aspect-square rounded-lg overflow-hidden border-2 ${activeImg===g?"border-primary":"border-border"}`}>
                    <img src={g} alt="" className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-elegant">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary">{p.name}</h1>
            <p className="text-muted-foreground mt-1">{p.age} years · {p.gender} · {p.maritalStatus}</p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
              <Info icon={GraduationCap} label="Education" value={p.education}/>
              <Info icon={Briefcase} label="Occupation" value={p.occupation}/>
              <Info icon={MapPin} label="Location" value={`${p.city}, ${p.district}, ${p.state}`}/>
              <Info icon={Heart} label="Community" value={`${p.community}${p.subCaste?` / ${p.subCaste}`:""}`}/>
              <Info icon={Briefcase} label="Salary" value={p.salary}/>
              {canSeeContact && <Info icon={Phone} label="Phone" value={p.phone}/>}
              {canSeeContact && <Info icon={Mail} label="Email" value={p.email}/>}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={expressInterest} className="bg-primary hover:bg-primary/90"><Heart className="mr-2 size-4" fill="currentColor"/>Express Interest</Button>
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <a href={waLink} target="_blank" rel="noreferrer"><MessageCircle className="mr-2 size-4"/>WhatsApp</a>
              </Button>
              {canSeeContact && (
                <Button asChild variant="outline"><a href={`tel:+91${p.phone}`}><Phone className="mr-2 size-4"/>Call</a></Button>
              )}
            </div>
            {!canSeeContact && <p className="text-xs text-muted-foreground mt-4">🔒 Login to view full contact details.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="size-9 rounded-lg bg-secondary/30 grid place-items-center text-primary shrink-0"><Icon className="size-4"/></div>
      <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium text-foreground">{value || "—"}</p></div>
    </div>
  );
}
