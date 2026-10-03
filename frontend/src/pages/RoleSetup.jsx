import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import AuthLayout from "../layout/AuthLayout.jsx";
import Button from "../components/ui/Button.jsx";
import { apiRequest } from "../utils/api.js";

const cn = (...classes) => classes.filter(Boolean).join(" ");
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const ALLOWED_FILE_EXTENSIONS = ".jpg,.jpeg,.png,.pdf";

const ROLES = [
  { id: "student", title: "Student", description: "I am a student looking to collaborate, learn, and contribute to research." },
  { id: "faculty", title: "Faculty / Supervisor", description: "I am a faculty member or supervisor looking to lead and collaborate on research." },
];

const STATUS_CONFIG = {
  not_submitted: { label: "Not Submitted", description: "Upload your university ID card and submit it for verification." },
  pending: { label: "Pending Verification", description: "Your ID card has been submitted and is waiting for administrator review." },
  approved: { label: "Approved", description: "Your role has been successfully verified." },
  rejected: { label: "Rejected", description: "Your verification request was not approved. You can upload a new ID card and try again." },
};

export default function RoleSetup() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [role, setRole] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("not_submitted");
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  const currentStatus = STATUS_CONFIG[verificationStatus] || STATUS_CONFIG.not_submitted;

  useEffect(() => {
    let isMounted = true;
    const loadVerificationStatus = async () => {
      setIsLoadingStatus(true);
      setSubmitError("");
      try {
        const response = await apiRequest("/v1/role-verification");
        const verification = response?.data;
        if (!isMounted) return;
        if (verification) {
          setVerificationStatus(verification.status || "not_submitted");
          if (verification.role) setRole(verification.role);
          setRejectionReason(verification.rejection_reason || "");
        } else {
          setVerificationStatus("not_submitted");
        }
      } catch (error) {
        if (!isMounted) return;
        if (error?.status === 404) {
          setVerificationStatus("not_submitted");
          setRejectionReason("");
        } else {
          setSubmitError("Unable to load your verification status. Please refresh the page and try again.");
        }
      } finally {
        if (isMounted) setIsLoadingStatus(false);
      }
    };
    loadVerificationStatus();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateFile = (file) => {
    if (!file) return "Please select an ID card file.";
    if (!ALLOWED_FILE_TYPES.includes(file.type)) return "Unsupported file type. Please upload a JPG, PNG, or PDF file.";
    if (file.size > MAX_FILE_SIZE) return "File is too large. Please upload a file smaller than 5 MB.";
    return "";
  };

  const handleFileSelection = (file) => {
    setFileError("");
    setSubmitError("");
    setSubmitMessage("");
    const validationError = validateFile(file);
    if (validationError) {
      setSelectedFile(null);
      setFilePreview(null);
      setFileError(validationError);
      return;
    }
    if (filePreview) URL.revokeObjectURL(filePreview);
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    } else {
      setFilePreview(null);
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) handleFileSelection(file);
    event.target.value = "";
  };

  const handleBrowseClick = () => fileInputRef.current?.click();
  const handleDragOver = (event) => { event.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (event) => { event.preventDefault(); setIsDragging(false); };
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFileSelection(file);
  };

  const handleRemoveFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setSelectedFile(null);
    setFilePreview(null);
    setFileError("");
    setSubmitError("");
    setSubmitMessage("");
  };

  const handleReplaceFile = () => fileInputRef.current?.click();

  const getApiErrorMessage = (error) => {
    const data = error?.data;
    if (!data) return "Unable to submit your verification request. Please try again.";
    if (data.message) return data.message;
    if (data.errors) {
      const firstError = Object.values(data.errors).flat().find(Boolean);
      if (firstError) return firstError;
    }
    return "Unable to submit your verification request. Please try again.";
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitMessage("");
    setFileError("");
    if (!role) { setSubmitError("Please select your role before submitting."); return; }
    if (!selectedFile) { setFileError("Please upload your university ID card before submitting."); return; }
    const validationError = validateFile(selectedFile);
    if (validationError) { setFileError(validationError); return; }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("role", role);
      formData.append("id_card", selectedFile);
      const response = await apiRequest("/v1/role-verification", { method: "POST", body: formData });
      const verification = response?.data;
      setVerificationStatus(verification?.status || "pending");
      setRejectionReason(verification?.rejection_reason || "");
      setSubmitMessage(response?.message || "Your verification request has been submitted successfully.");
      window.setTimeout(() => { navigate("/dashboard"); }, 800);
    } catch (error) {
      console.error("Role verification submission failed:", error);
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNewVerification = () => {
    handleRemoveFile();
    setVerificationStatus("not_submitted");
    setRejectionReason("");
    setSubmitMessage("");
    setSubmitError("");
  };

  const renderStatus = () => {
    if (verificationStatus === "not_submitted") return null;
    const isApproved = verificationStatus === "approved";
    const isRejected = verificationStatus === "rejected";
    const isPending = verificationStatus === "pending";
    return (
      <div className={cn("mt-5 rounded-xl border p-3", isApproved && "border-[var(--success)]/30 bg-[var(--success-bg)]", isRejected && "border-[var(--error)]/30 bg-[var(--error-bg)]", isPending && "border-[var(--warning)]/30 bg-[var(--warning-bg)]")}>
        <div className="flex items-start gap-3">
          <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", isApproved && "bg-[var(--success-bg)] text-[var(--success)]", isRejected && "bg-[var(--error-bg)] text-[var(--error)]", isPending && "bg-[var(--warning-bg)] text-[var(--warning)]")}>
            {isApproved && <Check className="h-4 w-4" />}
            {isRejected && <X className="h-4 w-4" />}
            {isPending && <ShieldCheck className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("font-semibold", isApproved && "text-[var(--success)]", isRejected && "text-[var(--error)]", isPending && "text-[var(--warning)]")}>{currentStatus.label}</p>
            <p className={cn("mt-1 text-sm", isApproved && "text-[var(--text-secondary)]", isRejected && "text-[var(--text-secondary)]", isPending && "text-[var(--text-secondary)]")}>{currentStatus.description}</p>
            {isRejected && rejectionReason && (
              <div className="mt-3 rounded-lg border border-[var(--error)]/30 bg-[var(--bg-surface)] p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--error)]">Rejection reason</p>
                <p className="mt-1 text-sm leading-5 text-[var(--error)]">{rejectionReason}</p>
              </div>
            )}
            {isRejected && (
              <Button type="button" variant="secondary" className="mt-3" onClick={handleStartNewVerification}>
                <RotateCcw className="mr-2 h-4 w-4" /> Upload New ID Card
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoadingStatus) {
    return (
      <AuthLayout>
        <div className="w-full max-w-2xl">
          <div className="mb-5"><div className="h-4 w-44 animate-pulse rounded bg-[var(--muted)]" /></div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 backdrop-blur-md">
            <div className="h-7 w-48 animate-pulse rounded bg-[var(--muted)]" />
            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-[var(--muted)]" />
            <div className="mt-5 h-20 animate-pulse rounded-2xl bg-[var(--muted)]" />
            <div className="mt-3 h-20 animate-pulse rounded-2xl bg-[var(--muted)]" />
          </div>
        </div>
      </AuthLayout>
    );
  }

  const canUpload = verificationStatus !== "approved" && verificationStatus !== "pending";

  return (
    <AuthLayout>
      <div className="w-full max-w-2xl">
        <button type="button" onClick={() => navigate("/interest-setup")} className="mb-5 inline-flex items-center text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to research interests
        </button>

        <section>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Select your role</h1>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">Choose the role that best describes your position at your institution.</p>
          <div className="mt-3 grid gap-2.5">
            {ROLES.map((item) => {
              const isSelected = role === item.id;
              const roleLocked = verificationStatus === "pending" || verificationStatus === "approved";
              return (
                <button key={item.id} type="button" disabled={roleLocked} onClick={() => { setRole(item.id); setSubmitError(""); }} className={cn("relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200", "bg-[var(--bg-surface)] backdrop-blur-md", "hover:border-blue-200 hover:bg-[var(--bg-surface-elevated)]", "hover:shadow-[0_8px_25px_rgba(37,99,235,0.08)]", roleLocked && "cursor-default opacity-80", isSelected && "border-blue-300 bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-cyan-500/10 shadow-[0_8px_30px_rgba(79,70,229,0.12)] ring-1 ring-blue-200")}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--text-primary)]">{item.title}</p>
                      <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">{item.description}</p>
                    </div>
                    <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200", isSelected ? "border-blue-400 bg-gradient-to-br from-blue-500 via-violet-500 to-cyan-400 shadow-[0_4px_12px_rgba(59,130,246,0.25)]" : "border-[var(--border)] bg-[var(--bg-surface-elevated)]")}>
                      {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {canUpload && (
          <section className="mt-5">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Upload your university ID card</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">Upload a clear image or document showing your name, institution, and role-related information.</p>
            {!selectedFile ? (
              <button type="button" onClick={handleBrowseClick} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={cn("mt-3 flex min-h-40 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-all", "border-[var(--border)] bg-[var(--bg-surface)]", "hover:border-blue-300 hover:bg-blue-50/20", isDragging && "border-blue-400 bg-blue-50/40 shadow-[0_8px_25px_rgba(37,99,235,0.08)]")}>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--text-muted)]">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="font-medium text-[var(--text-primary)]">Drag & drop your ID card here</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">or <span className="font-medium text-blue-600">browse files</span></p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">JPG, JPEG, PNG or PDF • Maximum 5 MB</p>
              </button>
            ) : (
              <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3 backdrop-blur-md">
                <div className="flex items-start gap-3">
                  {filePreview ? (
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface-elevated)]">
                      <img src={filePreview} alt="ID card preview" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--muted)]">
                      {selectedFile.type === "application/pdf" ? (
                        <FileText className="h-7 w-7 text-violet-500" />
                      ) : (
                        <ImageIcon className="h-7 w-7 text-blue-500" />
                      )}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[var(--text-primary)]">{selectedFile.name}</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{formatFileSize(selectedFile.size)}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button type="button" variant="secondary" className="!px-3 !py-1.5 !text-xs" onClick={handleReplaceFile}>
                        <RotateCcw className="mr-2 h-3.5 w-3.5" /> Replace
                      </Button>
                      <button type="button" onClick={handleRemoveFile} className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--error-bg)] hover:text-[var(--error)]">
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {fileError && <p className="mt-2 text-sm font-medium text-[var(--error)]">{fileError}</p>}
            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">Make sure the ID card is clear and all important information is readable. Do not upload unrelated documents.</p>
          </section>
        )}

        {renderStatus()}
        {submitMessage && <div className="mt-3 rounded-xl border border-[var(--success)]/30 bg-[var(--success-bg)] px-4 py-3 text-sm text-[var(--success)]">{submitMessage}</div>}
        {submitError && <div className="mt-3 rounded-xl border border-[var(--error)]/30 bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">{submitError}</div>}

        {verificationStatus === "not_submitted" && (
          <div className="mt-5">
            <Button type="button" className="w-full" size="lg" disabled={!role || !selectedFile || isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? "Submitting..." : (<>Submit for Verification <ChevronRight className="ml-2 h-4 w-4" /></>)}
            </Button>
            <p className="mt-2 text-center text-xs text-[var(--text-muted)]">Your ID card will be reviewed by an administrator before your role is verified.</p>
          </div>
        )}

        {verificationStatus === "pending" && (
          <div className="mt-5 rounded-xl border border-[var(--badge-blue-text)]/30 bg-[var(--badge-blue)] p-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[var(--badge-blue-text)]" />
              <div className="flex-1">
                <p className="font-medium text-[var(--text-primary)]">Verification request submitted</p>
                <p className="text-sm text-[var(--text-secondary)]">Your request is under review. You can continue using ScholarOS while verification is pending.</p>
              </div>
            </div>
            <Button type="button" className="mt-3 w-full" size="lg" onClick={() => navigate("/dashboard")}>
              Continue to Dashboard <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {verificationStatus === "approved" && (
          <div className="mt-5">
            <Button type="button" className="w-full" size="lg" onClick={() => navigate("/dashboard")}>
              Continue to Dashboard <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept={ALLOWED_FILE_EXTENSIONS} className="hidden" onChange={handleFileInputChange} />
      </div>
    </AuthLayout>
  );
}