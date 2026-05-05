import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { addProfile, calcAge, getProfiles, setSession, Profile } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: Register,
  head: () => ({ meta: [{ title: "Register — Sattiyar Matrimony" }, { name: "description", content: "Create your free Sattiyar Matrimony profile." }] }),
});

function Register() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [form, setForm] = useState({
    name: "", gender: "Male" as "Male"|"Female", dob: "", phone: "", email: "", password: "",
    community: "Sattiyar", subCaste: "", education: "", occupation: "", salary: "",
    city: "", district: "", state: "Tamil Nadu", maritalStatus: "Never Married", photo: "",
  });
  const age = useMemo(() => calcAge(form.dob), [form.dob]);
  const set = (k: string, v: string) => setForm(s => ({ ...s, [k]: v }));

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => set("photo", String(r.result));
    r.readAsDataURL(f);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.dob || !form.phone) {
      toast.error("Please fill all required fields"); return;
    }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (getProfiles().some(p => p.email === form.email)) { toast.error("Email already registered"); return; }
    const profile: Profile = {
      id: "u" + Date.now(), ...form, age, approved: true, showContact: true, createdAt: Date.now(),
    };
    addProfile(profile);
    setSession(profile.id);
    window.dispatchEvent(new Event("sm-auth"));
    toast.success("Welcome! Your profile is created 🎉");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="bg-sandal-gradient min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-primary"><span className="ornament">Create Your Profile</span></h1>
          <p className="text-muted-foreground mt-2">Join thousands of Sattiyar families</p>
        </div>
        <form onSubmit={submit} className="bg-card rounded-2xl shadow-elegant border border-border p-6 md:p-8 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Name *"><Input value={form.name} onChange={e=>set("name",e.target.value)} required/></Field>
            <Field label="Gender *">
              <Select value={form.gender} onValueChange={v=>set("gender",v)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label="Date of Birth *"><Input type="date" value={form.dob} onChange={e=>set("dob",e.target.value)} required/></Field>
            <Field label="Age (auto)"><Input value={age || ""} disabled/></Field>
            <Field label="Phone *"><Input type="tel" value={form.phone} onChange={e=>set("phone",e.target.value)} required/></Field>
            <Field label="Email *"><Input type="email" value={form.email} onChange={e=>set("email",e.target.value)} required/></Field>
            <Field label="Password *"><Input type="password" value={form.password} onChange={e=>set("password",e.target.value)} required/></Field>
            <Field label="Community"><Input value={form.community} disabled/></Field>
            <Field label="Sub-caste"><Input value={form.subCaste} onChange={e=>set("subCaste",e.target.value)}/></Field>
            <Field label="Marital Status">
              <Select value={form.maritalStatus} onValueChange={v=>set("maritalStatus",v)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  {["Never Married","Divorced","Widowed","Awaiting Divorce"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Education"><Input value={form.education} onChange={e=>set("education",e.target.value)}/></Field>
            <Field label="Occupation"><Input value={form.occupation} onChange={e=>set("occupation",e.target.value)}/></Field>
            <Field label="Salary (per annum)"><Input value={form.salary} onChange={e=>set("salary",e.target.value)} placeholder="e.g. 8 LPA"/></Field>
            <Field label="City"><Input value={form.city} onChange={e=>set("city",e.target.value)}/></Field>
            <Field label="District"><Input value={form.district} onChange={e=>set("district",e.target.value)}/></Field>
            <Field label="State"><Input value={form.state} onChange={e=>set("state",e.target.value)}/></Field>
          </div>
          <Field label="Profile Photo">
            <div className="flex items-center gap-4">
              {form.photo && <img src={form.photo} alt="" className="size-20 rounded-lg object-cover border border-border"/>}
              <Input type="file" accept="image/*" onChange={onPhoto}/>
            </div>
          </Field>
          <div className="flex items-center justify-between gap-4 pt-4">
            <p className="text-sm text-muted-foreground">Already a member? <Link to="/login" className="text-primary font-semibold hover:underline">Login</Link></p>
            <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90">Create Profile</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-sm font-medium">{label}</Label>{children}</div>;
}
