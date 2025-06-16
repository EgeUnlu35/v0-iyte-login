"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DebugPanelProps {
  onTestUpload: () => void
  onTestValidate: () => void
}

export default function DebugPanel({ onTestUpload, onTestValidate }: DebugPanelProps) {
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (info: string) => {
    setDebugInfo((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
  }

  const testApiConnection = async () => {
    addDebugInfo("Testing API connection...")

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.iyte-gms.com"
      addDebugInfo(`API URL: ${apiUrl}`)

      const response = await fetch(`${apiUrl}/health`, { method: "GET" })
      addDebugInfo(`Health check response: ${response.status}`)

      if (response.ok) {
        const data = await response.text()
        addDebugInfo(`Health check data: ${data}`)
      }
    } catch (error: any) {
      addDebugInfo(`API connection error: ${error.message}`)
    }
  }

  const testButtonClick = () => {
    addDebugInfo("Button clicked - this proves the button is working!")
    onTestUpload()
  }

  return (
    <Card className="mb-6 border-orange-200">
      <CardHeader>
        <CardTitle className="text-orange-600">Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testButtonClick} variant="outline" size="sm">
            Test Upload Button
          </Button>
          <Button onClick={onTestValidate} variant="outline" size="sm">
            Test Validate Button
          </Button>
          <Button onClick={testApiConnection} variant="outline" size="sm">
            Test API Connection
          </Button>
          <Button onClick={() => setDebugInfo([])} variant="outline" size="sm">
            Clear Debug
          </Button>
        </div>

        {debugInfo.length > 0 && (
          <Alert>
            <AlertDescription>
              <div className="text-xs font-mono">
                {debugInfo.map((info, index) => (
                  <div key={index}>{info}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
