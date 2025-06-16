"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Send, Users, MessageSquare } from 'lucide-react'
import { sendGraduationApprovalMessage } from "./depsec"
import type { GraduationEntry, GraduationApprovalMessageRequest } from "./depsec"

interface GraduationApprovalComponentProps {
  approvedEntries: GraduationEntry[]
  onMessageSent?: () => void
}

export function GraduationApprovalComponent({ approvedEntries, onMessageSent }: GraduationApprovalComponentProps) {
  const [selectedEntries, setSelectedEntries] = useState<string[]>([])
  const [customMessage, setCustomMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    type: "success" | "error"
    message: string
    details?: any
  } | null>(null)

  const defaultMessage = `Sayın öğrenci,

Mezuniyet başvurunuz Bölüm Sekreterliği tarafından incelenmiş ve onaylanmıştır. 

Mezuniyet işlemlerinizin tamamlanması için gerekli süreçler başlatılmıştır. Herhangi bir sorunuz olması durumunda bölüm sekreterliği ile iletişime geçebilirsiniz.

Başarılar dileriz.

Bölüm Sekreterliği`

  const handleEntrySelection = (entryId: string, checked: boolean) => {
    if (checked) {
      setSelectedEntries((prev) => [...prev, entryId])
    } else {
      setSelectedEntries((prev) => prev.filter((id) => id !== entryId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntries(approvedEntries.map((entry) => entry.id))
    } else {
      setSelectedEntries([])
    }
  }

  const handleSendMessage = async () => {
    if (selectedEntries.length === 0) {
      setResult({
        type: "error",
        message: "Lütfen en az bir öğrenci seçin.",
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const payload: GraduationApprovalMessageRequest = {
        entryIds: selectedEntries,
        message: customMessage.trim() || defaultMessage,
        approvalType: selectedEntries.length === 1 ? "INDIVIDUAL" : "BULK",
      }

      const response = await sendGraduationApprovalMessage(payload)

      if (response.success) {
        setResult({
          type: "success",
          message: `${response.data.approvedCount} öğrenciye mezuniyet onay mesajı başarıyla gönderildi.`,
          details: response.data,
        })
        setSelectedEntries([])
        setCustomMessage("")
        onMessageSent?.()
      } else {
        setResult({
          type: "error",
          message: response.error || "Mesaj gönderilirken bir hata oluştu.",
        })
      }
    } catch (error: any) {
      setResult({
        type: "error",
        message: error.message || "Beklenmeyen bir hata oluştu.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (approvedEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mezuniyet Onay Mesajları
          </CardTitle>
          <CardDescription>Onaylanmış öğrencilere mezuniyet onay mesajı gönderin</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>Henüz onaylanmış öğrenci bulunmamaktadır.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Mezuniyet Onay Mesajları
        </CardTitle>
        <CardDescription>
          Onaylanmış {approvedEntries.length} öğrenciye mezuniyet onay mesajı gönderin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Öğrenci Seçimi */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Öğrenci Seçimi</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedEntries.length === approvedEntries.length}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm">
                Tümünü Seç ({approvedEntries.length})
              </label>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
            {approvedEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={entry.id}
                    checked={selectedEntries.includes(entry.id)}
                    onCheckedChange={(checked) => handleEntrySelection(entry.id, checked as boolean)}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {entry.studentName} {entry.studentLastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {entry.studentId} • {entry.department} • GPA: {entry.gpa}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Onaylandı
                </Badge>
              </div>
            ))}
          </div>

          {selectedEntries.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Users className="h-4 w-4" />
              {selectedEntries.length} öğrenci seçildi
            </div>
          )}
        </div>

        {/* Mesaj İçeriği */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Mesaj İçeriği</h3>
          <Textarea
            placeholder="Özel mesaj yazın (boş bırakılırsa varsayılan mesaj kullanılır)"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={8}
            className="resize-none"
          />
          {!customMessage.trim() && (
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border">
              <strong>Varsayılan mesaj:</strong>
              <pre className="whitespace-pre-wrap mt-2 text-xs">{defaultMessage}</pre>
            </div>
          )}
        </div>

        {/* Sonuç Mesajı */}
        {result && (
          <Alert className={result.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription className={result.type === "success" ? "text-green-800" : "text-red-800"}>
              {result.message}
              {result.details?.failedEntries && result.details.failedEntries.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Başarısız olan öğrenciler:</p>
                  <ul className="list-disc list-inside text-sm">
                    {result.details.failedEntries.map((failed: any) => (
                      <li key={failed.entryId}>
                        {failed.studentName}: {failed.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Gönder Butonu */}
        <Button
          onClick={handleSendMessage}
          disabled={isLoading || selectedEntries.length === 0}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Mesajlar Gönderiliyor...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {selectedEntries.length > 0
                ? `${selectedEntries.length} Öğrenciye Mesaj Gönder`
                : "Öğrenci Seçin"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
