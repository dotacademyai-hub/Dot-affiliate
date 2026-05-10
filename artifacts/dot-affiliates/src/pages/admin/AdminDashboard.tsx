import { useState } from "react";
import { useLocation } from "wouter";
import {
  useAdminGetStats,
  useAdminListAffiliates,
  useAdminGetActivity,
  useAdminGetTopPerformers,
  useAdminSuspendAffiliate,
  useAdminUnsuspendAffiliate,
  useAdminDeleteAffiliate,
  useAdminApproveAffiliate,
  getAdminGetStatsQueryKey,
  getAdminListAffiliatesQueryKey,
  getAdminGetActivityQueryKey,
  getAdminGetTopPerformersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users, TrendingUp, MousePointer, ShoppingCart, Clock, CheckCircle, Ban,
  Trash2, MessageCircle, Moon, Sun, LogOut, Activity, Trophy, Search,
  ShieldCheck, BarChart2, UserCheck, UserX, ChevronLeft, ChevronRight
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import logoPath from "@assets/f45832e5-fd75-4649-94b8-25101588a119_removalai_preview_1778429832966.png";

type Section = "dashboard" | "affiliates" | "activity" | "top-performers";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-500/10 text-green-500 border-green-500/20",
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    suspended: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] ?? "bg-muted text-muted-foreground border-border"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color?: string }) {
  return (
    <div className={`p-5 rounded-2xl border border-border bg-card`} data-testid={`admin-stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color ?? "bg-primary/10 text-primary"}`}>
        {icon}
      </div>
      <div className="text-2xl font-black mb-1">{value}</div>
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [section, setSection] = useState<Section>("dashboard");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  const { data: stats, isLoading: statsLoading } = useAdminGetStats();
  const { data: affiliatesData, isLoading: affiliatesLoading } = useAdminListAffiliates({
    status: statusFilter !== "all" ? statusFilter as "active" | "pending" | "suspended" : undefined,
    search: search || undefined,
    page,
    limit: LIMIT,
  }, { query: { queryKey: getAdminListAffiliatesQueryKey({ status: statusFilter !== "all" ? statusFilter as "active" | "pending" | "suspended" : undefined, search: search || undefined, page, limit: LIMIT }) } });
  const { data: activity, isLoading: activityLoading } = useAdminGetActivity();
  const { data: topPerformers, isLoading: topLoading } = useAdminGetTopPerformers();

  const suspendMutation = useAdminSuspendAffiliate();
  const unsuspendMutation = useAdminUnsuspendAffiliate();
  const deleteMutation = useAdminDeleteAffiliate();
  const approveMutation = useAdminApproveAffiliate();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getAdminGetStatsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getAdminListAffiliatesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getAdminGetActivityQueryKey() });
    queryClient.invalidateQueries({ queryKey: getAdminGetTopPerformersQueryKey() });
  };

  const handleApprove = async (id: number) => {
    await approveMutation.mutateAsync({ id });
    invalidateAll();
  };

  const handleSuspend = async (id: number) => {
    await suspendMutation.mutateAsync({ id });
    invalidateAll();
  };

  const handleUnsuspend = async (id: number) => {
    await unsuspendMutation.mutateAsync({ id });
    invalidateAll();
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync({ id });
    invalidateAll();
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setLocation("/admin");
  };

  const totalPages = affiliatesData ? Math.ceil(affiliatesData.total / LIMIT) : 1;

  const navItems: { id: Section; icon: React.ReactNode; label: string }[] = [
    { id: "dashboard", icon: <BarChart2 className="w-4 h-4" />, label: "Dashboard" },
    { id: "affiliates", icon: <Users className="w-4 h-4" />, label: "Affiliates" },
    { id: "activity", icon: <Activity className="w-4 h-4" />, label: "Activity" },
    { id: "top-performers", icon: <Trophy className="w-4 h-4" />, label: "Top Performers" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-card flex-shrink-0 flex flex-col" data-testid="admin-sidebar">
        <div className="p-5 border-b border-border flex items-center gap-3">
          <img src={logoPath} alt="DOT" className="w-7 h-7 object-contain dark:brightness-100 brightness-50" />
          <div>
            <div className="font-black text-sm">DOT Admin</div>
            <div className="text-xs text-primary flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Control Panel</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${section === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
              data-testid={`nav-${item.id}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-all"
            data-testid="button-admin-logout"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border px-6 py-4">
          <h1 className="font-black text-lg capitalize">{section.replace("-", " ")}</h1>
        </div>

        <div className="p-6">
          {/* DASHBOARD */}
          {section === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsLoading ? (
                  Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
                ) : (
                  <>
                    <StatCard icon={<Users className="w-5 h-5" />} label="Total Affiliates" value={stats?.totalAffiliates ?? 0} />
                    <StatCard icon={<UserCheck className="w-5 h-5" />} label="Active" value={stats?.activeAffiliates ?? 0} color="bg-green-500/10 text-green-500" />
                    <StatCard icon={<Clock className="w-5 h-5" />} label="Pending" value={stats?.pendingAffiliates ?? 0} color="bg-amber-500/10 text-amber-500" />
                    <StatCard icon={<UserX className="w-5 h-5" />} label="Suspended" value={stats?.suspendedAffiliates ?? 0} color="bg-red-500/10 text-red-500" />
                    <StatCard icon={<MousePointer className="w-5 h-5" />} label="Total Clicks" value={stats?.totalClicks ?? 0} />
                    <StatCard icon={<ShoppingCart className="w-5 h-5" />} label="Paid Referrals" value={stats?.totalConversions ?? 0} color="bg-primary/10 text-primary" />
                    <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Conversion Rate" value={`${stats?.conversionRate ?? 0}%`} />
                  </>
                )}
              </div>

              {/* Recent Activity preview */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-bold mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Recent Activity</h2>
                {activityLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full mb-2" />)
                ) : activity?.slice(0, 5).map((act, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0" data-testid={`activity-item-${i}`}>
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{act.description}</span>
                      {act.affiliateName && <span className="text-xs text-muted-foreground ml-2">— {act.affiliateName}</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(act.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AFFILIATES */}
          {section === "affiliates" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="pl-9"
                    data-testid="input-search-affiliates"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-40" data-testid="select-status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-2xl border border-border bg-card overflow-hidden" data-testid="affiliates-table">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">#</th>
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</th>
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</th>
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Platform</th>
                        <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Clicks</th>
                        <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Paid Refs</th>
                        <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                        <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {affiliatesLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                          <tr key={i} className="border-b border-border/50">
                            {Array.from({ length: 8 }).map((_, j) => (
                              <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                            ))}
                          </tr>
                        ))
                      ) : affiliatesData?.data.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground" data-testid="affiliates-empty">
                            No affiliates found
                          </td>
                        </tr>
                      ) : affiliatesData?.data.map((a, i) => (
                        <tr key={a.id} className="border-b border-border/50 hover:bg-accent/5 transition-colors" data-testid={`affiliate-row-${a.id}`}>
                          <td className="px-4 py-3 text-muted-foreground">{a.rank ? `#${a.rank}` : "—"}</td>
                          <td className="px-4 py-3 font-semibold">{a.name}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{a.email}</td>
                          <td className="px-4 py-3">
                            <span className="capitalize text-xs font-medium">{a.primaryPlatform}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm">{a.clicks}</td>
                          <td className="px-4 py-3 text-right font-mono text-sm font-bold text-primary">{a.conversions}</td>
                          <td className="px-4 py-3 text-center">
                            <StatusBadge status={a.status} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              {a.status === "pending" && (
                                <Button size="sm" variant="ghost" onClick={() => handleApprove(a.id)} className="h-7 px-2 text-green-500 hover:bg-green-500/10 text-xs" data-testid={`button-approve-${a.id}`}>
                                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                                </Button>
                              )}
                              {a.status === "active" && (
                                <Button size="sm" variant="ghost" onClick={() => handleSuspend(a.id)} className="h-7 px-2 text-amber-500 hover:bg-amber-500/10 text-xs" data-testid={`button-suspend-${a.id}`}>
                                  <Ban className="w-3.5 h-3.5 mr-1" /> Suspend
                                </Button>
                              )}
                              {a.status === "suspended" && (
                                <Button size="sm" variant="ghost" onClick={() => handleUnsuspend(a.id)} className="h-7 px-2 text-green-500 hover:bg-green-500/10 text-xs" data-testid={`button-unsuspend-${a.id}`}>
                                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Restore
                                </Button>
                              )}
                              {a.whatsappNumber && (
                                <a href={`https://wa.me/${a.whatsappNumber.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" variant="ghost" className="h-7 px-2 text-[#25D366] hover:bg-[#25D366]/10" data-testid={`button-whatsapp-${a.id}`}>
                                    <FaWhatsapp className="w-3.5 h-3.5" />
                                  </Button>
                                </a>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:bg-destructive/10" data-testid={`button-delete-${a.id}`}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Affiliate</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to permanently delete <strong>{a.name}</strong>? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(a.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      data-testid={`button-confirm-delete-${a.id}`}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {affiliatesData && affiliatesData.total > LIMIT && (
                  <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, affiliatesData.total)} of {affiliatesData.total}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} data-testid="button-prev-page">
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-xs font-semibold">{page} / {totalPages}</span>
                      <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} data-testid="button-next-page">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACTIVITY */}
          {section === "activity" && (
            <div className="rounded-2xl border border-border bg-card" data-testid="activity-list">
              {activityLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : activity?.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No activity yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {activity?.map((act, i) => (
                    <div key={i} className="px-5 py-4 flex items-center gap-4" data-testid={`activity-row-${i}`}>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${act.type.includes("approve") || act.type.includes("unsuspend") ? "bg-green-500" : act.type.includes("suspend") || act.type.includes("delete") ? "bg-red-500" : "bg-primary"}`} />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{act.description}</span>
                        {act.affiliateName && (
                          <span className="text-xs text-muted-foreground ml-2">— {act.affiliateName}</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TOP PERFORMERS */}
          {section === "top-performers" && (
            <div className="space-y-4">
              {topLoading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
              ) : topPerformers?.map((a, i) => (
                <div key={a.id} className={`flex items-center gap-4 p-5 rounded-2xl border bg-card transition-all hover:border-primary/40 ${i < 3 ? "border-primary/20" : "border-border"}`} data-testid={`top-performer-${a.id}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 ${i === 0 ? "bg-yellow-500/20 text-yellow-400" : i === 1 ? "bg-gray-400/20 text-gray-300" : i === 2 ? "bg-amber-600/20 text-amber-600" : "bg-primary/10 text-primary"}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{a.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{a.primaryPlatform} · {a.email}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-black text-primary text-xl">{a.conversions}</div>
                    <div className="text-xs text-muted-foreground">Paid Refs</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-sm">{a.clicks}</div>
                    <div className="text-xs text-muted-foreground">Clicks</div>
                  </div>
                  {a.whatsappNumber && (
                    <a href={`https://wa.me/${a.whatsappNumber.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="text-[#25D366] hover:bg-[#25D366]/10" data-testid={`button-wa-top-${a.id}`}>
                        <FaWhatsapp className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
