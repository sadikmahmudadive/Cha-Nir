"use client";

import { useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  KeyRound,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  X,
} from "lucide-react";
import {
  useAdminAuth,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_COLORS,
  DEFAULT_SUPERADMIN,
  type AdminRole,
  type AdminUser,
} from "@/lib/firebase/admin-auth";

export default function AdminTeamPage() {
  const {
    user: currentUser,
    isSuperAdmin,
    isFirebaseConnected,
    teamMembers,
    createAccount,
    updateRole,
    updateStatus,
    deleteAccount,
    refreshTeam,
  } = useAdminAuth();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminRole>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actingUid, setActingUid] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // New admin form state
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>("operations_manager");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const notify = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredMembers = teamMembers.filter((m) => {
    if (roleFilter !== "all" && m.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = m.displayName.toLowerCase().includes(q);
      const matchEmail = m.email.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }
    return true;
  });

  const handleCreateAdmin = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);

    try {
      const res = await createAccount({
        email: newEmail,
        displayName: newName,
        password: newPassword || "admin#chanir@1257",
        role: newRole,
      });

      if (res.success) {
        notify("success", `Created admin account for ${newEmail} with role ${ROLE_LABELS[newRole]}`);
        setIsAddModalOpen(false);
        setNewEmail("");
        setNewName("");
        setNewPassword("");
        setNewRole("operations_manager");
      } else {
        setFormError(res.error || "Failed to create account.");
      }
    } catch {
      setFormError("Unexpected error occurred while creating the account.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleRoleChange = async (uid: string, targetRole: AdminRole) => {
    if (!isSuperAdmin) {
      notify("error", "Only a Super Admin can change account roles.");
      return;
    }
    setActingUid(uid);
    try {
      const res = await updateRole(uid, targetRole);
      if (res.success) {
        notify("success", `Role updated to ${ROLE_LABELS[targetRole]}`);
      } else {
        notify("error", res.error || "Failed to update role.");
      }
    } finally {
      setActingUid(null);
    }
  };

  const handleStatusToggle = async (m: AdminUser) => {
    if (!isSuperAdmin) {
      notify("error", "Only a Super Admin can toggle account status.");
      return;
    }
    const newStatus = m.status === "active" ? "suspended" : "active";
    setActingUid(m.uid);
    try {
      const res = await updateStatus(m.uid, newStatus);
      if (res.success) {
        notify("success", `${m.displayName} is now ${newStatus}`);
      } else {
        notify("error", res.error || "Failed to update status.");
      }
    } finally {
      setActingUid(null);
    }
  };

  const handleDeleteUser = async (m: AdminUser) => {
    if (!isSuperAdmin) {
      notify("error", "Only a Super Admin can delete admin accounts.");
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete ${m.displayName} (${m.email})?`)) {
      return;
    }
    setActingUid(m.uid);
    try {
      const res = await deleteAccount(m.uid);
      if (res.success) {
        notify("success", `Deleted ${m.displayName}'s admin account.`);
      } else {
        notify("error", res.error || "Failed to delete account.");
      }
    } finally {
      setActingUid(null);
    }
  };

  const superAdminCount = teamMembers.filter((m) => m.role === "super_admin").length;
  const activeCount = teamMembers.filter((m) => m.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-bold shadow-xl border animate-in fade-in slide-in-from-bottom-2 ${
            notification.type === "success"
              ? "bg-leaf-deep text-cream border-leaf/30"
              : "bg-rose-900 text-rose-100 border-rose-700/50"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="size-4 text-lime" />
          ) : (
            <AlertTriangle className="size-4 text-rose-300" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-leaf-deep dark:text-[#a5be16]">
              Access Control & RBAC
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[0.62rem] font-bold font-mono border ${
                isFirebaseConnected
                  ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30"
              }`}
            >
              {isFirebaseConnected ? "Firestore Live" : "Local Emulation"}
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-brown dark:text-[#f4f7f2] mt-0.5">
            Admin Accounts & Team Roles
          </h2>
          <p className="text-xs text-brown-soft dark:text-[#98a793]">
            Manage administrative staff, permissions, and Firestore role bindings
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refreshTeam()}
            className="btn btn-ghost border border-black/[0.08] dark:border-white/[0.08] hover:border-leaf p-2 rounded-xl text-brown-soft dark:text-[#98a793] hover:text-brown dark:hover:text-[#f4f7f2] bg-white dark:bg-[#141a14] shadow-2xs"
            title="Refresh team records"
          >
            <RefreshCw className="size-4" />
          </button>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-leaf text-xs font-bold px-4 py-2 rounded-xl shadow-xs hover:shadow-md flex items-center gap-1.5"
            >
              <UserPlus className="size-4" />
              <span>Create Admin Account</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-brown-soft dark:text-[#98a793]">
              Total Admin Staff
            </p>
            <p className="text-3xl font-extrabold font-mono text-brown dark:text-[#f4f7f2] mt-0.5">
              {teamMembers.length}
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
              {activeCount} active accounts
            </p>
          </div>
          <div className="size-11 rounded-xl bg-leaf-soft dark:bg-[#232c21] flex items-center justify-center text-leaf-deep dark:text-[#c3d65a]">
            <Users className="size-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-purple-500/20 dark:border-purple-500/30 bg-linear-to-br from-purple-500/5 via-white to-purple-500/10 dark:from-purple-950/20 dark:via-[#141a14] dark:to-purple-900/10 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-purple-900/80 dark:text-purple-300">
              Super Admin Accounts
            </p>
            <p className="text-3xl font-extrabold font-mono text-purple-950 dark:text-purple-100 mt-0.5">
              {superAdminCount}
            </p>
            <p className="text-xs text-purple-800 dark:text-purple-300 font-semibold mt-1">
              Full platform permissions
            </p>
          </div>
          <div className="size-11 rounded-xl bg-purple-500/15 border border-purple-500/25 dark:bg-purple-900/30 dark:border-purple-500/30 flex items-center justify-center text-purple-900 dark:text-purple-300">
            <ShieldCheck className="size-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-brown-soft dark:text-[#98a793]">
              Current Logged-in Identity
            </p>
            <p className="text-base font-bold text-brown dark:text-[#f4f7f2] truncate max-w-[200px] mt-0.5">
              {currentUser?.displayName || "Admin User"}
            </p>
            <p className="text-xs font-mono font-semibold text-leaf dark:text-[#c3d65a] truncate">
              {currentUser?.email}
            </p>
          </div>
          <div className="size-11 rounded-xl bg-cream dark:bg-[#232c21] flex items-center justify-center text-leaf-deep dark:text-[#c3d65a] border border-black/[0.06] dark:border-white/[0.08]">
            <KeyRound className="size-5" />
          </div>
        </div>
      </div>

      {/* Firestore Live Role Sync Card (Explains how role updates work) */}
      <div className="rounded-2xl border border-leaf/25 bg-linear-to-br from-[#ffffff] via-[#f9faf5] to-[#edf3e2] dark:from-[#141a14] dark:via-[#161d15] dark:to-[#192418] p-5 shadow-2xs space-y-3">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-xl bg-leaf text-cream flex items-center justify-center shrink-0 shadow-2xs">
            <Database className="size-4" />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif text-base font-bold text-brown dark:text-[#f4f7f2]">
              Firestore Role Binding Architecture
            </h4>
            <p className="text-xs text-brown-soft dark:text-[#98a793] leading-relaxed">
              Every admin account is bound to a document in the Firestore collection{" "}
              <code className="font-mono font-bold text-leaf-deep dark:text-[#a5be16] bg-leaf-soft/60 dark:bg-leaf/20 px-1.5 py-0.5 rounded">
                admins/{`{uid}`}
              </code>
              . You can update any admin&apos;s role from this dashboard or directly in your{" "}
              <strong className="text-brown dark:text-[#f4f7f2]">Firebase Console</strong>. When changed in Firestore, the role updates in real-time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
          {(Object.keys(ROLE_LABELS) as AdminRole[]).map((r) => (
            <div
              key={r}
              className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white/80 dark:bg-[#111611]/80 p-2.5 text-xs space-y-1 shadow-2xs"
            >
              <div className="flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${ROLE_COLORS[r].dot}`} />
                <span className="font-bold text-brown dark:text-[#f4f7f2]">{ROLE_LABELS[r]}</span>
              </div>
              <p className="text-[0.65rem] text-brown-soft dark:text-[#98a793] line-clamp-2">
                {ROLE_DESCRIPTIONS[r]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-brown-soft dark:text-[#98a793]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by staff name or email..."
            className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] pl-10 pr-4 py-2 text-xs text-brown dark:text-[#f4f7f2] focus:border-leaf focus:outline-hidden shadow-2xs dark:placeholder-[#98a793]/60"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
              roleFilter === "all"
                ? "bg-leaf text-cream shadow-xs"
                : "bg-white dark:bg-[#141a14] text-brown-soft dark:text-[#98a793] border border-black/[0.08] dark:border-white/[0.08] hover:bg-cream dark:hover:bg-[#1e271c] dark:hover:text-[#f4f7f2]"
            }`}
          >
            All Roles ({teamMembers.length})
          </button>
          {(Object.keys(ROLE_LABELS) as AdminRole[]).map((r) => {
            const count = teamMembers.filter((m) => m.role === r).length;
            const on = roleFilter === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
                  on
                    ? "bg-leaf text-cream shadow-xs"
                    : "bg-white dark:bg-[#141a14] text-brown-soft dark:text-[#98a793] border border-black/[0.08] dark:border-white/[0.08] hover:bg-cream dark:hover:bg-[#1e271c] dark:hover:text-[#f4f7f2]"
                }`}
              >
                {ROLE_LABELS[r]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Team Members Table */}
      <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fcfbfa] dark:bg-[#161d15]/80 border-b border-black/[0.06] dark:border-white/[0.06] text-brown-soft dark:text-[#98a793] uppercase tracking-wider text-[0.65rem] font-bold">
              <tr>
                <th className="px-5 py-3.5">Admin Staff</th>
                <th className="px-5 py-3.5">Assigned Role (Firestore)</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Created Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.05]">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-brown-soft dark:text-[#98a793]">
                    No admin accounts found matching your search.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const isCurrent = currentUser?.uid === m.uid || currentUser?.email === m.email;
                  const isRootSuper = m.email.toLowerCase() === DEFAULT_SUPERADMIN.email.toLowerCase();
                  const isActing = actingUid === m.uid;

                  return (
                    <tr
                      key={m.uid}
                      className="hover:bg-cream/20 dark:hover:bg-white/[0.03] transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-linear-to-br from-leaf-soft to-lime/30 dark:from-[#232c21] dark:to-[#1d2d1d] border border-leaf/20 dark:border-leaf/30 flex items-center justify-center font-bold text-leaf-deep dark:text-[#c3d65a] text-xs shrink-0 shadow-2xs">
                            {m.displayName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-brown dark:text-[#f4f7f2] text-sm">{m.displayName}</span>
                              {isCurrent && (
                                <span className="rounded-md bg-leaf-soft dark:bg-leaf/20 px-1.5 py-0.2 text-[0.62rem] font-bold text-leaf-deep dark:text-[#c3d65a] border border-leaf/20">
                                  You
                                </span>
                              )}
                              {isRootSuper && (
                                <span className="rounded-md bg-purple-500/10 text-[0.62rem] font-bold text-purple-900 dark:text-purple-300 border border-purple-500/20">
                                  Primary Root
                                </span>
                              )}
                            </div>
                            <p className="font-mono text-xs text-brown-soft dark:text-[#98a793]">{m.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Selector / Badge */}
                      <td className="px-5 py-4">
                        {isSuperAdmin && !isRootSuper ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={m.role}
                              disabled={isActing}
                              onChange={(e) => handleRoleChange(m.uid, e.target.value as AdminRole)}
                              className="rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#111611] px-2.5 py-1.5 text-xs font-bold text-brown dark:text-[#f4f7f2] focus:border-leaf focus:outline-hidden shadow-2xs cursor-pointer hover:border-leaf/50"
                            >
                              {(Object.keys(ROLE_LABELS) as AdminRole[]).map((r) => (
                                <option key={r} value={r}>
                                  {ROLE_LABELS[r]}
                                </option>
                              ))}
                            </select>
                            <span className={`size-2 rounded-full ${ROLE_COLORS[m.role].dot}`} />
                          </div>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-bold border ${ROLE_COLORS[m.role].badge}`}
                          >
                            <span className={`size-1.5 rounded-full ${ROLE_COLORS[m.role].dot}`} />
                            <span>{ROLE_LABELS[m.role]}</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-bold border ${
                            m.status === "active"
                              ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-800 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              m.status === "active" ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          <span className="capitalize">{m.status}</span>
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="px-5 py-4 text-brown-soft dark:text-[#98a793] font-mono text-[0.72rem]">
                        {new Date(m.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isSuperAdmin && !isRootSuper && (
                            <>
                              <button
                                type="button"
                                disabled={isActing}
                                onClick={() => handleStatusToggle(m)}
                                className={`rounded-xl border p-1.5 text-xs font-semibold transition-colors ${
                                  m.status === "active"
                                    ? "border-black/[0.08] dark:border-white/[0.08] hover:border-amber-500 text-brown-soft dark:text-[#98a793] hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                                    : "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                                }`}
                                title={m.status === "active" ? "Suspend user" : "Activate user"}
                              >
                                {m.status === "active" ? (
                                  <UserX className="size-4" />
                                ) : (
                                  <UserCheck className="size-4" />
                                )}
                              </button>

                              <button
                                type="button"
                                disabled={isActing}
                                onClick={() => handleDeleteUser(m)}
                                className="rounded-xl border border-black/[0.08] dark:border-white/[0.08] hover:border-rose-500 p-1.5 text-brown-soft dark:text-[#98a793] hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                                title="Delete admin account"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create New Admin */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] p-6 sm:p-7 shadow-2xl space-y-5 text-brown dark:text-[#f4f7f2]">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-leaf-soft dark:bg-[#232c21] text-leaf-deep dark:text-[#c3d65a] flex items-center justify-center">
                  <UserPlus className="size-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-brown dark:text-[#f4f7f2]">
                    Add Team Member
                  </h3>
                  <p className="text-[0.68rem] text-brown-soft dark:text-[#98a793]">
                    Creates an admin profile in the Firestore &apos;admins&apos; collection
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl p-1 text-brown-soft dark:text-[#98a793] hover:bg-cream dark:hover:bg-[#1e271c]"
              >
                <X className="size-5" />
              </button>
            </div>

            {formError && (
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-xs text-rose-800 dark:text-rose-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brown dark:text-[#f4f7f2] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Tariqul Islam"
                  className="w-full rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#111611] px-3.5 py-2 text-xs text-brown dark:text-[#f4f7f2] focus:border-leaf focus:outline-hidden dark:placeholder-[#98a793]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brown dark:text-[#f4f7f2] uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. tariqul@chanir.com"
                  className="w-full rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#111611] px-3.5 py-2 text-xs text-brown dark:text-[#f4f7f2] font-mono focus:border-leaf focus:outline-hidden dark:placeholder-[#98a793]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brown dark:text-[#f4f7f2] uppercase tracking-wider mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave empty for default (admin#chanir@1257)"
                  className="w-full rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#111611] px-3.5 py-2 text-xs text-brown dark:text-[#f4f7f2] font-mono focus:border-leaf focus:outline-hidden dark:placeholder-[#98a793]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brown dark:text-[#f4f7f2] uppercase tracking-wider mb-1">
                  Assign Administrative Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminRole)}
                  className="w-full rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#111611] px-3.5 py-2 text-xs font-bold text-brown dark:text-[#f4f7f2] focus:border-leaf focus:outline-hidden"
                >
                  {(Object.keys(ROLE_LABELS) as AdminRole[]).map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]} — {ROLE_DESCRIPTIONS[r]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-ghost text-xs font-bold py-2 px-4 rounded-xl border border-black/[0.1] dark:border-white/[0.1] text-brown dark:text-[#f4f7f2] hover:bg-cream dark:hover:bg-[#1e271c]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn btn-leaf text-xs font-bold py-2 px-5 rounded-xl shadow-xs"
                >
                  {formSubmitting ? "Creating..." : "Save to Firestore"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
