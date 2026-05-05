import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Clock, RotateCcw } from "lucide-react";

interface OTPVerifyProps {
  phone: string;
  onVerified: () => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export default function OTPVerify({ phone, onVerified, onBack, isLoading }: OTPVerifyProps) {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Generate and "send" OTP
  useEffect(() => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpSent(true);
    toast.success(`OTP sent to ${phone}\n(Demo OTP: ${newOtp})`);
  }, [phone]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const verifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }
    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }

    setVerifying(true);
    // Simulate API call
    setTimeout(() => {
      if (otp === generatedOtp) {
        toast.success("OTP verified successfully!");
        onVerified();
      } else {
        toast.error("Invalid OTP. Please try again.");
        setVerifying(false);
      }
    }, 1000);
  };

  const resendOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtp("");
    setTimeLeft(120);
    toast.success(`New OTP sent to ${phone}\n(Demo OTP: ${newOtp})`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* OTP Input */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Enter OTP</Label>
        <p className="text-sm text-muted-foreground">
          We've sent a 6-digit code to <span className="font-semibold text-foreground">{phone}</span>
        </p>
        <Input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="000000"
          className="text-center text-2xl font-mono tracking-widest"
          disabled={verifying}
        />
      </div>

      {/* Timer */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        {timeLeft > 0 ? (
          <>
            <span>Expires in {formatTime(timeLeft)}</span>
          </>
        ) : (
          <span className="text-destructive">OTP expired</span>
        )}
      </div>

      {/* Resend OTP */}
      {timeLeft <= 0 ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={resendOtp}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Resend OTP
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          className="w-full text-primary hover:bg-primary/10"
          onClick={resendOtp}
          disabled={timeLeft > 30}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Resend OTP {timeLeft <= 30 && "(available now)"}
        </Button>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={verifying}
            className="flex-1"
          >
            Back
          </Button>
        )}
        <Button
          type="button"
          onClick={verifyOtp}
          disabled={verifying || timeLeft <= 0 || !otp}
          className="flex-1 bg-primary hover:bg-primary/90"
          size="lg"
        >
          {verifying ? "Verifying..." : "Verify & Continue"}
        </Button>
      </div>
    </div>
  );
}
