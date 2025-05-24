import Image from "next/image"
import { redirect } from "next/navigation"
import { logout, checkAuth, getSession } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Settings, Users, Database, Shield, Activity, Server } from "lucide-react"

export default async function AdminPage() {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    redirect("/login")
  }

  const session = await getSession()
  const userName = session?.name || "Administrator"

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-[#990000] text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Image
              src="/images/iyte-logo.png"
              alt="IYTE Logo"
              width={40}
              height={40}
              className="rounded-full hidden sm:block"
            />
            <h1 className="text-xl font-bold">System Admin Portal</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">Welcome, {userName}</span>
          <form action={logout}>
            <Button variant="outline" className="text-white bg-[#990000] border-white hover:bg-white/10" type="submit">
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">System Admin Portal</h2>
          <p className="text-gray-600">Manage system settings, users, and monitor system health</p>
        </div>

        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">1,247</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">System Uptime</p>
                  <p className="text-2xl font-bold">99.9%</p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Database Size</p>
                  <p className="text-2xl font-bold">2.4GB</p>
                </div>
                <Database className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Security Alerts</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-3 text-blue-500" />
              <h3 className="font-medium mb-2">User Management</h3>
              <p className="text-sm text-gray-600">Manage user accounts and roles</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Settings className="w-8 h-8 mx-auto mb-3 text-green-500" />
              <h3 className="font-medium mb-2">System Settings</h3>
              <p className="text-sm text-gray-600">Configure system parameters</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Database className="w-8 h-8 mx-auto mb-3 text-purple-500" />
              <h3 className="font-medium mb-2">Database Management</h3>
              <p className="text-sm text-gray-600">Monitor and maintain database</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 mx-auto mb-3 text-orange-500" />
              <h3 className="font-medium mb-2">Security Center</h3>
              <p className="text-sm text-gray-600">Monitor security and access</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Activity className="w-8 h-8 mx-auto mb-3 text-pink-500" />
              <h3 className="font-medium mb-2">System Monitoring</h3>
              <p className="text-sm text-gray-600">View system performance</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Server className="w-8 h-8 mx-auto mb-3 text-indigo-500" />
              <h3 className="font-medium mb-2">Server Management</h3>
              <p className="text-sm text-gray-600">Manage server resources</p>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and recent activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Database Backup</p>
                  <p className="text-sm text-gray-600">Last backup completed successfully</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Healthy</span>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">User Authentication</p>
                  <p className="text-sm text-gray-600">All authentication services running</p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Healthy</span>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">API Services</p>
                  <p className="text-sm text-gray-600">All endpoints responding normally</p>
                  <p className="text-xs text-gray-500">Response time: 120ms avg</p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Healthy</span>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Storage Usage</p>
                  <p className="text-sm text-gray-600">Database storage at 65% capacity</p>
                  <p className="text-xs text-gray-500">2.4GB / 3.7GB used</p>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Monitor</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-[#990000] text-white py-4 px-6 text-center">
        <p>© {new Date().getFullYear()} IYTE Graduation Management System. All rights reserved.</p>
      </footer>
    </div>
  )
}
