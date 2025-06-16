"use client"

import type React from "react"

import Image from "next/image"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DownloadCloud,
  FileText,
  Edit3,
  CheckSquare,
  Award,
  AlertTriangle,
  Plus,
  Mail,
  ChevronDown,
  ChevronUp,
  UserCheck,
  FileSignature,
  Loader2,
  Trash2,
  Upload,
  BookOpen,
  GraduationCap,
} from "lucide-react"
import { logout } from "@/app/actions/auth"
import {
  createGraduationList,
  exportGraduationList,
  approveGraduationList,
  getGraduationRankings,
  getGraduationList,
  generateCoverLetter,
  type GraduationListSummary,
  type GraduationListDetail,
  type GraduationEntry,
  type GraduationEntryStatus,
  updateGraduationEntry,
  type UpdateGraduationEntryPayload,
  getApprovedApplications,
  mapApplicationToGraduationEntry,
  type ApprovedApplication,
  type MapApplicationToEntryRequest,
  deleteGraduationEntry,
  type GraduationRankingItem,
  uploadCurriculum,
} from "@/app/actions/depsec"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DepartmentSecretaryClientLayoutProps {
  userName: string
  graduationLists: GraduationListSummary[]
  error?: string | null
}

export default function DepartmentSecretaryClientLayout({
  userName,
  graduationLists: initialGraduationLists,
  error: initialError,
}: DepartmentSecretaryClientLayoutProps) {
  const [lists, setLists] = useState(initialGraduationLists)
  const [isUploading, setIsUploading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(initialError || null)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Curriculum upload states
  const [showCurriculumUpload, setShowCurriculumUpload] = useState(false)
  const [isUploadingCurriculum, setIsUploadingCurriculum] = useState(false)
  const [curriculumUploadError, setCurriculumUploadError] = useState<string | null>(null)
  const [curriculumUploadSuccess, setCurriculumUploadSuccess] = useState<string | null>(null)
  const [curriculumCourses, setCurriculumCourses] = useState<string[]>([])
  const curriculumFileInputRef = useRef<HTMLInputElement>(null)

  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [selectedListDetail, setSelectedListDetail] = useState<GraduationListDetail | null>(null)
  const [isLoadingListDetail, setIsLoadingListDetail] = useState(false)

  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false)
  const [selectedEntryForCoverLetter, setSelectedEntryForCoverLetter] = useState<GraduationEntry | null>(null)
  const [coverLetterNotes, setCoverLetterNotes] = useState("")
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false)

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<GraduationEntry | null>(null)
  const [editFormValues, setEditFormValues] = useState<UpdateGraduationEntryPayload>({})
  const [isSavingEntry, setIsSavingEntry] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Approved applications states
  const [approvedApplications, setApprovedApplications] = useState<ApprovedApplication[]>([])
  const [isLoadingApprovedApplications, setIsLoadingApprovedApplications] = useState(false)
  const [showApprovedApplicationsView, setShowApprovedApplicationsView] = useState(false)
  const [applicationToMap, setApplicationToMap] = useState<ApprovedApplication | null>(null)
  const [isMapApplicationModalOpen, setIsMapApplicationModalOpen] = useState(false)
  const [selectedGraduationListForMapping, setSelectedGraduationListForMapping] = useState<string>("")
  const [isMappingApplication, setIsMappingApplication] = useState(false)
  const [mapApplicationError, setMapApplicationError] = useState<string | null>(null)

  // Delete entry state
  const [isDeletingEntry, setIsDeletingEntry] = useState<string | null>(null)

  // Rankings modal states
  const [isRankingsModalOpen, setIsRankingsModalOpen] = useState(false)
  const [currentRankings, setCurrentRankings] = useState<GraduationRankingItem[]>([])
  const [isLoadingRankings, setIsLoadingRankings] = useState(false)
  const [rankingsError, setRankingsError] = useState<string | null>(null)
  const [selectedListForRankingDisplay, setSelectedListForRankingDisplay] = useState<GraduationListSummary | null>(null)

  // Curriculum upload handler
  const handleCurriculumUpload = async (formData: FormData) => {
    setIsUploadingCurriculum(true)
    setCurriculumUploadError(null)
    setCurriculumUploadSuccess(null)
    setCurriculumCourses([])

    try {
      const result = await uploadCurriculum(formData)

      if (result.success) {
        setCurriculumUploadSuccess(result.data.message)
        setCurriculumCourses(result.data.curriculumCourses || [])
        setShowCurriculumUpload(false)
        // Reset file input
        if (curriculumFileInputRef.current) {
          curriculumFileInputRef.current.value = ""
        }
      } else {
        setCurriculumUploadError(result.error || "Failed to upload curriculum")
      }
    } catch (error) {
      setCurriculumUploadError("An unexpected error occurred during curriculum upload")
    } finally {
      setIsUploadingCurriculum(false)
    }
  }

  const handleCreateList = async (formData: FormData) => {
    setIsUploading(true)
    setActionError(null)

    try {
      const result = await createGraduationList(formData)

      if (result.success) {
        alert("Graduation list created successfully!")
        setShowUploadForm(false)
        window.location.reload()
      } else {
        setActionError(result.error || "Failed to create graduation list")
      }
    } catch (error) {
      setActionError("An unexpected error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  const handleExport = async (listId: string) => {
    try {
      const result = await exportGraduationList(listId)
      if (result.success) {
        const url = window.URL.createObjectURL(result.blob)
        const a = document.createElement("a")
        a.href = url
        a.download = result.filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        alert(`File ${result.filename} download initiated.`)
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert("Failed to export graduation list")
    }
  }

  const handleApproveList = async (listId: string) => {
    if (!confirm("Are you sure you want to approve this graduation list? This action cannot be undone.")) {
      return
    }

    try {
      const result = await approveGraduationList(listId)
      if (result.success) {
        alert(result.message)
        window.location.reload()
      } else {
        setActionError(result.error || "Failed to approve list")
      }
    } catch (error) {
      setActionError("Failed to approve graduation list")
    }
  }

  const handleViewRankings = async (listId: string) => {
    const listSummary = lists.find((l) => l.id === listId)
    if (!listSummary) {
      setActionError("Could not find list summary for rankings.")
      return
    }
    setSelectedListForRankingDisplay(listSummary)
    setIsRankingsModalOpen(true)
    setIsLoadingRankings(true)
    setRankingsError(null)
    setCurrentRankings([])

    try {
      const result = await getGraduationRankings(listId)
      if (result.success && result.data) {
        setCurrentRankings(result.data)
      } else if (!result.success) {
        setRankingsError(result.error || "Failed to load rankings.")
      }
    } catch (error: any) {
      console.error("handleViewRankings error:", error)
      setRankingsError(error.message || "An unexpected error occurred while loading rankings.")
    } finally {
      setIsLoadingRankings(false)
    }
  }

  const handleToggleListDetail = async (listId: string) => {
    if (selectedListId === listId) {
      setSelectedListId(null)
      setSelectedListDetail(null)
    } else {
      setSelectedListId(listId)
      setIsLoadingListDetail(true)
      setActionError(null)
      try {
        const result = await getGraduationList(listId)
        if (result.success && result.data) {
          setSelectedListDetail(result.data)
        } else if (!result.success) {
          setSelectedListDetail(null)
          setActionError(result.error || "Failed to load list details.")
        }
      } catch (err) {
        setSelectedListDetail(null)
        setActionError("An error occurred while fetching list details.")
      } finally {
        setIsLoadingListDetail(false)
      }
    }
  }

  const handleOpenCoverLetterModal = (entry: GraduationEntry) => {
    setSelectedEntryForCoverLetter(entry)
    setCoverLetterNotes(entry.notes || "")
    setShowCoverLetterModal(true)
  }

  const handleGenerateCoverLetter = async () => {
    if (!selectedEntryForCoverLetter) return

    setIsGeneratingCoverLetter(true)
    setActionError(null)
    try {
      const result = await generateCoverLetter(selectedEntryForCoverLetter.id, {
        notes: coverLetterNotes,
      })
      if (result.success) {
        alert(result.data.message || "Cover letter generated and sent for signatures!")
        setShowCoverLetterModal(false)
        setSelectedEntryForCoverLetter(null)
        setCoverLetterNotes("")
        if (selectedListId) {
          handleToggleListDetail(selectedListId)
        }
      } else {
        setActionError(result.error || "Failed to generate cover letter.")
      }
    } catch (error) {
      setActionError("An unexpected error occurred while generating cover letter.")
    } finally {
      setIsGeneratingCoverLetter(false)
    }
  }

  const handleOpenEditModal = (entry: GraduationEntry) => {
    setEditingEntry(entry)
    setEditFormValues({
      studentId: entry.studentId,
      studentName: entry.studentName,
      studentLastName: entry.studentLastName,
      gpa: entry.gpa,
      graduationDate: entry.graduationDate,
      department: entry.department,
      creditsEarned: entry.creditsEarned,
      status: entry.status as UpdateGraduationEntryPayload["status"],
      notes: entry.notes,
    })
    setEditError(null)
    setIsEditModalOpen(true)
  }

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditFormValues((prev) => ({
      ...prev,
      [name]:
        name === "gpa" || name === "creditsEarned"
          ? Number.parseFloat(value)
          : name === "status"
            ? (value as UpdateGraduationEntryPayload["status"])
            : value,
    }))
  }

  const handleSaveEntryChanges = async () => {
    if (!editingEntry) return

    setIsSavingEntry(true)
    setEditError(null)

    if (
      editFormValues.gpa !== undefined &&
      (isNaN(editFormValues.gpa) || editFormValues.gpa < 0 || editFormValues.gpa > 4)
    ) {
      setEditError("Invalid GPA. Must be a number between 0 and 4.")
      setIsSavingEntry(false)
      return
    }

    try {
      const payload: UpdateGraduationEntryPayload = { ...editFormValues }
      const result = await updateGraduationEntry(editingEntry.id, payload)

      if (result.success) {
        alert("Graduation entry updated successfully!")
        setIsEditModalOpen(false)
        setEditingEntry(null)
        if (selectedListId) {
          const scrollY = window.scrollY
          setIsLoadingListDetail(true)
          const freshDetails = await getGraduationList(selectedListId)
          if (freshDetails.success && freshDetails.data) {
            setSelectedListDetail(freshDetails.data)
          } else if (!freshDetails.success) {
            setActionError(freshDetails.error || "Failed to refresh list details.")
            setSelectedListDetail(null)
          }
          setIsLoadingListDetail(false)
          window.scrollTo(0, scrollY)
        }
      } else {
        if (result.details?.errors) {
          const fieldErrors = result.details.errors
            .map((err: { field: string; message: string }) => `${err.field}: ${err.message}`)
            .join("\n")
          setEditError((result.error || "Validation Failed") + "\n" + fieldErrors)
        } else {
          setEditError(result.error || "Failed to update entry.")
        }
      }
    } catch (error: any) {
      setEditError(error.message || "An unexpected error occurred while saving the entry.")
    } finally {
      setIsSavingEntry(false)
    }
  }

  const handleFetchApprovedApplications = async () => {
    setIsLoadingApprovedApplications(true)
    setActionError(null)
    setMapApplicationError(null)
    try {
      const result = await getApprovedApplications()
      if (result.success && result.data) {
        setApprovedApplications(result.data.applications || [])
      } else if (!result.success) {
        setActionError(result.error || "Failed to fetch approved applications.")
        setApprovedApplications([])
      }
    } catch (err: any) {
      console.error("Error fetching approved applications:", err)
      setActionError("An error occurred while fetching approved applications.")
      setApprovedApplications([])
    } finally {
      setIsLoadingApprovedApplications(false)
    }
  }

  const handleOpenMapApplicationModal = (app: ApprovedApplication) => {
    setApplicationToMap(app)
    setSelectedGraduationListForMapping(lists.length > 0 ? lists[0].id : "")
    setMapApplicationError(null)
    setIsMapApplicationModalOpen(true)
  }

  const handleConfirmMapApplication = async () => {
    if (!applicationToMap || !selectedGraduationListForMapping) {
      setMapApplicationError("Application or Graduation List not selected.")
      return
    }
    setIsMappingApplication(true)
    setMapApplicationError(null)
    try {
      const payload: MapApplicationToEntryRequest = {
        applicationId: applicationToMap.id,
        graduationListId: selectedGraduationListForMapping,
      }
      const result = await mapApplicationToGraduationEntry(payload)
      if (result.success) {
        alert(result.data.message || "Application successfully mapped to graduation list!")
        setIsMapApplicationModalOpen(false)
        setApplicationToMap(null)
        await handleFetchApprovedApplications()
        if (selectedListId === selectedGraduationListForMapping) {
          const currentListId = selectedListId
          await handleToggleListDetail(currentListId)
          await handleToggleListDetail(currentListId)
        }
      } else {
        setMapApplicationError(result.error || "Failed to map application.")
      }
    } catch (err: any) {
      setMapApplicationError(err.message || "An unexpected error occurred during mapping.")
    } finally {
      setIsMappingApplication(false)
    }
  }

  const handleDeleteGraduationEntry = async (entryId: string, entryName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the entry for ${entryName} (${entryId})? This action cannot be undone.`,
      )
    ) {
      return
    }

    setIsDeletingEntry(entryId)
    setActionError(null)

    try {
      const result = await deleteGraduationEntry(entryId)
      if (result.success) {
        alert(result.message || "Graduation entry deleted successfully!")
        if (selectedListId) {
          const scrollY = window.scrollY
          setIsLoadingListDetail(true)
          const freshDetails = await getGraduationList(selectedListId)
          if (freshDetails.success && freshDetails.data) {
            setSelectedListDetail(freshDetails.data)
          } else if (!freshDetails.success) {
            setActionError(freshDetails.error || "Failed to refresh list details after deletion.")
            setSelectedListDetail(null)
          }
          setIsLoadingListDetail(false)
          window.scrollTo(0, scrollY)
        }
      } else {
        setActionError(result.error || "Failed to delete graduation entry.")
      }
    } catch (error: any) {
      setActionError(error.message || "An unexpected error occurred while deleting the entry.")
    } finally {
      setIsDeletingEntry(null)
    }
  }

  const getStatusBadge = (status: GraduationEntryStatus) => {
    const statusConfig = {
      NEW: { color: "bg-blue-100 text-blue-800", text: "New" },
      UNDER_REVIEW: {
        color: "bg-yellow-100 text-yellow-800",
        text: "Under Review",
      },
      PENDING_ISSUES: {
        color: "bg-orange-100 text-orange-800",
        text: "Pending Issues",
      },
      APPROVED: { color: "bg-green-100 text-green-800", text: "Approved" },
      REJECTED: { color: "bg-red-100 text-red-800", text: "Rejected" },
      COMPLETED: {
        color: "bg-purple-100 text-purple-800",
        text: "Completed (Cover Letter Generated)",
      },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-800",
      text: "Unknown",
    }
    return <Badge className={config.color}>{config.text}</Badge>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-[#990000] text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/placeholder.svg?height=40&width=40"
              alt="IYTE Logo"
              width={40}
              height={40}
              className="rounded-full hidden sm:block"
            />
            <h1 className="text-xl font-bold">Department Secretary Portal</h1>
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

      <main className="flex-1 container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Graduation Management</h2>
          <p className="text-gray-600">
            Manage graduation lists, student records, curriculum, and departmental processes
          </p>
        </div>

        {actionError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}

        {curriculumUploadSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckSquare className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {curriculumUploadSuccess}
              {curriculumCourses.length > 0 && (
                <span className="block mt-2">Processed {curriculumCourses.length} courses from curriculum.</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="cover-letters">Cover Letters</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Lists</p>
                      <p className="text-2xl font-bold">{lists.length}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Students (in lists)</p>
                      <p className="text-2xl font-bold">{lists.reduce((sum, list) => sum + list.entriesCount, 0)}</p>
                    </div>
                    <Award className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Issues</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <Edit3 className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <CheckSquare className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4 mb-8">
              <Button onClick={() => setShowUploadForm(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create New Graduation List (CSV)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowApprovedApplicationsView(!showApprovedApplicationsView)
                  if (!showApprovedApplicationsView && approvedApplications.length === 0) {
                    handleFetchApprovedApplications()
                  }
                }}
                className="flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                {showApprovedApplicationsView ? "Hide" : "View"} Approved Applications
                {isLoadingApprovedApplications && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
            </div>

            {showUploadForm && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Create New Graduation List</CardTitle>
                  <CardDescription>Upload a CSV file to create a new graduation list</CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      handleCreateList(formData)
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="name">List Name</Label>
                      <Input id="name" name="name" required placeholder="e.g., Spring 2024 Graduates" />
                    </div>
                    <div>
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Brief description of this graduation list"
                      />
                    </div>
                    <div>
                      <Label htmlFor="file">CSV File</Label>
                      <Input ref={fileInputRef} id="file" name="file" type="file" accept=".csv" required />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isUploading}>
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                          </>
                        ) : (
                          "Create List"
                        )}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowUploadForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {showApprovedApplicationsView && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Approved Student Applications</CardTitle>
                  <CardDescription>
                    These applications have been approved by advisors and are ready to be mapped to a graduation list.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingApprovedApplications && (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading applications...
                    </div>
                  )}
                  {!isLoadingApprovedApplications && actionError && !mapApplicationError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{actionError}</AlertDescription>
                    </Alert>
                  )}
                  {!isLoadingApprovedApplications && approvedApplications.length === 0 && !actionError && (
                    <p className="text-center text-muted-foreground py-4">No approved applications found.</p>
                  )}
                  {!isLoadingApprovedApplications && approvedApplications.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                              Student
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                              Department
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                              GPA / Credits
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                              Submission Date
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {approvedApplications.map((app) => (
                            <tr key={app.id}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {app.studentName} {app.studentLastName}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{app.studentId}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {app.departmentName}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {app.gpaOverall.toFixed(2)} / {app.totalCredits}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {new Date(app.submissionDate).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenMapApplicationModal(app)}
                                  disabled={isMappingApplication || lists.length === 0}
                                  title={
                                    lists.length === 0 ? "Create a graduation list first" : "Add to Graduation List"
                                  }
                                >
                                  <Plus className="mr-1 h-3.5 w-3.5" /> Add to List
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="space-y-6">
              {lists.map((list) => (
                <Card key={list.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>{list.name}</CardTitle>
                      <CardDescription>
                        {list.description} ({list.entriesCount} students)
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleExport(list.id)}>
                        <DownloadCloud className="mr-2 h-4 w-4" /> Export CSV
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleApproveList(list.id)}>
                        <CheckSquare className="mr-2 h-4 w-4" /> Approve List
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewRankings(list.id)}>
                        <Award className="mr-2 h-4 w-4" /> View Rankings
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleToggleListDetail(list.id)}>
                        {isLoadingListDetail ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : selectedListId === list.id ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {selectedListId === list.id && !isLoadingListDetail && selectedListDetail && (
                    <div className="mt-4 space-y-3 px-1">
                      <CardDescription className="px-3">
                        {selectedListDetail.description || "No description for this list."}
                      </CardDescription>
                      <div className="border rounded-md">
                        {selectedListDetail.entries.length === 0 ? (
                          <p className="p-4 text-center text-sm text-muted-foreground">
                            This graduation list has no entries.
                          </p>
                        ) : (
                          selectedListDetail.entries.map((entry) => (
                            <div
                              key={entry.id}
                              className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {entry.studentName} {entry.studentLastName} ({entry.studentId})
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  GPA: {entry.gpa.toFixed(2)} | Credits: {entry.creditsEarned} | Dept:{" "}
                                  {entry.department}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Grad Date: {new Date(entry.graduationDate).toLocaleDateString()}
                                </p>
                                {entry.notes && (
                                  <p className="text-xs text-amber-700 dark:text-amber-500 mt-1 break-words">
                                    Notes: {entry.notes}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-1.5 ml-2 flex-shrink-0">
                                {getStatusBadge(entry.status)}
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleOpenEditModal(entry)}
                                  disabled={entry.status === "COMPLETED" || isSavingEntry || isLoadingListDetail}
                                  title={entry.status === "COMPLETED" ? "Cannot edit completed entries" : "Edit Entry"}
                                  className="h-7 w-7"
                                >
                                  {isSavingEntry && editingEntry?.id === entry.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Edit3 className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() =>
                                    handleDeleteGraduationEntry(
                                      entry.id,
                                      `${entry.studentName} ${entry.studentLastName}`,
                                    )
                                  }
                                  disabled={
                                    isDeletingEntry === entry.id || entry.status === "COMPLETED" || isLoadingListDetail
                                  }
                                  title={
                                    entry.status === "COMPLETED" ? "Cannot delete completed entries" : "Delete Entry"
                                  }
                                  className="h-7 w-7"
                                >
                                  {isDeletingEntry === entry.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                                {entry.status === "APPROVED" && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleOpenCoverLetterModal(entry)}
                                    title="Generate Cover Letter & Complete"
                                    disabled={isGeneratingCoverLetter || isLoadingListDetail}
                                    className="h-7 w-7"
                                  >
                                    <Mail className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Curriculum Management
                </CardTitle>
                <CardDescription>
                  Upload and manage curriculum PDF files. The system will analyze the curriculum and extract course
                  information for student graduation validation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <Button onClick={() => setShowCurriculumUpload(true)} className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Curriculum PDF
                  </Button>
                </div>

                {curriculumUploadError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{curriculumUploadError}</AlertDescription>
                  </Alert>
                )}

                {showCurriculumUpload && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Upload Curriculum PDF</CardTitle>
                      <CardDescription>
                        Upload a PDF file containing the curriculum. The system will extract course information
                        automatically.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          const formData = new FormData(e.currentTarget)
                          handleCurriculumUpload(formData)
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="curriculumFile">Curriculum PDF File</Label>
                          <Input
                            ref={curriculumFileInputRef}
                            id="curriculumFile"
                            name="file"
                            type="file"
                            accept=".pdf"
                            required
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Only PDF files are supported. The system will analyze the document and extract course names.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" disabled={isUploadingCurriculum}>
                            {isUploadingCurriculum ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload & Process
                              </>
                            )}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowCurriculumUpload(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {curriculumCourses.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Extracted Courses</CardTitle>
                      <CardDescription>
                        The following courses were extracted from the uploaded curriculum:
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {curriculumCourses.map((course, index) => (
                          <Badge key={index} variant="outline" className="justify-start">
                            {course}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Application Management
                </CardTitle>
                <CardDescription>
                  Manage graduation applications from students and approved applications from advisors.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Applications are automatically processed when students submit them through the system and when
                  advisors approve them. Use the "View Approved Applications" button in the Overview tab to see
                  applications ready for processing.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cover-letters" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="w-5 h-5" />
                  Cover Letter Management
                </CardTitle>
                <CardDescription>
                  Generate and manage cover letters for approved graduation entries. Cover letters go through a signing
                  workflow.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Cover Letter Workflow</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Department Secretary generates cover letter for approved student</li>
                      <li>Cover letter is sent to Department Chair for signature</li>
                      <li>After Department Chair signs, it goes to Faculty Secretary</li>
                      <li>After Faculty Secretary signs, it goes to Student Affairs</li>
                      <li>Once all signatures are collected, the process is complete</li>
                    </ol>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    To generate a cover letter, find an approved student in the graduation lists and click the mail icon
                    next to their entry.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Cover Letter Modal */}
      {selectedEntryForCoverLetter && (
        <Dialog open={showCoverLetterModal} onOpenChange={setShowCoverLetterModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Generate Cover Letter</DialogTitle>
              <DialogDescription>
                For: {selectedEntryForCoverLetter.studentName} {selectedEntryForCoverLetter.studentLastName} (
                {selectedEntryForCoverLetter.studentId})
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="studentNameModal" className="text-right">
                  Student
                </Label>
                <Input
                  id="studentNameModal"
                  value={`${selectedEntryForCoverLetter.studentName} ${selectedEntryForCoverLetter.studentLastName}`}
                  readOnly
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="studentIdModal" className="text-right">
                  Student ID
                </Label>
                <Input
                  id="studentIdModal"
                  value={selectedEntryForCoverLetter.studentId}
                  readOnly
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="departmentModal" className="text-right">
                  Department
                </Label>
                <Input
                  id="departmentModal"
                  value={selectedEntryForCoverLetter.department}
                  readOnly
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gpaModal" className="text-right">
                  GPA
                </Label>
                <Input
                  id="gpaModal"
                  value={selectedEntryForCoverLetter.gpa.toString()}
                  readOnly
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="statusModal" className="text-right">
                  Status
                </Label>
                <div className="col-span-3">{getStatusBadge(selectedEntryForCoverLetter.status)}</div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="coverLetterNotesModal" className="text-right pt-1">
                  Notes
                </Label>
                <Textarea
                  id="coverLetterNotesModal"
                  value={coverLetterNotes}
                  onChange={(e) => setCoverLetterNotes(e.target.value)}
                  className="col-span-3"
                  placeholder="Add any additional comments or notes for the cover letter..."
                />
              </div>
            </div>
            {actionError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{actionError}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCoverLetterModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateCoverLetter} disabled={isGeneratingCoverLetter}>
                {isGeneratingCoverLetter ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <FileSignature className="mr-2 h-4 w-4" />
                    Generate & Send for Signatures
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Entry Modal */}
      {isEditModalOpen && editingEntry && (
        <Dialog
          open={isEditModalOpen}
          onOpenChange={(isOpen) => {
            if (isSavingEntry) return
            setIsEditModalOpen(isOpen)
            if (!isOpen) setEditingEntry(null)
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Edit Entry: {editingEntry.studentName} {editingEntry.studentLastName} ({editingEntry.studentId})
              </DialogTitle>
              <DialogDescription>
                Update the details for this graduation entry. Fields marked with * are required for this status.
              </DialogDescription>
            </DialogHeader>
            {editError && (
              <Alert variant="destructive" className="mb-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold">Error updating entry:</p>
                  <pre className="text-xs whitespace-pre-wrap">{editError}</pre>
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto px-1">
              <div className="grid grid-cols-3 items-center gap-3">
                <Label htmlFor="studentName" className="text-right">
                  First Name
                </Label>
                <Input
                  id="studentName"
                  name="studentName"
                  value={editFormValues.studentName ?? ""}
                  onChange={handleEditFormChange}
                  className="col-span-2"
                  disabled={isSavingEntry}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-3">
                <Label htmlFor="studentLastName" className="text-right">
                  Last Name
                </Label>
                <Input
                  id="studentLastName"
                  name="studentLastName"
                  value={editFormValues.studentLastName ?? ""}
                  onChange={handleEditFormChange}
                  className="col-span-2"
                  disabled={isSavingEntry}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-3">
                <Label htmlFor="studentId" className="text-right">
                  Student ID
                </Label>
                <Input
                  id="studentId"
                  name="studentId"
                  value={editFormValues.studentId ?? ""}
                  onChange={handleEditFormChange}
                  className="col-span-2"
                  disabled={isSavingEntry}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-3">
                <Label htmlFor="gpa" className="text-right">
                  GPA
                </Label>
                <Input
                  id="gpa"
                  name="gpa"
                  type="number"
                  step="0.01"
                  value={editFormValues.gpa ?? ""}
                  onChange={handleEditFormChange}
                  className="col-span-2"
                  disabled={isSavingEntry}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-3">
                <Label htmlFor="creditsEarned" className="text-right">
                  Credits Earned
                </Label>
                <Input
                  id="creditsEarned"
                  name="creditsEarned"
                  type="number"
                  value={editFormValues.creditsEarned ?? ""}
                  onChange={handleEditFormChange}
                  className="col-span-2"
                  disabled={isSavingEntry}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-3">
                <Label htmlFor="graduationDate" className="text-right">
                  Graduation Date
                </Label>
                <Input
                  id="graduationDate"
                  name="graduationDate"
                  type="date"
                  value={editFormValues.graduationDate?.split("T")[0] ?? ""}
                  onChange={handleEditFormChange}
                  className="col-span-2"
                  disabled={isSavingEntry}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-3">
                <Label htmlFor="department" className="text-right">
                  Department
                </Label>
                <Input
                  id="department"
                  name="department"
                  value={editFormValues.department ?? ""}
                  onChange={handleEditFormChange}
                  className="col-span-2"
                  disabled={isSavingEntry}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-3">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <select
                  id="status"
                  name="status"
                  value={editFormValues.status ?? ""}
                  onChange={handleEditFormChange}
                  className="col-span-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={isSavingEntry}
                >
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="PENDING_ISSUES">Pending Issues</option>
                  {editingEntry.status === "NEW" && <option value="NEW">New</option>}
                  {editingEntry.status === "APPROVED" && <option value="APPROVED">Approved</option>}
                  {editingEntry.status === "REJECTED" && <option value="REJECTED">Rejected</option>}
                </select>
              </div>
              <div className="grid grid-cols-3 items-start gap-3">
                <Label htmlFor="notes" className="text-right pt-2">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={editFormValues.notes ?? ""}
                  onChange={handleEditFormChange}
                  className="col-span-2"
                  placeholder="Enter any notes for this entry (e.g., reasons for pending issues)"
                  rows={3}
                  disabled={isSavingEntry}
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-between pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSavingEntry}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveEntryChanges} disabled={isSavingEntry || isLoadingListDetail}>
                {isSavingEntry ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Map Application Modal */}
      {isMapApplicationModalOpen && applicationToMap && (
        <Dialog
          open={isMapApplicationModalOpen}
          onOpenChange={(isOpen) => {
            if (isMappingApplication) return
            setIsMapApplicationModalOpen(isOpen)
            if (!isOpen) setApplicationToMap(null)
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Map Application to Graduation List</DialogTitle>
              <DialogDescription>
                Add {applicationToMap.studentName} {applicationToMap.studentLastName} ({applicationToMap.studentId}) to
                an existing graduation list.
              </DialogDescription>
            </DialogHeader>
            {mapApplicationError && (
              <Alert variant="destructive" className="my-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold">Error mapping application:</p>
                  <pre className="text-xs whitespace-pre-wrap">{mapApplicationError}</pre>
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-4 py-3">
              <div>
                <Label htmlFor="graduationListSelect">Select Graduation List</Label>
                <select
                  id="graduationListSelect"
                  name="graduationListSelect"
                  value={selectedGraduationListForMapping}
                  onChange={(e) => setSelectedGraduationListForMapping(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={isMappingApplication || lists.length === 0}
                >
                  {lists.length === 0 ? (
                    <option value="" disabled>
                      No graduation lists available. Create one first.
                    </option>
                  ) : (
                    lists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name} ({list.entriesCount} entries)
                      </option>
                    ))
                  )}
                </select>
                {lists.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    You must create a graduation list before mapping applications.
                  </p>
                )}
              </div>
              <div className="text-sm border p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                <p>
                  <strong>Student:</strong> {applicationToMap.studentName} {applicationToMap.studentLastName} (
                  {applicationToMap.studentId})
                </p>
                <p>
                  <strong>Department:</strong> {applicationToMap.departmentName}
                </p>
                <p>
                  <strong>GPA:</strong> {applicationToMap.gpaOverall.toFixed(2)} | <strong>Credits:</strong>{" "}
                  {applicationToMap.totalCredits}
                </p>
                <p>
                  <strong>Submitted:</strong> {new Date(applicationToMap.submissionDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <DialogFooter className="sm:justify-between pt-3">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isMappingApplication}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={handleConfirmMapApplication}
                disabled={isMappingApplication || !selectedGraduationListForMapping || lists.length === 0}
              >
                {isMappingApplication ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirm & Add to List
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Rankings Modal */}
      {isRankingsModalOpen && selectedListForRankingDisplay && (
        <Dialog
          open={isRankingsModalOpen}
          onOpenChange={(isOpen) => {
            setIsRankingsModalOpen(isOpen)
            if (!isOpen) {
              setCurrentRankings([])
              setRankingsError(null)
              setSelectedListForRankingDisplay(null)
            }
          }}
        >
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Graduation Rankings: {selectedListForRankingDisplay.name}</DialogTitle>
              <DialogDescription>
                Students ranked by GPA for the graduation list: {selectedListForRankingDisplay.description}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[70vh] overflow-y-auto">
              {isLoadingRankings && (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading rankings...
                </div>
              )}
              {!isLoadingRankings && rankingsError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold">Error loading rankings:</p>
                    <pre className="text-xs whitespace-pre-wrap">{rankingsError}</pre>
                  </AlertDescription>
                </Alert>
              )}
              {!isLoadingRankings && !rankingsError && currentRankings.length === 0 && (
                <p className="text-center text-muted-foreground py-6">No rankings available or the list is empty.</p>
              )}
              {!isLoadingRankings && !rankingsError && currentRankings.length > 0 && (
                <div className="border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Rank
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Student
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          GPA
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Department
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Graduation Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {currentRankings.map((item) => (
                        <tr key={item.studentId}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {item.rank}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {item.studentName} {item.studentLastName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.studentId}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {item.gpa.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {item.department}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(item.graduationDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <footer className="bg-[#990000] text-white py-4 px-6 text-center">
        <p>© {new Date().getFullYear()} IYTE Graduation Management System. All rights reserved.</p>
      </footer>
    </div>
  )
}
