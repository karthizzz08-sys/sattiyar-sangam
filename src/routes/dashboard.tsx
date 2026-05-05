import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getCurrentUser, updateProfile, Profile } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "My Dashboard — Sattiyar Matrimony" }] }),
});

function Dashboard() {
  const [user, setUser] = useState<Profile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { navigate({ to: "/login" }); return; }
    setUser(u);
  }, [navigate]);

  if (!user) return null;
  const update = (patch: Partial<Profile>) => {
    updateProfile(user.id, patch);
    setUser({ ...user, ...patch });
    toast.success("Saved");
  };

  const onAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    Promise.all(files.map(f => new Promise<string>(res => { const r=new FileReader(); r.onload=()=>res(String(r.result)); r.readAsDataURL(f); })))
      .then(urls => update({ photos: [...(user.photos || []), ...urls] }));
  };
  const removePhoto = (idx: number) => update({ photos: (user.photos||[]).filter((_,i)=>i!==idx) });

  return (
    <div className="bg-sandal-gradient min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-card rounded-2xl shadow-elegant border border-border p-6 md:p-8 mb-6 flex items-center gap-6">
          <div className="size-24 rounded-full overflow-hidden bg-gold-gradient grid place-items-center shrink-0 shadow-gold">
            {user.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover"/> : <span className="font-display text-3xl text-maroon">{user.name[0]}</span>}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold text-primary">{user.name}</h1>
            <p className="text-muted-foreground">{user.occupation} · {user.city}</p>
            <p className="text-sm text-muted-foreground">{user.age} yrs · {user.education}</p>
          </div>
          <Button asChild variant="outline"><Link to="/profile/$id" params={{id:user.id}}>View Public</Link></Button>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="profile">Edit Profile</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="prefs">Partner Preferences</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="bg-card rounded-2xl border border-border p-6 mt-4">
            <EditForm user={user} onSave={update} />
          </TabsContent>

          <TabsContent value="photos" className="bg-card rounded-2xl border border-border p-6 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(user.photos||[]).map((p,i)=>(
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                  <img src={p} alt="" className="w-full h-full object-cover"/>
                  <button onClick={()=>removePhoto(i)} className="absolute top-1 right-1 size-7 rounded-full bg-destructive text-destructive-foreground grid place-items-center opacity-0 group-hover:opacity-100"><X className="size-4"/></button>
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-border grid place-items-center cursor-pointer hover:bg-muted text-muted-foreground">
                <input type="file" accept="image/*" multiple onChange={onAddPhoto} className="hidden"/>
                <div className="text-center"><Plus className="mx-auto"/><span className="text-xs">Add Photos</span></div>
              </label>
            </div>
          </TabsContent>

          <TabsContent value="prefs" className="bg-card rounded-2xl border border-border p-6 mt-4">
            <PrefsForm user={user} onSave={update}/>
          </TabsContent>

          <TabsContent value="privacy" className="bg-card rounded-2xl border border-border p-6 mt-4">
            <div className="flex items-center justify-between max-w-md">
              <div><Label>Show contact details to other members</Label><p className="text-xs text-muted-foreground">Phone & email visibility</p></div>
              <Switch checked={user.showContact} onCheckedChange={v=>update({showContact:v})}/>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EditForm({ user, onSave }: { user: Profile; onSave: (p: Partial<Profile>)=>void }) {
  const [f, setF] = useState(user);
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {(["name","phone","education","occupation","salary","city","district","state","subCaste"] as const).map(k=>(
        <div key={k} className="space-y-1.5"><Label className="capitalize">{k}</Label><Input value={(f as any)[k]||""} onChange={e=>setF({...f,[k]:e.target.value})}/></div>
      ))}
      <div className="md:col-span-2"><Button onClick={()=>onSave(f)} className="bg-primary">Save Changes</Button></div>
    </div>
  );
}

function PrefsForm({ user, onSave }: { user: Profile; onSave: (p: Partial<Profile>)=>void }) {
  const [p, setP] = useState(user.preferences || { ageMin: 22, ageMax: 32, location: "", education: "" });
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-1.5"><Label>Min Age</Label><Input type="number" value={p.ageMin||""} onChange={e=>setP({...p,ageMin:Number(e.target.value)})}/></div>
      <div className="space-y-1.5"><Label>Max Age</Label><Input type="number" value={p.ageMax||""} onChange={e=>setP({...p,ageMax:Number(e.target.value)})}/></div>
      <div className="space-y-1.5"><Label>Preferred Location</Label><Input value={p.location||""} onChange={e=>setP({...p,location:e.target.value})}/></div>
      <div className="space-y-1.5"><Label>Preferred Education</Label><Input value={p.education||""} onChange={e=>setP({...p,education:e.target.value})}/></div>
      <div className="md:col-span-2"><Button onClick={()=>onSave({preferences:p})} className="bg-primary">Save Preferences</Button></div>
    </div>
  );
}
