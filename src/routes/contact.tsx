import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({ meta: [{ title: "Contact — Sattiyar Matrimony" }, { name: "description", content: "Reach out to Sattiyar Matrimony team." }] }),
});

const PHONE = "919876543210";

function Contact() {
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name || !f.email || !f.message) { toast.error("Please complete the form"); return; }
    toast.success("Message sent! We'll get back to you soon.");
    setF({ name: "", email: "", message: "" });
  };
  const wa = `https://wa.me/${PHONE}?text=${encodeURIComponent("Namaste! I have a query about Sattiyar Matrimony.")}`;

  return (
    <div className="bg-sandal-gradient py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-primary"><span className="ornament">Contact Us</span></h1>
          <p className="text-muted-foreground mt-2">We're here to help your family</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {[
              { icon: Phone, label: "Phone", value: "+91 98765 43210", href: "tel:+919876543210" },
              { icon: Mail, label: "Email", value: "info@sattiyarmatrimony.com", href: "mailto:info@sattiyarmatrimony.com" },
              { icon: MapPin, label: "Office", value: "Coimbatore, Tamil Nadu" },
            ].map(c => (
              <a key={c.label} href={c.href} className="bg-card border border-border rounded-xl p-5 flex gap-4 items-center hover:shadow-elegant transition-all">
                <div className="size-12 rounded-full bg-gold-gradient grid place-items-center text-maroon shrink-0"><c.icon/></div>
                <div><p className="text-xs text-muted-foreground">{c.label}</p><p className="font-semibold text-primary">{c.value}</p></div>
              </a>
            ))}
            <a href={wa} target="_blank" rel="noreferrer" className="block bg-primary text-primary-foreground rounded-xl p-5 flex gap-4 items-center hover:bg-primary/90 shadow-elegant">
              <div className="size-12 rounded-full bg-gold-gradient grid place-items-center text-maroon shrink-0"><MessageCircle/></div>
              <div><p className="text-xs opacity-80">WhatsApp Direct</p><p className="font-semibold">Chat with us now</p></div>
            </a>
          </div>
          <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-elegant">
            <h3 className="font-display text-xl font-bold text-primary">Send a Message</h3>
            <div className="space-y-1.5"><Label>Your Name</Label><Input value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></div>
            <div className="space-y-1.5"><Label>Message</Label><Textarea rows={5} value={f.message} onChange={e=>setF({...f,message:e.target.value})}/></div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Send Message</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
