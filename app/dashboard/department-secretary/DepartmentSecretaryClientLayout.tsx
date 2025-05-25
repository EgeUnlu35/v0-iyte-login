"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import {
  ArrowLeft,
  DownloadCloud,
  FileText,
  Edit3,
  CheckSquare,
  Award,
  Eye,
  AlertTriangle,
  Plus,
  Mail,
  ChevronDown,
  ChevronUp,
  UserCheck,
  FileSignature,
  Send,
  Printer,
  Loader2,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
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
} from "@/app/actions/depsec";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface DepartmentSecretaryClientLayoutProps {
  userName: string;
  graduationLists: GraduationListSummary[];
  error?: string | null;
}

export default function DepartmentSecretaryClientLayout({
  userName,
  graduationLists: initialGraduationLists,
  error: initialError,
}: DepartmentSecretaryClientLayoutProps) {
  const [lists, setLists] = useState(initialGraduationLists);
  const [isUploading, setIsUploading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(
    initialError || null
  );
  const [showUploadForm, setShowUploadForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedListDetail, setSelectedListDetail] =
    useState<GraduationListDetail | null>(null);
  const [isLoadingListDetail, setIsLoadingListDetail] = useState(false);

  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [selectedEntryForCoverLetter, setSelectedEntryForCoverLetter] =
    useState<GraduationEntry | null>(null);
  const [coverLetterNotes, setCoverLetterNotes] = useState("");
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);

  const handleCreateList = async (formData: FormData) => {
    setIsUploading(true);
    setActionError(null);

    try {
      const result = await createGraduationList(formData);

      if (result.success) {
        alert("Graduation list created successfully!");
        setShowUploadForm(false);
        window.location.reload();
      } else {
        setActionError(result.error || "Failed to create graduation list");
      }
    } catch (error) {
      setActionError("An unexpected error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  const handleExport = async (listId: string) => {
    try {
      const result = await exportGraduationList(listId);
      if (result.success) {
        const url = window.URL.createObjectURL(result.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        alert(`File ${result.filename} download initiated.`);
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Failed to export graduation list");
    }
  };

  const handleApproveList = async (listId: string) => {
    if (
      !confirm(
        "Are you sure you want to approve this graduation list? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const result = await approveGraduationList(listId);
      if (result.success) {
        alert(result.message);
        window.location.reload();
      } else {
        setActionError(result.error || "Failed to approve list");
      }
    } catch (error) {
      setActionError("Failed to approve graduation list");
    }
  };

  const handleViewRankings = async (listId: string) => {
    try {
      const result = await getGraduationRankings(listId);
      if (result.success) {
        alert(
          `Rankings loaded for list. Total students: ${result.data.length}`
        );
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Failed to load rankings");
    }
  };

  const handleToggleListDetail = async (listId: string) => {
    if (selectedListId === listId) {
      setSelectedListId(null);
      setSelectedListDetail(null);
    } else {
      setSelectedListId(listId);
      setIsLoadingListDetail(true);
      setActionError(null);
      try {
        const result = await getGraduationList(listId);
        if (result.success && result.data) {
          setSelectedListDetail(result.data);
        } else if (!result.success) {
          setSelectedListDetail(null);
          setActionError(result.error || "Failed to load list details.");
        }
      } catch (err) {
        setSelectedListDetail(null);
        setActionError("An error occurred while fetching list details.");
      } finally {
        setIsLoadingListDetail(false);
      }
    }
  };

  const handleOpenCoverLetterModal = (entry: GraduationEntry) => {
    setSelectedEntryForCoverLetter(entry);
    setCoverLetterNotes(entry.notes || "");
    setShowCoverLetterModal(true);
  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedEntryForCoverLetter) return;

    setIsGeneratingCoverLetter(true);
    setActionError(null);
    try {
      const result = await generateCoverLetter(selectedEntryForCoverLetter.id, {
        notes: coverLetterNotes,
      });
      if (result.success) {
        alert(
          result.data.message ||
            "Cover letter generated and attached successfully!"
        );
        setShowCoverLetterModal(false);
        setSelectedEntryForCoverLetter(null);
        setCoverLetterNotes("");
        if (selectedListId) {
          handleToggleListDetail(selectedListId);
        }
      } else {
        setActionError(result.error || "Failed to generate cover letter.");
      }
    } catch (error) {
      setActionError(
        "An unexpected error occurred while generating cover letter."
      );
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

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
        text: "Completed (Cover Letter Gen.)",
      },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-800",
      text: "Unknown",
    };
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-[#990000] text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/images/iyte-logo.png"
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

      <main className="flex-1 container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Graduation Management</h2>
          <p className="text-gray-600">
            Manage graduation lists, student records, and departmental processes
          </p>
        </div>

        {actionError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}

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
                  <p className="text-sm text-gray-600">
                    Total Students (in lists)
                  </p>
                  <p className="text-2xl font-bold">
                    {lists.reduce((sum, list) => sum + list.entriesCount, 0)}
                  </p>
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
          <Button
            onClick={() => setShowUploadForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Graduation List (CSV)
          </Button>
        </div>

        {showUploadForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Graduation List</CardTitle>
              <CardDescription>
                Upload a CSV file to create a new graduation list
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleCreateList(formData);
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">List Name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="e.g., Spring 2024 Graduates"
                  />
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
                  <Input
                    ref={fileInputRef}
                    id="file"
                    name="file"
                    type="file"
                    accept=".csv"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Creating...
                      </>
                    ) : (
                      "Create List"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUploadForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(list.id)}
                  >
                    <DownloadCloud className="mr-2 h-4 w-4" /> Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApproveList(list.id)}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" /> Approve List
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewRankings(list.id)}
                  >
                    <Award className="mr-2 h-4 w-4" /> View Rankings
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleListDetail(list.id)}
                  >
                    {selectedListId === list.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              {selectedListId === list.id && (
                <CardContent>
                  {isLoadingListDetail && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      Loading entries...
                    </div>
                  )}
                  {actionError && selectedListDetail === null && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{actionError}</AlertDescription>
                    </Alert>
                  )}
                  {selectedListDetail &&
                    selectedListDetail.entries.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="text-lg font-semibold mb-2">
                          Student Entries
                        </h4>
                        <div className="space-y-3">
                          {selectedListDetail.entries.map((entry) => (
                            <Card
                              key={entry.id}
                              className="p-4 flex justify-between items-center"
                            >
                              <div>
                                <p className="font-semibold">
                                  {entry.studentName} {entry.studentLastName} (
                                  {entry.studentId})
                                </p>
                                <p className="text-sm text-gray-600">
                                  Dept: {entry.department} | GPA: {entry.gpa} |
                                  Credits: {entry.creditsEarned}
                                </p>
                                <p className="text-sm">
                                  Status: {getStatusBadge(entry.status)}
                                </p>
                              </div>
                              {entry.status === "APPROVED" && (
                                <Button
                                  onClick={() =>
                                    handleOpenCoverLetterModal(entry)
                                  }
                                  size="sm"
                                  variant="outline"
                                >
                                  <Mail className="mr-2 h-4 w-4" /> Prepare
                                  Cover Letter
                                </Button>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  {selectedListDetail &&
                    selectedListDetail.entries.length === 0 && (
                      <p className="text-sm text-gray-500 mt-4">
                        No student entries in this list.
                      </p>
                    )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </main>

      {selectedEntryForCoverLetter && (
        <Dialog
          open={showCoverLetterModal}
          onOpenChange={setShowCoverLetterModal}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Prepare Cover Letter</DialogTitle>
              <DialogDescription>
                For: {selectedEntryForCoverLetter.studentName}{" "}
                {selectedEntryForCoverLetter.studentLastName} (
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
                <div className="col-span-3">
                  {getStatusBadge(selectedEntryForCoverLetter.status)}
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label
                  htmlFor="coverLetterNotesModal"
                  className="text-right pt-1"
                >
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCoverLetterModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateCoverLetter}
                disabled={isGeneratingCoverLetter}
              >
                {isGeneratingCoverLetter ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Generating...
                  </>
                ) : (
                  <>
                    <FileSignature className="mr-2 h-4 w-4" />
                    Generate & Attach
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <footer className="bg-[#990000] text-white py-4 px-6 text-center">
        <p>
          © {new Date().getFullYear()} IYTE Graduation Management System. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
}
