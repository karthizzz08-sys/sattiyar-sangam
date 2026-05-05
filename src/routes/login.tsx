import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { setSession, getProfiles } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import OTPVerify from "@/components/OTPVerify";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Login — Sattiyar Matrimony" }] }),
});

function Login() {
  const [step, setStep] = useState<"email-phone" | "otp">("email-phone");
  const [id, setId] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  const handleEmailPhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) {
      toast.error("Please enter email or phone number");
      return;
    }

    // Find user by email or phone
    const profiles = getProfiles();
    let foundUser = null;

    // Check if input is email or phone
    const isEmail = id.includes("@");
    
    if (isEmail) {
      // Search by email
      foundUser = profiles.find(p => p.email === id);
      if (!foundUser) {
        toast.error("No account found with this email address");
        return;
      }
    } else {
      // Search by phone number
      const inputPhone = id.replace(/[^0-9]/g, "");
      foundUser = profiles.find(p => p.phone === inputPhone);
      
      if (!foundUser) {
        toast.error("No account found with this phone number");
        return;
      }

      // Verify the phone number matches (same phone used for registration)
      if (foundUser.phone !== inputPhone) {
        toast.error("Phone number does not match your registered number. Please use the same phone number you registered with.");
        return;
      }
    }

    if (!foundUser) {
      toast.error("User not found. Please register first.");
      return;
    }

    // Set user and phone for OTP
    setUser(foundUser);
    setTempPhone(foundUser.phone);
    setStep("otp");
  };

  const handleOtpVerified = () => {
    if (user) {
      setSession(user.id);
      window.dispatchEvent(new Event("sm-auth"));
      toast.success("Welcome back!");
      navigate({ to: user.email === "admin@sattiyar.com" ? "/admin" : "/dashboard" });
    }
  };

  return (
    <div className="min-h-[80vh] grid place-items-center px-4 py-12 bg-sandal-gradient">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-elegant border border-border p-8">
        <div className="text-center mb-6">
          <div className="size-14 rounded-full bg-gold-gradient grid place-items-center mx-auto mb-3 shadow-gold"><Heart className="size-6 text-maroon" fill="currentColor"/></div>
          <h1 className="font-display text-3xl font-bold text-primary">Welcome Back</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {step === "email-phone" ? "Sign in with OTP" : "Verify with OTP"}
          </p>
        </div>

        {/* Step 1: Email or Phone */}
        {step === "email-phone" && (
          <form onSubmit={handleEmailPhoneSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-base font-semibold">Email or Phone</Label>
              <Input 
                value={id} 
                onChange={e=>setId(e.target.value)} 
                placeholder="priya@example.com or 9876500001"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">Enter your registered email address or phone number</p>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" size="lg">Send OTP</Button>
            <p className="text-sm text-center text-muted-foreground">New here? <Link to="/register" className="text-primary font-semibold hover:underline">Create account</Link></p>
            <p className="text-xs text-center text-muted-foreground pt-2 border-t border-border">Demo: priya@example.com or 9876500001 · Admin: admin@sattiyar.com</p>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === "otp" && (
          <OTPVerify
            phone={tempPhone}
            onVerified={handleOtpVerified}
            onBack={() => setStep("email-phone")}
          />
        )}
      </div>
    </div>
  );
}
