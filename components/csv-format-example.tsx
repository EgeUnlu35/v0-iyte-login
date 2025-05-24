"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

export default function CSVFormatExample() {
  const handleDownloadExample = () => {
    const csvContent = `email,role,studentId
john.doe@std.iyte.edu.tr,STUDENT,20210001
jane.smith@iyte.edu.tr,ADMIN,
prof.wilson@iyte.edu.tr,FACULTY,
advisor.brown@iyte.edu.tr,ADVISOR,`

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "allowed_users_example.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          CSV Format Example
        </CardTitle>
        <CardDescription>Download a sample CSV file to see the correct format</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
            <div className="font-semibold text-gray-700 mb-2">Example CSV content:</div>
            <div className="space-y-1">
              <div>email,role,studentId</div>
              <div>john.doe@std.iyte.edu.tr,STUDENT,20210001</div>
              <div>jane.smith@iyte.edu.tr,ADMIN,</div>
              <div>prof.wilson@iyte.edu.tr,FACULTY,</div>
              <div>advisor.brown@iyte.edu.tr,ADVISOR,</div>
            </div>
          </div>
          <Button onClick={handleDownloadExample} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download Example CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
