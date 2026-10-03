import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronDown,
  ArrowLeft,
  Mail,
  UserRound,
  CalendarDays,
  GraduationCap,
  Maximize2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { apiRequest } from "../../utils/api.js";

const statusConfig = {
  Pending: {
    icon: Clock3,
    className:
      "bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)]/30",
  },
  Approved: {
    icon: CheckCircle2,
    className:
      "bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]/30",
  },
  Rejected: {
    icon: XCircle,
    className:
      "bg-[var(--error-bg)] text-[var(--error)] border-[var(--error)]/30",
  },
};

function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.Pending;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${config.className}`}
    >
      <Icon size={12} />
      {status}
    </span>
  );
}

function SummaryCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            {label}
          </p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {value}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--badge-blue)] text-[var(--badge-blue-text)]">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-page)] p-3">
      <div className="flex items-center gap-2 text-[var(--text-muted)]">
        <Icon size={14} />
        <span className="text-[9px] font-bold uppercase tracking-[0.12em]">
          {label}
        </span>
      </div>
      <p className="mt-1.5 break-words text-sm font-semibold text-[var(--text-primary)]">
        {value || "—"}
      </p>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRole(role) {
  if (!role) return "—";
  const normalized = role.toLowerCase();
  if (normalized === "faculty" || normalized === "supervisor")
    return "Faculty/Supervisor";
  if (normalized === "student") return "Student";
  return role;
}

function formatStatus(status) {
  if (!status) return "Pending";
  const normalized = status.toLowerCase();
  if (normalized === "pending") return "Pending";
  if (normalized === "approved") return "Approved";
  if (normalized === "rejected") return "Rejected";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function normalizeVerification(request) {
  return {
    id: request.id,
    name: request.user?.name || request.user?.full_name || "Unknown User",
    email: request.user?.email || "—",
    institution: request.user?.institution || "—",
    role: formatRole(request.role),
    submittedAt: formatDate(request.submitted_at),
    status: formatStatus(request.status),
    rejectionReason: request.rejection_reason || null,
    reviewedAt: formatDate(request.reviewed_at),
    idCardPath: request.id_card?.path || request.id_card_path || null,
    idCardAvailable:
      request.id_card?.available ?? Boolean(request.id_card_path),
  };
}

export default function VerificationDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [idCardUrl, setIdCardUrl] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadVerificationRequests = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiRequest("/v1/admin/verifications");
      const requests = Array.isArray(response?.data) ? response.data : [];
      setVerificationRequests(requests.map(normalizeVerification));
    } catch (err) {
      console.error("Failed to load verification requests:", err);
      const message =
        err?.data?.message ||
        "Unable to load verification requests. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVerificationRequests();
  }, []);

  const totalRequests = verificationRequests.length;
  const pendingRequests = verificationRequests.filter(
    (request) => request.status === "Pending",
  ).length;
  const approvedRequests = verificationRequests.filter(
    (request) => request.status === "Approved",
  ).length;
  const rejectedRequests = verificationRequests.filter(
    (request) => request.status === "Rejected",
  ).length;

  const filteredRequests = useMemo(() => {
    return verificationRequests.filter((request) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        request.name.toLowerCase().includes(query) ||
        request.email.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "All" || request.status === statusFilter;
      const matchesRole = roleFilter === "All" || request.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [verificationRequests, searchQuery, statusFilter, roleFilter]);

  const clearIdCardUrl = () => {
    if (idCardUrl) URL.revokeObjectURL(idCardUrl);
    setIdCardUrl("");
  };

  const loadIdCard = async (requestId) => {
    clearIdCardUrl();
    try {
      const token = localStorage.getItem("scholaros_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "/api"}/v1/admin/verifications/${requestId}/id-card`,
        {
          method: "GET",
          headers: {
            Accept: "image/*,application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      if (!response.ok) throw { status: response.status, data: {} };
      const blob = await response.blob();
      setIdCardUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Failed to load ID card:", err);
      setActionError(
        err?.data?.message ||
          "Unable to load the university ID card. Please try again.",
      );
    }
  };

  const handleViewRequest = async (request) => {
    setSelectedRequest(request);
    setIsImageExpanded(false);
    setShowRejectForm(false);
    setRejectionReason("");
    setActionError("");
    setIsLoadingDetails(true);
    try {
      const response = await apiRequest(
        `/v1/admin/verifications/${request.id}`,
      );
      if (response?.data) {
        const details = normalizeVerification(response.data);
        setSelectedRequest(details);
        if (details.idCardAvailable) await loadIdCard(details.id);
      }
    } catch (err) {
      console.error("Failed to load verification details:", err);
      setActionError(
        err?.data?.message ||
          "Unable to load the verification details. Please try again.",
      );
      if (request.idCardAvailable) await loadIdCard(request.id);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedRequest(null);
    setIsImageExpanded(false);
    setShowRejectForm(false);
    setRejectionReason("");
    setActionError("");
    clearIdCardUrl();
  };

  const handleApprove = async () => {
    if (!selectedRequest || selectedRequest.status !== "Pending") return;
    setIsProcessing(true);
    setActionError("");
    try {
      const response = await apiRequest(
        `/v1/admin/verifications/${selectedRequest.id}/approve`,
        { method: "POST" },
      );
      if (response?.data) {
        const updatedRequest = normalizeVerification(response.data);
        setSelectedRequest(updatedRequest);
        setVerificationRequests((current) =>
          current.map((request) =>
            request.id === updatedRequest.id ? updatedRequest : request,
          ),
        );
      } else {
        await loadVerificationRequests();
        setSelectedRequest((current) =>
          current
            ? { ...current, status: "Approved", rejectionReason: null }
            : current,
        );
      }
      setShowRejectForm(false);
      setRejectionReason("");
    } catch (err) {
      console.error("Failed to approve verification:", err);
      setActionError(
        err?.data?.message ||
          "Unable to approve this verification request. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || selectedRequest.status !== "Pending") return;
    const trimmedReason = rejectionReason.trim();
    if (!trimmedReason) {
      setActionError("Please provide a rejection reason.");
      return;
    }
    setIsProcessing(true);
    setActionError("");
    try {
      const response = await apiRequest(
        `/v1/admin/verifications/${selectedRequest.id}/reject`,
        {
          method: "POST",
          body: JSON.stringify({ rejection_reason: trimmedReason }),
        },
      );
      if (response?.data) {
        const updatedRequest = normalizeVerification(response.data);
        setSelectedRequest(updatedRequest);
        setVerificationRequests((current) =>
          current.map((request) =>
            request.id === updatedRequest.id ? updatedRequest : request,
          ),
        );
      } else {
        await loadVerificationRequests();
        setSelectedRequest((current) =>
          current
            ? { ...current, status: "Rejected", rejectionReason: trimmedReason }
            : current,
        );
      }
      setShowRejectForm(false);
      setRejectionReason("");
    } catch (err) {
      console.error("Failed to reject verification:", err);
      setActionError(
        err?.data?.message ||
          "Unable to reject this verification request. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (idCardUrl) URL.revokeObjectURL(idCardUrl);
    };
  }, [idCardUrl]);

  // DETAIL VIEW
  if (selectedRequest) {
    return (
      <div className="mx-auto w-full max-w-[1400px] space-y-6">
        <button
          type="button"
          onClick={handleCloseDetails}
          className="inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={16} /> Back to verification requests
        </button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
              <ShieldCheck size={13} /> Verification Request
            </div>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {selectedRequest.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Review the submitted university ID card and verification
              information.
            </p>
          </div>
          <StatusBadge status={selectedRequest.status} />
        </div>

        {isLoadingDetails && (
          <div className="flex items-center gap-2 rounded-xl border border-[var(--badge-blue-text)]/30 bg-[var(--badge-blue)] px-4 py-3 text-sm text-[var(--badge-blue-text)]">
            <Loader2 size={16} className="animate-spin" /> Loading verification
            details...
          </div>
        )}

        {actionError && (
          <div className="flex items-start gap-2 rounded-xl border border-[var(--error)]/30 bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />{" "}
            <span>{actionError}</span>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  University ID Card
                </h3>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Review the uploaded identification document.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsImageExpanded(true)}
                disabled={!idCardUrl}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-page)] px-3 text-xs font-bold text-[var(--text-primary)] transition hover:border-[var(--badge-blue-text)]/30 hover:bg-[var(--badge-blue)] hover:text-[var(--badge-blue-text)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Maximize2 size={14} />{" "}
                <span className="hidden sm:inline">Expand</span>
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-page)]">
              {idCardUrl ? (
                <button
                  type="button"
                  onClick={() => setIsImageExpanded(true)}
                  className="group block w-full cursor-zoom-in"
                >
                  <img
                    src={idCardUrl}
                    alt={`${selectedRequest.name} university ID card`}
                    className="h-auto max-h-[620px] w-full object-contain transition duration-300 group-hover:scale-[1.01]"
                  />
                </button>
              ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                  {isLoadingDetails ? (
                    <>
                      <Loader2
                        size={24}
                        className="animate-spin text-indigo-600"
                      />
                      <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
                        Loading ID card...
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-page)] text-[var(--text-muted)]">
                        <AlertCircle size={20} />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
                        ID card unavailable
                      </p>
                      <p className="mt-1 max-w-sm text-xs text-[var(--text-muted)]">
                        The uploaded identification document could not be
                        loaded.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            <p className="mt-3 text-center text-[10px] text-[var(--text-muted)]">
              {idCardUrl
                ? "Click the image or Expand to view the ID card."
                : "No ID card preview is currently available."}
            </p>
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--badge-blue)] text-[var(--badge-blue-text)]">
                  <UserRound size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                    User Information
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    Submitted account details
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <DetailItem
                  icon={UserRound}
                  label="Name"
                  value={selectedRequest.name}
                />
                <DetailItem
                  icon={Mail}
                  label="Email"
                  value={selectedRequest.email}
                />
                <DetailItem
                  icon={GraduationCap}
                  label="Role"
                  value={selectedRequest.role}
                />
                <DetailItem
                  icon={CalendarDays}
                  label="Submitted"
                  value={selectedRequest.submittedAt}
                />
                <DetailItem
                  icon={ShieldCheck}
                  label="Status"
                  value={selectedRequest.status}
                />
                {selectedRequest.reviewedAt !== "—" && (
                  <DetailItem
                    icon={CalendarDays}
                    label="Reviewed"
                    value={selectedRequest.reviewedAt}
                  />
                )}
              </div>
            </section>

            {selectedRequest.status === "Rejected" &&
              selectedRequest.rejectionReason && (
                <section className="rounded-2xl border border-[var(--error)]/30 bg-[var(--error-bg)] p-5">
                  <div className="flex items-center gap-2 text-[var(--error)]">
                    <XCircle size={16} />
                    <h3 className="text-sm font-extrabold">Rejection Reason</h3>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[var(--error)]">
                    {selectedRequest.rejectionReason}
                  </p>
                </section>
              )}

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm">
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                Verification Actions
              </h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Review the request before taking an action.
              </p>

              {selectedRequest.status === "Pending" ? (
                <>
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}
                      {isProcessing ? "Processing..." : "Approve"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRejectForm((current) => !current);
                        setActionError("");
                      }}
                      disabled={isProcessing}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--error)]/30 bg-[var(--error-bg)] px-4 text-xs font-bold text-[var(--error)] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  </div>

                  {showRejectForm && (
                    <div className="mt-4 rounded-xl border border-[var(--error)]/30 bg-[var(--error-bg)] p-4">
                      <label
                        htmlFor="rejection-reason"
                        className="text-xs font-bold text-[var(--error)]"
                      >
                        Rejection Reason
                      </label>
                      <textarea
                        id="rejection-reason"
                        value={rejectionReason}
                        onChange={(event) =>
                          setRejectionReason(event.target.value)
                        }
                        placeholder="Explain why this verification request is being rejected..."
                        rows={4}
                        disabled={isProcessing}
                        className="mt-2 w-full resize-none rounded-xl border border-[var(--error)]/30 bg-[var(--bg-surface-elevated)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--error)] focus:ring-2 focus:ring-[var(--error)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setShowRejectForm(false);
                            setRejectionReason("");
                            setActionError("");
                          }}
                          disabled={isProcessing}
                          className="h-9 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 text-xs font-bold text-[var(--text-secondary)] transition hover:bg-[var(--bg-page)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleReject}
                          disabled={isProcessing || !rejectionReason.trim()}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-xs font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing && (
                            <Loader2 size={14} className="animate-spin" />
                          )}
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-4 rounded-xl bg-[var(--bg-page)] p-3 text-[10px] leading-4 text-[var(--text-muted)]">
                  This request has already been reviewed. Verification actions
                  are unavailable.
                </p>
              )}
            </section>
          </aside>
        </div>

        {isImageExpanded && idCardUrl && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setIsImageExpanded(false)}
          >
            <div
              className="relative flex max-h-[95vh] max-w-[1100px] items-center justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={idCardUrl}
                alt={`${selectedRequest.name} university ID card enlarged`}
                className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setIsImageExpanded(false)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                aria-label="Close ID card preview"
              >
                <XCircle size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
          <ShieldCheck size={13} /> Role Verification
        </div>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Verification Requests
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">
          Review and manage Student and Faculty/Supervisor role verification
          requests submitted by users.
        </p>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-[var(--error)]/30 bg-[var(--error-bg)] px-4 py-3">
          <div className="flex items-start gap-2 text-sm text-[var(--error)]">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadVerificationRequests}
            className="shrink-0 text-xs font-bold text-[var(--error)] underline underline-offset-2 hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          label="Total Requests"
          value={isLoading ? "—" : totalRequests}
          icon={ShieldCheck}
        />
        <SummaryCard
          label="Pending"
          value={isLoading ? "—" : pendingRequests}
          icon={Clock3}
        />
        <SummaryCard
          label="Approved"
          value={isLoading ? "—" : approvedRequests}
          icon={CheckCircle2}
        />
        <SummaryCard
          label="Rejected"
          value={isLoading ? "—" : rejectedRequests}
          icon={XCircle}
        />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name or email..."
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-page)] pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <SlidersHorizontal
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--bg-page)] pl-9 pr-9 text-sm font-medium text-[var(--text-primary)] outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 sm:w-[150px]"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
            </div>
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--bg-page)] px-3 pr-9 text-sm font-medium text-[var(--text-primary)] outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 sm:w-[180px]"
              >
                <option value="All">All Roles</option>
                <option value="Student">Student</option>
                <option value="Faculty/Supervisor">Faculty/Supervisor</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <Loader2 size={28} className="animate-spin text-indigo-600" />
            <h3 className="mt-4 text-sm font-bold text-[var(--text-primary)]">
              Loading verification requests...
            </h3>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Retrieving the latest requests from the server.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg-page)]/70">
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      User
                    </th>
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Role
                    </th>
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Submitted
                    </th>
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Status
                    </th>
                    <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-[var(--border)] last:border-b-0 transition-colors hover:bg-[var(--bg-page)]/60"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--badge-blue)] text-xs font-extrabold text-[var(--badge-blue-text)]">
                            {request.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                              {request.name}
                            </p>
                            <p className="truncate text-xs text-[var(--text-muted)]">
                              {request.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">
                          {request.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-[var(--text-secondary)]">
                          {request.submittedAt}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleViewRequest(request)}
                          className="inline-flex h-9 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-page)] px-3 text-xs font-bold text-[var(--text-primary)] transition hover:border-[var(--badge-blue-text)]/30 hover:bg-[var(--badge-blue)] hover:text-[var(--badge-blue-text)]"
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-[var(--border)] md:hidden">
              {filteredRequests.map((request) => (
                <div key={request.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--badge-blue)] text-xs font-extrabold text-[var(--badge-blue-text)]">
                        {request.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                          {request.name}
                        </p>
                        <p className="truncate text-xs text-[var(--text-muted)]">
                          {request.email}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[var(--bg-page)] p-3">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                        Role
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[var(--text-secondary)]">
                        {request.role}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                        Submitted
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[var(--text-secondary)]">
                        {request.submittedAt}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleViewRequest(request)}
                    className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-page)] text-xs font-bold text-[var(--text-primary)] transition hover:border-[var(--badge-blue-text)]/30 hover:bg-[var(--badge-blue)] hover:text-[var(--badge-blue-text)]"
                  >
                    <Eye size={14} /> View Request
                  </button>
                </div>
              ))}
            </div>

            {filteredRequests.length === 0 && (
              <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-page)] text-[var(--text-muted)]">
                  <Search size={20} />
                </div>
                <h3 className="mt-4 text-sm font-bold text-[var(--text-primary)]">
                  No verification requests found
                </h3>
                <p className="mt-1 max-w-sm text-xs text-[var(--text-muted)]">
                  Try adjusting your search or filter to find a verification
                  request.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
