import { useState, useRef, useEffect } from "react";
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
  useAdminGetNotifications,
  useAdminMarkAllNotificationsRead,
  useAdminMarkNotificationRead,
  getAdminGetStatsQueryKey,
  getAdminListAffiliatesQueryKey,
  getAdminGetActivityQueryKey,
  getAdminGetTopPerformersQueryKey,
  getAdminGetNotificationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Menu, Users, TrendingUp, MousePointer, ShoppingCart, Clock, CheckCircle, Ban,
  Trash2, Moon, Sun, LogOut, Activity, Trophy, Search,
  ShieldCheck, BarChart2, UserCheck, UserX, ChevronLeft, ChevronRight,
  Bell, X, CheckCheck, UserPlus, Settings, Eye, Info, Download
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
    <div className="p-5 rounded-2xl border border-border bg-card" data-testid={`admin-stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color ?? "bg-primary/10 text-primary"}`}>
        {icon}
      </div>
      <div className="text-2xl font-black mb-1">{value}</div>
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
    </div>
  );
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NotificationPanel({
  onClose,
}: {
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminGetNotifications({ query: { queryKey: getAdminGetNotificationsQueryKey(), refetchInterval: 15000 } });
  const markRead = useAdminMarkNotificationRead();
  const markAllRead = useAdminMarkAllNotificationsRead();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getAdminGetNotificationsQueryKey() });
  };

  const handleMarkAll = async () => {
    await markAllRead.mutateAsync();
    invalidate();
  };

  const handleMarkOne = async (id: number) => {
    await markRead.mutateAsync({ id });
    invalidate();
  };

  const notifications = data?.notifications ?? [];
  const unread = data?.unreadCount ?? 0;

  return (
    <div className="w-full sm:w-[420px] max-h-[80vh] sm:max-h-[540px] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm">Notifications</span>
          {unread > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-black px-2 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              title="Mark all notifications as read"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
          <button 
            type="button"
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground transition-colors" 
            aria-label="Close notifications" 
            title="Close notifications"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-14 text-center text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs mt-1 opacity-60">New affiliate applications will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`px-4 py-3.5 transition-colors ${!n.isRead ? "bg-primary/5" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    n.type === "new_application"
                      ? "bg-amber-500/15 text-amber-500"
                      : n.type === "conversion_milestone"
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {n.type === "new_application" ? (
                      <UserPlus className="w-4 h-4" />
                    ) : (
                      <Settings className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-tight ${!n.isRead ? "font-semibold" : "font-medium"}`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
                      {n.whatsappMessage && (
                        <a
                          href={n.whatsappMessage}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => !n.isRead && handleMarkOne(n.id)}
                          aria-label={n.type === "new_application" ? "Send receipt via WhatsApp" : "Notify via WhatsApp"}
                          title={n.type === "new_application" ? "Send receipt via WhatsApp" : "Notify via WhatsApp"}
                        >
                          <button 
                            type="button"
                            className="flex items-center gap-1 text-xs font-semibold text-[#25D366] hover:text-[#25D366]/80 bg-[#25D366]/10 hover:bg-[#25D366]/20 px-2.5 py-1 rounded-full transition-colors"
                          >
                            <FaWhatsapp className="w-3 h-3" />
                            {n.type === "new_application" ? "Send receipt" : "Notify via WhatsApp"}
                          </button>
                        </a>
                      )}
                      {!n.isRead && (
                        <button
                          type="button"
                          onClick={() => handleMarkOne(n.id)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          title="Dismiss notification"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string | number | boolean | null }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value === true ? "Yes" : value === false ? "No" : value || "—"}</div>
    </div>
  );
}

function AffiliateDetailDialog({ affiliate, children }: { affiliate: any; children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-2xl font-black">Affiliate Details</DialogTitle>
            <StatusBadge status={affiliate.status} />
          </div>
          <DialogDescription>
            Complete registration details and performance metrics for {affiliate.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
          <div className="space-y-6">
            <div className="font-bold text-primary flex items-center gap-2 border-b border-border pb-2">
              <Users className="w-4 h-4" /> Personal Info
            </div>
            <div className="grid grid-cols-1 gap-4">
              <DetailItem label="Full Name" value={affiliate.name} />
              <DetailItem label="Username" value={affiliate.username} />
              <DetailItem label="Email Address" value={affiliate.email} />
              <DetailItem label="WhatsApp Number" value={affiliate.whatsappNumber} />
              <DetailItem label="Affiliate Code" value={affiliate.affiliateCode || "Not generated yet"} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="font-bold text-primary flex items-center gap-2 border-b border-border pb-2">
              <TrendingUp className="w-4 h-4" /> Performance
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Total Clicks" value={affiliate.clicks} />
              <DetailItem label="Paid Referrals" value={affiliate.conversions} />
              <DetailItem label="Current Rank" value={affiliate.rank ? `#${affiliate.rank}` : "Unranked"} />
              <DetailItem label="Joined" value={new Date(affiliate.createdAt).toLocaleDateString()} />
            </div>
          </div>

          <div className="space-y-6 md:col-span-2">
            <div className="font-bold text-primary flex items-center gap-2 border-b border-border pb-2">
              <Info className="w-4 h-4" /> Registration Questionnaire (Full Details)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DetailItem label="Primary Platform" value={affiliate.primaryPlatform} />
              <DetailItem label="Average Engagement" value={affiliate.avgEngagement} />
              <DetailItem label="Has Promoted Before" value={affiliate.hasPromotedBefore ? "Yes" : "No"} />
              <DetailItem label="WhatsApp Groups Reach" value={affiliate.whatsappGroupsReach} />
              <DetailItem label="Tickets Sell Estimate" value={affiliate.ticketsSellEstimate} />
              <DetailItem label="Willing to Promote" value={affiliate.willingToPromote ? "Yes" : "No"} />
            </div>
            <div className="pt-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Why should we select you?</div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{affiliate.whySelectYou || "No explanation provided."}</div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full">
              Close Details
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-yellow-500/50 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
      <span className="font-black text-lg italic text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">01</span>
    </div>
  );
  if (rank === 2) return (
    <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-400/50 shadow-[0_0_15px_rgba(226,232,240,0.3)]">
      <span className="font-black text-lg italic text-slate-100 drop-shadow-[0_0_5px_rgba(226,232,240,0.5)]">02</span>
    </div>
  );
  if (rank === 3) return (
    <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-amber-700/50 shadow-[0_0_15px_rgba(217,119,6,0.3)]">
      <span className="font-black text-lg italic text-amber-500 drop-shadow-[0_0_5px_rgba(217,119,6,0.5)]">03</span>
    </div>
  );
  if (rank === 4) return (
    <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
      <span className="font-black text-lg italic text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">04</span>
    </div>
  );
  if (rank <= 10) return (
    <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-emerald-600/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
      <span className="font-black text-sm text-emerald-500 drop-shadow-[0_0_3px_rgba(16,185,129,0.5)]">{String(rank).padStart(2, "0")}</span>
    </div>
  );
  return <span className="text-muted-foreground font-bold text-sm ml-2">{String(rank).padStart(2, "0")}</span>;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [section, setSection] = useState<Section>("dashboard");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const LIMIT = 15;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useAdminGetStats();
  const { data: affiliatesData, isLoading: affiliatesLoading } = useAdminListAffiliates({
    status: statusFilter !== "all" ? statusFilter as "active" | "pending" | "suspended" : undefined,
    search: search || undefined,
    page,
    limit: LIMIT,
  }, { query: { queryKey: getAdminListAffiliatesQueryKey({ status: statusFilter !== "all" ? statusFilter as "active" | "pending" | "suspended" : undefined, search: search || undefined, page, limit: LIMIT }) } });
  const { data: activity, isLoading: activityLoading } = useAdminGetActivity();
  const { data: topPerformers, isLoading: topLoading } = useAdminGetTopPerformers();
  const { data: notifData } = useAdminGetNotifications({ query: { queryKey: getAdminGetNotificationsQueryKey(), refetchInterval: 15000 } });

  const suspendMutation = useAdminSuspendAffiliate();
  const unsuspendMutation = useAdminUnsuspendAffiliate();
  const deleteMutation = useAdminDeleteAffiliate();
  const approveMutation = useAdminApproveAffiliate();

  const unreadCount = notifData?.unreadCount ?? 0;

  // Close notification panel when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getAdminGetStatsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getAdminListAffiliatesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getAdminGetActivityQueryKey() });
    queryClient.invalidateQueries({ queryKey: getAdminGetTopPerformersQueryKey() });
    queryClient.invalidateQueries({ queryKey: getAdminGetNotificationsQueryKey() });
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
    setLocation("/auth");
  };

  const handleExport = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;
    window.open(`/api/admin/affiliates/export?token=${token}`, "_blank");
  };

  const totalPages = affiliatesData ? Math.ceil(affiliatesData.total / LIMIT) : 1;

  const navItems: { id: Section; icon: React.ReactNode; label: string }[] = [
    { id: "dashboard", icon: <BarChart2 className="w-4 h-4" />, label: "Dashboard" },
    { id: "affiliates", icon: <Users className="w-4 h-4" />, label: "Affiliates" },
    { id: "activity", icon: <Activity className="w-4 h-4" />, label: "Activity" },
    { id: "top-performers", icon: <Trophy className="w-4 h-4" />, label: "Top Performers" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 border-r border-border bg-card z-50 transition-transform duration-300 transform lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`} data-testid="admin-sidebar">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoPath} alt="DOT" className="w-7 h-7 object-contain dark:brightness-100 brightness-50" />
            <div>
              <div className="font-black text-sm">DOT Admin</div>
              <div className="text-xs text-primary flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Control Panel</div>
            </div>
          </div>
          <button 
            type="button"
            className="lg:hidden p-2 hover:bg-accent rounded-lg"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSection(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${section === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
              data-testid={`nav-${item.id}`}
              title={item.label}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            data-testid="button-theme-toggle"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-all"
            data-testid="button-admin-logout"
            title="Logout from admin panel"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              className="lg:hidden p-2 hover:bg-accent rounded-lg"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              title="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-black text-lg capitalize">{section.replace("-", " ")}</h1>
          </div>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-accent transition-colors border border-border"
              data-testid="button-notifications"
              aria-label="Notifications"
              title="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] font-black rounded-full flex items-center justify-center px-1 leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="fixed sm:absolute right-0 sm:right-0 top-[70px] sm:top-full w-full sm:w-[420px] px-4 sm:px-0 z-50">
                <NotificationPanel onClose={() => setNotifOpen(false)} />
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6 flex-1">
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

              {/* Unread notifications quick view on dashboard */}
              {unreadCount > 0 && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <h2 className="font-bold mb-3 flex items-center gap-2 text-primary">
                    <Bell className="w-4 h-4" /> {unreadCount} Unread {unreadCount === 1 ? "Notification" : "Notifications"}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    You have pending items that need your attention — new applications and status updates awaiting action.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setNotifOpen(true)}
                    className="border-primary/30 text-primary hover:bg-primary/10"
                    title="View all notifications"
                  >
                    <Bell className="w-3.5 h-3.5 mr-2" /> View Notifications
                  </Button>
                </div>
              )}
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
                    className="pl-9 w-full"
                    data-testid="input-search-affiliates"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-full sm:w-40" data-testid="select-status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="w-full sm:w-auto border-primary/30 text-primary hover:bg-primary/5 font-bold"
                  title="Export all affiliates to CSV"
                >
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
              </div>

              <div className="rounded-2xl border border-border bg-card overflow-hidden" data-testid="affiliates-table">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">#</th>
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Name / Username</th>
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
                      ) : affiliatesData?.data.map((a) => (
                        <tr key={a.id} className="border-b border-border/50 hover:bg-accent/5 transition-colors" data-testid={`affiliate-row-${a.id}`}>
                          <td className="px-4 py-3 text-muted-foreground">
                            <RankBadge rank={a.rank ?? 0} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold">{a.name}</div>
                            <div className="text-[10px] text-primary font-bold">@{a.username}</div>
                          </td>
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
                              <AffiliateDetailDialog affiliate={a}>
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-primary hover:bg-primary/10 text-xs" data-testid={`button-view-${a.id}`}>
                                  <Eye className="w-3.5 h-3.5 mr-1" /> View
                                </Button>
                              </AffiliateDetailDialog>
                              
                              {a.status === "pending" && (
                                <Button size="sm" variant="ghost" onClick={() => handleApprove(a.id)} className="h-7 px-2 text-green-500 hover:bg-green-500/10 text-xs" data-testid={`button-approve-${a.id}`}>
                                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                                </Button>
                              )}
                              {a.status === "pending" && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500 hover:bg-red-500/10 text-xs" data-testid={`button-reject-${a.id}`}>
                                      <UserX className="w-3.5 h-3.5 mr-1" /> Reject
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="w-[95vw] sm:max-w-md">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Reject Application</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to reject the application from <strong>{a.name}</strong>? They will be notified via email and their data will be removed.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(a.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Reject Application
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
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
                                <a 
                                  href={`https://wa.me/${a.whatsappNumber.replace(/[^0-9]/g, "")}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  aria-label={`Contact ${a.name} on WhatsApp`}
                                  title={`Contact ${a.name} on WhatsApp`}
                                >
                                  <Button size="sm" variant="ghost" className="h-7 px-2 text-[#25D366] hover:bg-[#25D366]/10" data-testid={`button-whatsapp-${a.id}`}>
                                    <FaWhatsapp className="w-3.5 h-3.5" />
                                  </Button>
                                </a>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-7 px-2 text-primary hover:bg-primary/10" title="Add Test Conversion">
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="w-[95vw] sm:max-w-md">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Add Test Conversion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will add 1 paid referral to <strong>{a.name}</strong> for testing purposes.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={async () => {
                                        const token = localStorage.getItem("adminToken");
                                        await fetch("/api/admin/test/conversion", {
                                          method: "POST",
                                          headers: { 
                                            "Content-Type": "application/json",
                                            "Authorization": `Bearer ${token}`
                                          },
                                          body: JSON.stringify({ affiliateId: a.id })
                                        });
                                        invalidateAll();
                                      }}
                                    >
                                      Add Test Ref
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:bg-destructive/10" data-testid={`button-delete-${a.id}`}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="w-[95vw] sm:max-w-md">
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
              ) : !Array.isArray(activity) || activity.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No activity yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {activity.map((act: any, i: number) => (
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
              ) : !Array.isArray(topPerformers) || topPerformers.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No performers yet</p>
                </div>
              ) : topPerformers.map((a: any, i: number) => (
                <div key={a.id} className={`flex items-center gap-4 p-5 rounded-2xl border bg-card transition-all hover:border-primary/40 ${i < 3 ? "border-primary/20" : "border-border"}`} data-testid={`top-performer-${a.id}`}>
                  <div className="flex-shrink-0">
                    <RankBadge rank={i + 1} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{a.name} (@{a.username})</div>
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
                    <a 
                      href={`https://wa.me/${a.whatsappNumber.replace(/[^0-9]/g, "")}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      aria-label={`Contact ${a.name} on WhatsApp`}
                      title={`Contact ${a.name} on WhatsApp`}
                    >
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
