import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { deleteProfile, getCurrentUser, getProfiles, isAdmin, Profile, updateProfile } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Check, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: Admin,
  head: () => ({ meta: [{ title: "Admin — Sattiyar Matrimony" }] }),
});

function Admin() {
  const [list, setList] = useState<Profile[]>([]);
  const navigate = useNavigate();

  const refresh = () => setList(getProfiles().filter(p => p.email !== "admin@sattiyar.com"));

  useEffect(() => {
    const me = getCurrentUser();
    if (!isAdmin(me)) { toast.error("Admin access only"); navigate({ to: "/login" }); return; }
    refresh();
  }, [navigate]);

  const approve = (id: string, v: boolean) => { updateProfile(id, { approved: v }); refresh(); toast.success(v?"Approved":"Unapproved"); };
  const remove = (id: string) => { if (confirm("Delete this profile?")) { deleteProfile(id); refresh(); toast.success("Deleted"); } };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-primary mb-2"><span className="ornament">Admin Panel</span></h1>
      <p className="text-muted-foreground mb-6">{list.length} total profiles</p>
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-elegant">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Name</TableHead><TableHead>Contact</TableHead><TableHead>Location</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {list.map(p => (
              <TableRow key={p.id}>
                <TableCell><div className="font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.age} · {p.gender}</div></TableCell>
                <TableCell className="text-sm">{p.phone}<br/><span className="text-xs text-muted-foreground">{p.email}</span></TableCell>
                <TableCell className="text-sm">{p.city}, {p.state}</TableCell>
                <TableCell>{p.approved!==false ? <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">Approved</span> : <span className="text-xs px-2 py-1 rounded bg-muted">Pending</span>}</TableCell>
                <TableCell className="text-right space-x-2">
                  {p.approved !== false
                    ? <Button size="sm" variant="outline" onClick={()=>approve(p.id,false)}><X className="size-4"/></Button>
                    : <Button size="sm" onClick={()=>approve(p.id,true)} className="bg-primary"><Check className="size-4"/></Button>}
                  <Button size="sm" variant="destructive" onClick={()=>remove(p.id)}><Trash2 className="size-4"/></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
