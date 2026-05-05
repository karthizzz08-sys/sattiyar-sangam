import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getProfiles, Profile, seedIfEmpty } from "@/lib/store";
import ProfileCard from "@/components/ProfileCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  head: () => ({ meta: [{ title: "Search Profiles — Sattiyar Matrimony" }] }),
});

function SearchPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [gender, setGender] = useState("any");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [location, setLocation] = useState("");
  const [education, setEducation] = useState("");
  const [job, setJob] = useState("");

  useEffect(() => { seedIfEmpty(); setProfiles(getProfiles().filter(p=>p.email!=="admin@sattiyar.com" && p.approved!==false)); }, []);

  const filtered = useMemo(() => profiles.filter(p => {
    if (gender !== "any" && p.gender !== gender) return false;
    if (ageMin && p.age < Number(ageMin)) return false;
    if (ageMax && p.age > Number(ageMax)) return false;
    if (location && !`${p.city} ${p.district} ${p.state}`.toLowerCase().includes(location.toLowerCase())) return false;
    if (education && !p.education.toLowerCase().includes(education.toLowerCase())) return false;
    if (job && !p.occupation.toLowerCase().includes(job.toLowerCase())) return false;
    return true;
  }), [profiles, gender, ageMin, ageMax, location, education, job]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl font-bold text-primary"><span className="ornament">Find Your Match</span></h1>
        <p className="text-muted-foreground mt-2">{filtered.length} profile{filtered.length===1?"":"s"} found</p>
      </div>
      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="bg-card rounded-2xl border border-border p-5 h-fit lg:sticky lg:top-24 space-y-4">
          <h3 className="font-display text-lg font-bold text-primary">Filters</h3>
          <div><Label className="text-xs">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Min Age</Label><Input type="number" value={ageMin} onChange={e=>setAgeMin(e.target.value)}/></div>
            <div><Label className="text-xs">Max Age</Label><Input type="number" value={ageMax} onChange={e=>setAgeMax(e.target.value)}/></div>
          </div>
          <div><Label className="text-xs">Location</Label><Input value={location} onChange={e=>setLocation(e.target.value)} placeholder="City/District"/></div>
          <div><Label className="text-xs">Education</Label><Input value={education} onChange={e=>setEducation(e.target.value)}/></div>
          <div><Label className="text-xs">Job</Label><Input value={job} onChange={e=>setJob(e.target.value)}/></div>
        </aside>
        <div>
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <p className="text-muted-foreground">No profiles match your filters.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(p => <ProfileCard key={p.id} p={p}/>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
