"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { register } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");

  // Email validation
  const validateEmail = (email: string) => {
    const validDomains = ["@iyte.edu.tr", "@std.iyte.edu.tr"];
    return validDomains.some((domain) => email.endsWith(domain));
  };

  // Password validation
  const validatePassword = (password: string) => {
    let strength = 0;
    const feedback = [];

    if (password.length >= 8) {
      strength += 25;
    } else {
      feedback.push("Password should be at least 8 characters");
    }

    if (/[A-Z]/.test(password)) {
      strength += 25;
    } else {
      feedback.push("Include at least one uppercase letter");
    }

    if (/[a-z]/.test(password)) {
      strength += 25;
    } else {
      feedback.push("Include at least one lowercase letter");
    }

    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength += 25;
    } else {
      feedback.push("Include at least one number or special character");
    }

    setPasswordStrength(strength);
    setPasswordFeedback(feedback.join(", "));

    return strength >= 75;
  };

  // Password match validation
  const validatePasswordMatch = () => {
    return password === confirmPassword;
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return "bg-red-500";
    if (passwordStrength < 50) return "bg-orange-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  async function handleSubmit(formData: FormData) {
    // Client-side validation
    const emailValue = formData.get("email") as string;
    const passwordValue = formData.get("password") as string;
    const confirmPasswordValue = formData.get("confirmPassword") as string;

    // Reset error
    setError(null);

    // Validate email domain
    if (!validateEmail(emailValue)) {
      setError("Email must end with @iyte.edu.tr or @std.iyte.edu.tr");
      return;
    }

    // Validate password strength
    if (!validatePassword(passwordValue)) {
      setError("Password is too weak. " + passwordFeedback);
      return;
    }

    // Validate password match
    if (passwordValue !== confirmPasswordValue) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        router.push("/login");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/iyte-manzara.jpg"
          alt="IYTE Campus"
          fill
          className="object-cover"
          quality={100}
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="bg-[#990000] text-white py-4 px-6">
          <div className="container mx-auto">
            <Link
              href="/"
              className="text-xl font-bold flex items-center gap-2"
            >
              <Image
                src="/images/iyte-logo.png"
                alt="IYTE Logo"
                width={40}
                height={40}
                className="rounded-full hidden sm:block"
              />
              IYTE GMS
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md bg-white/95 shadow-xl">
            <CardHeader className="space-y-1 items-center">
              <Image
                src="/images/iyte-logo.png"
                alt="IYTE Logo"
                width={100}
                height={100}
                className="mb-4"
              />
              <CardTitle className="text-2xl font-bold">Register</CardTitle>
              <CardDescription>
                Create an account to manage your graduation process
              </CardDescription>
            </CardHeader>
            {error && (
              <div className="px-6">
                <Alert variant="destructive">
                  <AlertTitle>Registration Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
            <form action={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="First Name"
                      maxLength={40}
                      required
                      disabled={isLoading}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Last Name"
                      maxLength={40}
                      required
                      disabled={isLoading}
                      className="bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@iyte.edu.tr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={40}
                    required
                    disabled={isLoading}
                    className="bg-white"
                  />
                  {email && !validateEmail(email) && (
                    <p className="text-sm text-red-500 mt-1">
                      Email must end with @iyte.edu.tr or @std.iyte.edu.tr
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        validatePassword(e.target.value);
                      }}
                      maxLength={40}
                      required
                      disabled={isLoading}
                      className="bg-white"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {password && (
                    <>
                      <div className="space-y-1 mt-2">
                        <div className="flex justify-between text-xs">
                          <span>Password strength:</span>
                          <span>
                            {passwordStrength < 25 && "Very Weak"}
                            {passwordStrength >= 25 &&
                              passwordStrength < 50 &&
                              "Weak"}
                            {passwordStrength >= 50 &&
                              passwordStrength < 75 &&
                              "Medium"}
                            {passwordStrength >= 75 && "Strong"}
                          </span>
                        </div>
                        <Progress
                          value={passwordStrength}
                          className={getPasswordStrengthColor()}
                        />
                      </div>
                      {passwordFeedback && (
                        <p className="text-xs text-amber-600 mt-1">
                          {passwordFeedback}
                        </p>
                      )}
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      maxLength={40}
                      required
                      disabled={isLoading}
                      className="bg-white"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {confirmPassword && !validatePasswordMatch() && (
                    <p className="text-sm text-red-500 mt-1">
                      Passwords do not match
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-[#990000] hover:bg-[#7a0000]"
                  disabled={
                    isLoading ||
                    (email && !validateEmail(email)) ||
                    (password && passwordStrength < 75) ||
                    (confirmPassword && !validatePasswordMatch())
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-[#990000] hover:underline"
                  >
                    Login
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </main>
        <footer className="bg-[#990000]/80 text-white py-4 px-6 text-center relative">
          <p>
            © {new Date().getFullYear()} IYTE Graduation Management System. All
            rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
