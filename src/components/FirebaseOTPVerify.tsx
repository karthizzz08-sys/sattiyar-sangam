import { useState, useEffect, useRef } from "react";
import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Clock, RotateCcw, Loader } from "lucide-react";

interface FirebaseOTPVerifyProps {
  onSuccess: (phoneNumber: string) => void;
  onCancel?: () => void;
}

export default function FirebaseOTPVerify({ onSuccess, onCancel }: FirebaseOTPVerifyProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState("");
  
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);

  // Initialize reCAPTCHA
  useEffect(() => {
    if (!recaptchaVerifierRef.current && typeof window !== "undefined") {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible", // Use "normal" if you want visible reCAPTCHA
          callback: () => {
            console.log("reCAPTCHA verified");
          },
          "expired-callback": () => {
            toast.error("reCAPTCHA expired. Please try again.");
            recaptchaVerifierRef.current?.clear();
            recaptchaVerifierRef.current = null;
          },
        });
      } catch (err) {
        console.error("reCAPTCHA initialization error:", err);
      }
    }

    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
      }
    };
  }, []);

  // Timer for OTP expiry and resend
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Validate phone number (India format)
  const validatePhone = (phoneNumber: string) => {
    // Remove all non-digits
    const cleaned = phoneNumber.replace(/[^0-9]/g, "");
    
    // Check if it's valid Indian phone number (10 digits)
    if (cleaned.length !== 10) {
      return { valid: false, error: "Phone number must be 10 digits" };
    }
    
    return { valid: true, formatted: `+91${cleaned}` };
  };

  // Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone.trim()) {
      setError("Please enter phone number");
      return;
    }

    const validation = validatePhone(phone);
    if (!validation.valid) {
      setError(validation.error || "Invalid phone number");
      return;
    }

    setLoading(true);
    try {
      if (!recaptchaVerifierRef.current) {
        throw new Error("reCAPTCHA not initialized");
      }

      const formattedPhone = validation.formatted!;
      console.log("Sending OTP to:", formattedPhone);

      // Sign in with phone number
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifierRef.current
      );

      confirmationResultRef.current = confirmationResult;
      setStep("otp");
      setTimeLeft(120); // 2-minute timer for OTP
      toast.success("OTP sent successfully!");
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      
      // Handle specific Firebase errors
      if (err.code === "auth/invalid-phone-number") {
        setError("Invalid phone number format");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("Phone authentication is not enabled. Contact admin.");
      } else {
        setError(err.message || "Failed to send OTP. Please try again.");
      }
      
      // Clear reCAPTCHA on error
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter 6-digit OTP");
      return;
    }

    if (!confirmationResultRef.current) {
      setError("Session expired. Please request OTP again.");
      setStep("phone");
      return;
    }

    setVerifying(true);
    try {
      console.log("Verifying OTP...");
      await confirmationResultRef.current.confirm(otp);
      
      toast.success("Phone number verified successfully!");
      
      // Get the phone number from the result
      const formattedPhone = phone.replace(/[^0-9]/g, "");
      onSuccess(`+91${formattedPhone}`);
    } catch (err: any) {
      console.error("Error verifying OTP:", err);

      if (err.code === "auth/invalid-verification-code") {
        setError("Invalid OTP. Please check and try again.");
      } else if (err.code === "auth/code-expired") {
        setError("OTP has expired. Please request a new one.");
        setStep("phone");
      } else {
        setError(err.message || "Failed to verify OTP. Please try again.");
      }
    } finally {
      setVerifying(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError("");
    setOtp("");
    
    const validation = validatePhone(phone);
    if (!validation.valid) {
      setError(validation.error || "Invalid phone number");
      return;
    }

    setLoading(true);
    try {
      // Clear and reinitialize reCAPTCHA
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
      }
      
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => console.log("reCAPTCHA verified for resend"),
      });

      const formattedPhone = validation.formatted!;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifierRef.current
      );

      confirmationResultRef.current = confirmationResult;
      setTimeLeft(120);
      toast.success("OTP resent successfully!");
    } catch (err: any) {
      console.error("Error resending OTP:", err);
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isResendAvailable = timeLeft <= 30 && timeLeft > 0;
  const isResendDisabled = timeLeft > 30;

  return (
    <div className="space-y-6">
      {/* reCAPTCHA Container */}
      <div id="recaptcha-container" />

      {/* Step 1: Phone Number */}
      {step === "phone" && (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base font-semibold">
              Phone Number (India)
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-muted-foreground">+91</span>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                  setPhone(cleaned);
                }}
                placeholder="9876543210"
                maxLength={10}
                disabled={loading}
                className="text-lg font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your 10-digit mobile number
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || phone.length !== 10}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Sending OTP...
              </>
            ) : (
              "Send OTP"
            )}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="w-full"
            >
              Cancel
            </Button>
          )}
        </form>
      )}

      {/* Step 2: OTP Verification */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-base font-semibold">
              Enter OTP
            </Label>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to <span className="font-semibold text-foreground">+91{phone}</span>
            </p>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              disabled={verifying}
              className="text-center text-3xl font-mono tracking-widest"
            />
          </div>

          {/* Timer and Status */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {timeLeft > 0 ? (
                <span>Expires in {formatTime(timeLeft)}</span>
              ) : (
                <span className="text-destructive">OTP expired</span>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Resend Button */}
          <Button
            type="button"
            variant={isResendAvailable ? "default" : "ghost"}
            onClick={handleResendOTP}
            disabled={isResendDisabled || verifying || loading}
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {isResendAvailable ? "Resend OTP" : `Resend available in ${formatTime(timeLeft)}`}
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError("");
                setTimeLeft(0);
              }}
              disabled={verifying}
              className="flex-1"
            >
              Change Number
            </Button>
            <Button
              type="submit"
              disabled={verifying || otp.length !== 6 || timeLeft <= 0}
              className="flex-1 bg-primary hover:bg-primary/90"
              size="lg"
            >
              {verifying ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
