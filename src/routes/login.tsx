import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { setSession, getProfiles } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Heart, Loader, Clock, RotateCcw } from "lucide-react";
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Login — Sattiyar Matrimony" }] }),
});

function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpTimer, setOtpTimer] = useState(0);
  const [error, setError] = useState("");

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);

  // Initialize reCAPTCHA on component mount
  useEffect(() => {
    if (!recaptchaVerifierRef.current && typeof window !== "undefined") {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: () => {
              console.log("reCAPTCHA verified");
            },
            "expired-callback": () => {
              toast.error("reCAPTCHA expired. Please try again.");
              recaptchaVerifierRef.current?.clear();
              recaptchaVerifierRef.current = null;
            },
          }
        );
      } catch (err) {
        console.error("reCAPTCHA error:", err);
      }
    }

    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  // OTP expiry timer (2 minutes)
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (otpTimer === 0 && step === "otp" && confirmationResultRef.current) {
      setError("OTP expired. Please request a new one.");
      setStep("phone");
      setOtp("");
      confirmationResultRef.current = null;
    }
  }, [otpTimer, step]);

  // Resend timer (30 seconds)
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Format phone input to Indian format
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 10) value = value.slice(0, 10);
    setPhone(value);
    setError("");
  };

  // Format OTP input
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 6) value = value.slice(0, 6);
    setOtp(value);
    setError("");
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formattedPhone = `+91${phone}`;

      if (!recaptchaVerifierRef.current) {
        throw new Error("reCAPTCHA not initialized. Please refresh and try again.");
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifierRef.current
      );

      confirmationResultRef.current = confirmationResult;
      setStep("otp");
      setOtpTimer(120); // 2 minutes
      setResendTimer(30); // 30 seconds before resend
      toast.success("OTP sent to +91" + phone);
    } catch (err: any) {
      console.error("Send OTP error:", err);

      // Handle Firebase errors
      if (err.code === "auth/invalid-phone-number") {
        setError("Invalid phone number format");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("Phone authentication is not enabled");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your connection.");
      } else {
        setError(err.message || "Failed to send OTP. Please try again.");
      }

      // Clear reCAPTCHA on error
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      if (!confirmationResultRef.current) {
        throw new Error("OTP session expired. Please request a new OTP.");
      }

      const userCredential = await confirmationResultRef.current.confirm(otp);

      if (userCredential.user) {
        const profiles = getProfiles();
        const foundUser = profiles.find((p) => p.phone === phone);

        if (!foundUser) {
          toast.error("No account found. Redirecting to registration...");
          navigate({ to: "/register" });
          return;
        }

        // Login successful
        setSession(foundUser.id);
        window.dispatchEvent(new Event("sm-auth"));
        toast.success("✓ Welcome back!");
        navigate({
          to: foundUser.email === "admin@sattiyar.com" ? "/admin" : "/dashboard",
        });
      }
    } catch (err: any) {
      console.error("Verify OTP error:", err);

      if (err.code === "auth/invalid-verification-code") {
        setError("Invalid OTP. Please check and try again.");
      } else if (err.code === "auth/code-expired") {
        setError("OTP expired. Please request a new one.");
        setStep("phone");
        setOtp("");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your connection.");
      } else {
        setError(err.message || "Failed to verify OTP. Please try again.");
      }
    } finally {
      setVerifying(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setOtp("");
    setResendTimer(30);
    setOtpTimer(120);
    await handleSendOTP();
  };

  // Format timer display
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-[80vh] grid place-items-center px-4 py-12 bg-sandal-gradient">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-elegant border border-border p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="size-14 rounded-full bg-gold-gradient grid place-items-center mx-auto mb-4 shadow-gold">
            <Heart className="size-6 text-maroon" fill="currentColor" />
          </div>
          <h1 className="font-display text-3xl font-bold text-primary">Welcome Back</h1>
          <p className="text-muted-foreground text-sm mt-2">
            {step === "phone"
              ? "Sign in with your phone number"
              : "Enter the OTP sent to +91" + phone}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Phone Step */}
        {step === "phone" ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <div className="flex items-center mt-2">
                <span className="px-3 py-2 bg-muted text-muted-foreground border border-border rounded-l-lg font-medium">
                  +91
                </span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  className="rounded-l-none font-mono"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Enter 10-digit Indian phone number
              </p>
            </div>

            <Button
              onClick={handleSendOTP}
              disabled={loading || phone.length !== 10}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader className="mr-2 size-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">OR</span>
              </div>
            </div>

            <Button
              onClick={() => {
                const profiles = getProfiles();
                if (profiles.length > 0) {
                  const user = profiles[0];
                  setSession(user.id);
                  window.dispatchEvent(new Event("sm-auth"));
                  toast.success("Demo login successful");
                  navigate({ to: "/dashboard" });
                }
              }}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Demo Login
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              New here?{" "}
              <Link
                to="/register"
                className="text-primary font-semibold hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        ) : (
          /* OTP Step */
          <div className="space-y-4">
            <div>
              <Label htmlFor="otp" className="text-sm font-medium">
                Enter OTP
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={handleOtpChange}
                maxLength={6}
                className="mt-2 font-mono text-center text-2xl tracking-widest font-bold"
                disabled={verifying}
              />
              <p className="text-xs text-muted-foreground mt-1">
                6-digit code sent to your phone
              </p>
            </div>

            {/* Timer Display */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-muted-foreground">
                <Clock className="size-4 mr-1" />
                OTP expires in: <span className="font-mono font-semibold ml-1">{formatTimer(otpTimer)}</span>
              </div>
            </div>

            <Button
              onClick={handleVerifyOTP}
              disabled={verifying || otp.length !== 6}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
              size="lg"
            >
              {verifying ? (
                <>
                  <Loader className="mr-2 size-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>

            {/* Resend OTP */}
            <Button
              onClick={handleResendOTP}
              disabled={resendTimer > 0 || loading}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {resendTimer > 0 ? (
                <>
                  <RotateCcw className="mr-2 size-4" />
                  Resend in {formatTimer(resendTimer)}
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 size-4" />
                  Resend OTP
                </>
              )}
            </Button>

            <Button
              onClick={() => {
                setStep("phone");
                setPhone("");
                setOtp("");
                setError("");
                confirmationResultRef.current = null;
              }}
              variant="ghost"
              className="w-full"
              size="lg"
            >
              Change Phone Number
            </Button>
          </div>
        )}

        {/* reCAPTCHA Container */}
        <div id="recaptcha-container" className="mt-4" />
      </div>
    </div>
  );
}
