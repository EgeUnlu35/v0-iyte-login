import Image from "next/image";
import { redirect } from "next/navigation";
import { logout, checkAuth, getSession } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  FileText,
  UserCheck,
  Building,
  ClipboardList,
  Settings,
} from "lucide-react";

export default async function DashboardPage() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect("/login?from=/dashboard"); // Redirect to login if not authenticated, specifying from where
  }

  const session = await getSession();
  const userName = session?.name || "User";
  const userRole = session?.role;

  // Role-based navigation items
  const rolePages = [
    {
      role: "STUDENT",
      title: "Student Portal",
      description: "Manage your graduation requirements and track progress",
      href: "/dashboard/student",
      icon: GraduationCap,
      color: "bg-blue-500",
    },
    {
      role: "ADVISOR",
      title: "Advisor Portal",
      description: "Review and approve student graduation plans",
      href: "/dashboard/advisor",
      icon: UserCheck,
      color: "bg-green-500",
    },
    {
      role: "DEPARTMENT_SECRETARY",
      title: "Department Secretary",
      description: "Manage department graduation processes",
      href: "/dashboard/department-secretary",
      icon: FileText,
      color: "bg-purple-500",
    },
    {
      role: "DEPARTMENT_CHAIR",
      title: "Department Chair",
      description: "Oversee department graduation approvals",
      href: "/dashboard/department-chair",
      icon: Building,
      color: "bg-orange-500",
    },
    {
      role: "FACULTY_SECRETARY",
      title: "Faculty Secretary",
      description: "Handle faculty-level graduation procedures",
      href: "/dashboard/faculty-secretary",
      icon: ClipboardList,
      color: "bg-indigo-500",
    },
    {
      role: "STUDENT_AFFAIRS",
      title: "Student Affairs",
      description: "Coordinate student graduation ceremonies",
      href: "/dashboard/student-affairs",
      icon: Users,
      color: "bg-pink-500",
    },
    {
      role: "ADMIN",
      title: "System Admin",
      description: "Manage system settings and user roles",
      href: "/dashboard/admin",
      icon: Settings,
      color: "bg-red-500",
    },
  ];

  // Attempt to redirect based on role
  if (userRole) {
    const targetPage = rolePages.find((page) => page.role === userRole);
    if (targetPage) {
      redirect(targetPage.href);
    }
    // If userRole is present but not in rolePages, they will see the generic dashboard below.
    // This can be useful for new roles not yet mapped or as a fallback.
  }
  // If userRole is not defined (should ideally not happen if session is valid and has role),
  // or if role not found in rolePages, they will see the generic dashboard.

  // The following JSX will only be rendered if no redirect happens.
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-[#990000] text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/images/iyte-logo.png"
            alt="IYTE Logo"
            width={40}
            height={40}
            className="rounded-full hidden sm:block"
          />
          <h1 className="text-xl font-bold">IYTE GMS</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">Welcome, {userName}</span>
          {userRole && (
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {userRole}
            </span>
          )}
          <form action={logout}>
            <Button
              variant="outline"
              className="text-white bg-[#990000] border-white hover:bg-white/10"
              type="submit"
            >
              Logout
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-gray-600">
            Your role specific dashboard could not be determined or is not yet
            available. Please select a portal or contact support if you believe
            this is an error.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rolePages.map((page) => (
            <Link key={page.role} href={page.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-4">
                  <div
                    className={`w-12 h-12 ${page.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <page.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{page.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {page.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="default" // Changed to default for all, as the primary action is to go to that portal
                    className={`w-full bg-[#990000] hover:bg-[#7a0000]`}
                  >
                    Access {page.title}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions Section - Can be kept or removed depending on whether this fallback page is desired */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Profile Settings</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Update your personal information
                </p>
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Help & Support</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Get assistance with the system
                </p>
                <Button variant="outline" size="sm">
                  Get Help
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">System Status</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Check system health and updates
                </p>
                <Button variant="outline" size="sm">
                  View Status
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="bg-[#990000] text-white py-4 px-6 text-center">
        <p>
          © {new Date().getFullYear()} IYTE Graduation Management System. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
}
