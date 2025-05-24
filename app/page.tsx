import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { checkAuth } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check if the user is authenticated
  const isAuthenticated = await checkAuth();

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    redirect("/dashboard");
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

        <main className="flex-1 container mx-auto px-6 py-12 flex items-center justify-center">
          <div className="max-w-4xl mx-auto text-center space-y-8 bg-white/90 p-8 rounded-lg shadow-lg">
            {/* Logo Above Header */}
            <div className="flex justify-center pt-8">
              <Image
                src="/images/iyte-logo.png"
                alt="IYTE Logo"
                width={120}
                height={120}
                className="rounded-full bg-white p-2"
              />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome to IYTE Graduation Management System
            </h2>
            <p className="text-lg text-muted-foreground">
              Manage your graduation process efficiently. Track requirements,
              submit documents, and stay updated on your graduation status.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-[#990000] hover:bg-[#7a0000]">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </main>

        <footer className="bg-[#990000]/80 text-white py-4 px-6 text-center relative z-10">
          <p>
            © {new Date().getFullYear()} IYTE Graduation Management System. All
            rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
