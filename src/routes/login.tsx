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

declare global {
  interface Window {
    grecaptcha?: { reset: (id?: number) => void };
  }
}

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
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializingRef = useRef(false);

  // Check Firebase Configuration on mount
  useEffect(() => {
    const isDev = import.meta.env.DEV;
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    
    console.log("[Login] Checking Firebase configuration...");
    console.log("[Login] Environment:", isDev ? "Development" : "Production");
    console.log("[Login] API Key present:", !!apiKey && !apiKey.includes("MISSING"));
    
    if (!apiKey || apiKey.includes("MISSING")) {
      console.error(
        "[Login] ❌ Firebase not configured!\n" +
        (isDev
          ? "Add VITE_FIREBASE_API_KEY to .env.local"
          : "Add VITE_FIREBASE_API_KEY to Vercel environment variables")
      );
      setIsConfigured(false);
      setError(
        "⚠️ Firebase configuration is incomplete.\n" +
        (isDev
          ? "Add your Firebase credentials to .env.local and restart the dev server."
          : "Check browser console for detailed instructions.")
      );
    }
  }, []);

  // Initialize reCAPTCHA Verifier - Production ready
  useEffect(() => {
    const initRecaptcha = async () => {
      // Prevent multiple initialization attempts
      if (isInitializingRef.current || recaptchaVerifierRef.current) {
        return;
      }

      if (typeof window === "undefined") {
        return;
      }

      // Ensure container exists
      const container = document.getElementById("recaptcha-container");
      if (!container) {
        console.warn("reCAPTCHA container not found, will retry...");
        return;
      }

      isInitializingRef.current = true;

      try {
        // Clear any previous instances
        if (window.grecaptcha) {
          try {
            window.grecaptcha.reset();
          } catch (e) {
            console.warn("Could not reset grecaptcha:", e);
          }
        }

        // Initialize new RecaptchaVerifier
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {
            console.log("[reCAPTCHA] Verification successful");
          },
          "expired-callback": () => {
            console.log("[reCAPTCHA] Expired");
            clearRecaptcha();
          },
          "error-callback": () => {
            console.error("[reCAPTCHA] Error occurred");
            clearRecaptcha();
            toast.error("reCAPTCHA verification failed. Please try again.");
          },
        });

        setRecaptchaReady(true);
        console.log("[reCAPTCHA] Initialized successfully");
      } catch (err) {
        const error = err as Error;
        console.error("[reCAPTCHA] Initialization error:", error.message);

        // Provide helpful error messages
        if (error.message.includes("container")) {
          setError("reCAPTCHA container error. Please refresh the page.");
        } else if (error.message.includes("API")) {
          setError("reCAPTCHA API not loaded. Check Firebase configuration.");
        } else {
          setError("reCAPTCHA initialization failed. Please refresh and try again.");
        }

        recaptchaVerifierRef.current = null;
      } finally {
        isInitializingRef.current = false;
      }
    };

    // Delay initialization to ensure DOM is ready
    const timer = setTimeout(initRecaptcha, 100);

    return () => {
      clearTimeout(timer);
      // Don't clear recaptcha on unmount - might cause issues
    };
  }, []);

  // Clear reCAPTCHA safely
  const clearRecaptcha = () => {
    try {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
      setRecaptchaReady(false);
    } catch (err) {
      console.warn("Error clearing reCAPTCHA:", err);
    }
  };

  // Reset reCAPTCHA after OTP send (prepare for potential resend)
  const resetRecaptcha = () => {
    try {
      clearRecaptcha();
      // Re-initialize for next attempt
      recaptchaVerifierRef.current = null;
      isInitializingRef.current = false;
      setRecaptchaReady(false);
      
      // Force re-initialization on next send attempt
      setTimeout(() => {
        const container = document.getElementById("recaptcha-container");
        if (container && window.grecaptcha) {
          try {
            window.grecaptcha.reset();
          } catch (e) {
            console.warn("Could not reset grecaptcha:", e);
          }
        }
      }, 500);
    } catch (err) {
      console.warn("Error resetting reCAPTCHA:", err);
    }
  };

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

  // Send OTP - Production ready with reCAPTCHA fix
  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formattedPhone = `+91${phone}`;
      const isDev = import.meta.env.DEV;

      console.log("[OTP Send] Starting with phone:", formattedPhone);
      console.log("[OTP Send] Environment:", isDev ? "localhost" : "production");
      console.log("[OTP Send] reCAPTCHA ready:", recaptchaReady);
      console.log("[OTP Send] reCAPTCHA verifier exists:", !!recaptchaVerifierRef.current);

      // Check Firebase config is loaded
      if (!auth) {
        throw new Error(
          "Firebase not initialized. Check browser console for configuration errors."
        );
      }

      // Check reCAPTCHA is ready
      if (!recaptchaVerifierRef.current || !recaptchaReady) {
        const errorMsg = "reCAPTCHA not ready. Please wait 2 seconds and try again.";
        console.error("[OTP Send]", errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      console.log("[OTP Send] Calling Firebase signInWithPhoneNumber...");
      
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifierRef.current
      );

      console.log("[OTP Send] ✅ Success! OTP sent.");
      confirmationResultRef.current = confirmationResult;
      setStep("otp");
      setOtpTimer(120); // 2 minutes
      setResendTimer(30); // 30 seconds before resend
      toast.success("✓ OTP sent to +91" + phone);
      
      // Reset reCAPTCHA for potential resend
      resetRecaptcha();
    } catch (err) {
      const firebaseErr = err as FirebaseAuthError | Error;
      console.error("[OTP Send] Error Details:", {
        code: "code" in firebaseErr ? firebaseErr.code : "unknown",
        message: firebaseErr.message,
        name: firebaseErr.name,
      });

      // Handle errors with helpful messages
      const errorCode = "code" in firebaseErr ? firebaseErr.code : "";
      const errorMsg = firebaseErr.message || "";
      const isDev = import.meta.env.DEV;
      const productionDomain = "https://sattiyar-sangam.vercel.app";
      const localDomain = "http://localhost:5173";
      const currentDomain = isDev ? localDomain : productionDomain;

      if (errorCode === "auth/invalid-phone-number") {
        setError(
          "❌ Invalid phone number format.\n" +
          "Please enter 10-digit Indian number (without +91)"
        );
      } else if (errorCode === "auth/too-many-requests") {
        setError(
          "❌ Too many login attempts.\n" +
          "Please wait 1 hour before trying again."
        );
      } else if (errorCode === "auth/operation-not-allowed") {
        setError(
          "❌ Phone authentication is not enabled in Firebase Console.\n" +
          "Fix: Enable Phone sign-in in Firebase Authentication > Sign-in method"
        );
      } else if (errorCode === "auth/network-request-failed") {
        setError("❌ Network error. Please check your internet connection.");
      } else if (errorCode === "auth/invalid-api-key") {
        setError(
          "❌ Firebase API Key is invalid or missing.\n" +
          (isDev
            ? "Fix: Add VITE_FIREBASE_API_KEY to .env.local"
            : "Fix: Add VITE_FIREBASE_API_KEY to Vercel environment variables")
        );
      } else if (errorCode === "auth/internal-error") {
        // This is the main error we're fixing
        console.error("[OTP Send] INTERNAL ERROR - Likely Firebase configuration issue");
        setError(
          "❌ Firebase configuration error (auth/internal-error)\n\n" +
          "Fix these in Firebase Console:\n" +
          "1. ✅ Phone Authentication enabled\n" +
          "2. ✅ reCAPTCHA v2 configured\n" +
          "3. ✅ Authorized domains includes:\n" +
          `   ${currentDomain}\n` +
          "4. Refresh page and try again"
        );
      } else if (errorCode === "auth/invalid-app-credential") {
        setError(
          "❌ Firebase credentials error.\n" +
          "Fix: Check Firebase API key is valid in " +
          (isDev ? ".env.local" : "Vercel environment variables")
        );
      } else if (errorCode === "auth/app-not-authorized") {
        setError(
          "❌ App domain not authorized in Firebase.\n" +
          `Fix: Add ${currentDomain} to\n` +
          "Firebase Console > Authentication > Settings > Authorized domains"
        );
      } else if (
        errorMsg.includes("reCAPTCHA") ||
        errorMsg.includes("recaptcha") ||
        errorMsg.toLowerCase().includes("user_disabled")
      ) {
        console.error("[OTP Send] reCAPTCHA error:", errorMsg);
        setError(
          "❌ reCAPTCHA verification failed.\n\n" +
          "Fix: Whitelist domain in Firebase:\n" +
          `${currentDomain}\n\n` +
          "Firebase Console > Authentication >\n" +
          "Phone > reCAPTCHA configuration"
        );
      } else {
        setError(
          `❌ ${errorMsg || "Failed to send OTP"}\n\n` +
          "Check:\n" +
          "1. Firebase Configuration loaded (see console)\n" +
          "2. Your domain is authorized\n" +
          "3. Phone Authentication enabled"
        );
      }

      // Clear and reset reCAPTCHA on error
      try {
        if (recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current.clear();
        }
      } catch (clearErr) {
        console.warn("[OTP Send] Error clearing reCAPTCHA:", clearErr);
      }
      recaptchaVerifierRef.current = null;
      isInitializingRef.current = false;
      setRecaptchaReady(false);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP - Production ready
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      if (!confirmationResultRef.current) {
        const errorMsg = "OTP session expired. Please request a new OTP.";
        console.error("[OTP Verify]", errorMsg);
        setError(errorMsg);
        setStep("phone");
        setOtp("");
        setVerifying(false);
        return;
      }

      console.log("[OTP Verify] Confirming OTP...");
      const userCredential = await confirmationResultRef.current.confirm(otp);

      if (userCredential.user) {
        console.log("[OTP Verify] Firebase auth successful");
        const profiles = getProfiles();
        const foundUser = profiles.find((p) => p.phone === phone);

        if (!foundUser) {
          console.log("[OTP Verify] User not registered, redirecting to register");
          toast.error("No account found. Redirecting to registration...");
          navigate({ to: "/register" });
          return;
        }

        // Login successful
        console.log("[OTP Verify] Login successful for user:", foundUser.id);
        setSession(foundUser.id);
        window.dispatchEvent(new Event("sm-auth"));
        toast.success("✓ Welcome back!");
        navigate({
          to: foundUser.email === "admin@sattiyar.com" ? "/admin" : "/dashboard",
        });
      }
    } catch (err) {
      const firebaseErr = err as FirebaseAuthError;
      console.error("[OTP Verify] Error:", {
        code: firebaseErr.code,
        message: firebaseErr.message,
      });

      const errorCode = firebaseErr.code || "";
      const errorMsg = firebaseErr.message || "";

      if (errorCode === "auth/invalid-verification-code") {
        setError("Invalid OTP. Please check and try again.");
      } else if (errorCode === "auth/code-expired") {
        setError("OTP expired. Please request a new one.");
        setStep("phone");
        setOtp("");
      } else if (errorCode === "auth/network-request-failed") {
        setError("Network error. Please check your connection.");
      } else if (errorCode === "auth/internal-error") {
        setError(
          "Firebase error during verification. Please check your connection and try again."
        );
      } else {
        setError(
          errorMsg || "Failed to verify OTP. Please try again."
        );
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

        {/* Error Message - with proper multi-line handling */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 whitespace-pre-wrap leading-relaxed">{error}</p>
          </div>
        )}

        {/* reCAPTCHA Status */}
        {step === "phone" && !recaptchaReady && !loading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 flex items-center">
              <Loader className="size-3 mr-2 animate-spin" />
              Initializing security verification...
            </p>
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
              disabled={loading || phone.length !== 10 || !recaptchaReady || !isConfigured}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
              size="lg"
              title={
                !isConfigured
                  ? "Firebase not configured - check console"
                  : !recaptchaReady
                  ? "Initializing reCAPTCHA..."
                  : ""
              }
            >
              {loading ? (
                <>
                  <Loader className="mr-2 size-4 animate-spin" />
                  Sending OTP...
                </>
              ) : !recaptchaReady ? (
                <>
                  <Loader className="mr-2 size-4 animate-spin" />
                  Initializing...
                </>
              ) : !isConfigured ? (
                <>
                  Firebase Not Configured
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

        {/* reCAPTCHA Container - MUST be present for initialization */}
        {/* Do not remove or hide this container */}
        <div
          id="recaptcha-container"
          ref={containerRef}
          className="mt-6 flex justify-center"
          style={{ minHeight: "20px" }}
        />
      </div>
    </div>
  );
}
