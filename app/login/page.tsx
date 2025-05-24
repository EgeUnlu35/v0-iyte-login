"use client";

import type React from "react";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { login } from "@/app/actions/auth";
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
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Form state for validation
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Get the 'from' parameter to redirect after login
  const redirectPath = searchParams.get("from") || "/dashboard";

  // Email validation function
  const validateEmail = (
    email: string
  ): { isValid: boolean; error: string | null } => {
    // Check if email is empty
    if (!email) {
      return { isValid: false, error: "Email is required" };
    }

    // Check email length
    if (email.length > 50) {
      return { isValid: false, error: "Email cannot exceed 50 characters" };
    }

    // Check if email contains @
    if (!email.includes("@")) {
      return {
        isValid: false,
        error: "Enter a valid iyte.edu.tr email address",
      };
    }

    // Check domain
    if (
      !email.endsWith("@iyte.edu.tr") &&
      !email.endsWith("@std.iyte.edu.tr")
    ) {
      return { isValid: false, error: "Only @iyte.edu.tr emails are allowed" };
    }

    // Check for invalid characters or spaces
    const validEmailRegex =
      /^[a-zA-Z0-9._-]+@(iyte\.edu\.tr|std\.iyte\.edu\.tr)$/;
    if (!validEmailRegex.test(email)) {
      return {
        isValid: false,
        error: "Enter a valid iyte.edu.tr email address",
      };
    }

    return { isValid: true, error: null };
  };

  // Password validation function
  const validatePassword = (
    password: string
  ): { isValid: boolean; error: string | null } => {
    // Check if password is empty
    if (!password) {
      return { isValid: false, error: "Password is required" };
    }

    // Check password length
    if (password.length < 8) {
      return {
        isValid: false,
        error: "Password must be at least 8 characters",
      };
    }

    // Check for uppercase
    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        error: "Password must contain at least one uppercase letter",
      };
    }

    // Check for lowercase
    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        error: "Password must contain at least one lowercase letter",
      };
    }

    // Check for number
    if (!/[0-9]/.test(password)) {
      return {
        isValid: false,
        error: "Password must contain at least one number",
      };
    }

    // Check for special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return {
        isValid: false,
        error: "Password must contain at least one special character",
      };
    }

    return { isValid: true, error: null };
  };

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    // Only validate if there's input
    if (newEmail) {
      const { error } = validateEmail(newEmail);
      setEmailError(error);
    } else {
      setEmailError(null);
    }
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Only validate if there's input
    if (newPassword) {
      const { error } = validatePassword(newPassword);
      setPasswordError(error);
    } else {
      setPasswordError(null);
    }
  };

  // Effect to handle redirect after successful login
  useEffect(() => {
    if (loginSuccess) {
      // Add a small delay to ensure cookies are set before redirecting
      const redirectTimer = setTimeout(() => {
        // Force a hard navigation instead of client-side navigation
        window.location.href = redirectPath;
      }, 1000);

      return () => clearTimeout(redirectTimer);
    }
  }, [loginSuccess, redirectPath]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(e.currentTarget);

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error);
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error);
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoginSuccess(false);

    try {
      const result = await login(formData);

      if (result?.error) {
        // Show "Invalid credentials" for authentication errors
        if (
          result.error.includes("email or password") ||
          result.error.includes("credentials")
        ) {
          setError("Invalid credentials");
        } else {
          setError(result.error);
        }
        setIsLoading(false);
      } else if (result?.success) {
        setLoginSuccess(true);
        // We'll let the useEffect handle the redirect
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
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
              <CardTitle className="text-2xl font-bold">Login</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            {error && (
              <div className="px-6">
                <Alert variant="destructive">
                  <AlertTitle>Authentication Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
            {loginSuccess && (
              <div className="px-6">
                <Alert variant="default">
                  <AlertTitle>Login Successful</AlertTitle>
                  <AlertDescription>
                    Redirecting to dashboard...
                  </AlertDescription>
                </Alert>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="text" // Changed from email to text to allow custom validation
                    placeholder="your.email@iyte.edu.tr"
                    maxLength={50}
                    required
                    value={email}
                    onChange={handleEmailChange}
                    disabled={isLoading || loginSuccess}
                    className={`bg-white ${emailError ? "border-red-500" : ""}`}
                  />
                  {emailError && (
                    <p className="text-sm text-red-500 mt-1">{emailError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      maxLength={40}
                      required
                      value={password}
                      onChange={handlePasswordChange}
                      disabled={isLoading || loginSuccess}
                      className={`bg-white ${
                        passwordError ? "border-red-500" : ""
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading || loginSuccess}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-[#990000] hover:bg-[#7a0000]"
                  disabled={
                    isLoading || loginSuccess || !!emailError || !!passwordError
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : loginSuccess ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
                <div className="text-center text-sm">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="text-[#990000] hover:underline"
                  >
                    Register
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
