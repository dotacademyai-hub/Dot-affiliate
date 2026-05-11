import { useState } from "react";
import { useLocation } from "wouter";
import { useGetAffiliateMe } from "@workspace/api-client-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Moon, Sun, Settings, LogOut, Copy, CheckCheck, Trophy, TrendingUp, MousePointer, ShoppingCart, MessageCircle, AlertTriangle, Clock
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import logoPath from "@assets/f45832e5-fd75-4649-94b8-25101588a119_removalai_preview_1778429832966.png";
import { useToast } from "@/hooks/use-toast";

const SUPPORT_WHATSAPP = "https://wa.me/2349114896168";
const SUPPORT_EMAIL = "dotacademy.ai@gmail.com";

function StatCard({ icon, label, value, sub, highlight, rank }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; highlight?: boolean, rank?: number | null }) {
  const getRankColor = (r: number) => {
    if (r === 1) return "text-yellow-400 italic font-black drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]";
    if (r === 2) return "text-slate-100 italic font-black drop-shadow-[0_0_8px_rgba(226,232,240,0.4)]";
    if (r === 3) return "text-amber-500 italic font-black drop-shadow-[0_0_8px_rgba(217,119,6,0.4)]";
    if (r === 4) return "text-cyan-400 italic font-black drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]";
    if (r <= 10) return "text-emerald-500 font-black drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]";
    return "text-primary";
  };

  return (
    <div className={`p-6 rounded-2xl border ${highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`} data-testid={`stat-card-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${highlight ? "bg-primary/20 text-primary" : "bg-accent/50 text-muted-foreground"}`}>
        {icon}
      </div>
      <div className={`text-3xl font-black mb-1 ${rank ? getRankColor(rank) : highlight ? "text-primary" : "text-foreground"}`}>{value}</div>
      <div className="text-sm font-semibold text-foreground/80">{label}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: dashData, isLoading } = useGetAffiliateMe();

  const affiliate = dashData?.affiliate;
  const stats = dashData?.stats;

  const getAffiliateLink = () => {
    if (!affiliate?.affiliateCode) return "";
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/ref/${affiliate.affiliateCode}`;
  };

  const copyLink = () => {
    const link = getAffiliateLink();
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast({ title: "Copied!", description: "Your affiliate link has been copied." });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const logout = () => {
    localStorage.removeItem("affiliateToken");
    setLocation("/auth");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoPath} alt="DOT" className="w-8 h-8 object-contain dark:brightness-100 brightness-50" />
            <span className="font-black text-lg">DOT</span>
            <span className="text-muted-foreground text-sm hidden sm:block">/ Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground hidden sm:block" data-testid="text-affiliate-name">
              {isLoading ? <Skeleton className="w-24 h-4" /> : affiliate?.username}
            </span>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/settings")} data-testid="button-settings">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} data-testid="button-logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Status banners */}
        {!isLoading && affiliate?.status === "pending" && (
          <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-3" data-testid="banner-pending">
            <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-500 text-sm">Application Under Review</p>
              <p className="text-xs text-muted-foreground">Your application is being reviewed. You'll receive access to your affiliate link once approved.</p>
            </div>
          </div>
        )}
        {!isLoading && affiliate?.status === "suspended" && (
          <div className="mb-6 p-4 rounded-xl border border-destructive/30 bg-destructive/10 flex items-center gap-3" data-testid="banner-suspended">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
            <div>
              <p className="font-semibold text-destructive text-sm">Account Suspended</p>
              <p className="text-xs text-muted-foreground">Your account has been suspended. Contact support on WhatsApp for assistance.</p>
            </div>
          </div>
        )}

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black">
            {isLoading ? <Skeleton className="w-48 h-8" /> : `Welcome, ${affiliate?.username}`}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Your FEARLESS WEEK 2.0 affiliate dashboard</p>
        </div>

        {/* Affiliate Link */}
        {affiliate?.status === "active" && (
          <div className="mb-8 p-6 rounded-2xl border border-primary/30 bg-primary/5" data-testid="affiliate-link-card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Your Affiliate Link</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Share this link. Only paid purchases through your link count toward your conversions.</p>
            {isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-background border border-border rounded-xl px-4 py-3 font-mono text-sm overflow-hidden text-ellipsis whitespace-nowrap" data-testid="text-affiliate-link">
                  {getAffiliateLink()}
                </div>
                <Button onClick={copyLink} variant="outline" className="flex-shrink-0 gap-2" data-testid="button-copy-link">
                  {copied ? <><CheckCheck className="w-4 h-4 text-primary" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)
          ) : (
            <>
              <StatCard
                icon={<ShoppingCart className="w-5 h-5" />}
                label="Paid Referrals"
                value={stats?.conversions ?? 0}
                sub="Confirmed purchases"
                highlight
              />
              <StatCard
                icon={<MousePointer className="w-5 h-5" />}
                label="Total Clicks"
                value={stats?.clicks ?? 0}
                sub="Link clicks tracked"
              />
              <StatCard
                icon={<Trophy className="w-5 h-5" />}
                label="Leaderboard Rank"
                value={stats?.rank ? `#${stats.rank}` : "—"}
                sub="Among active affiliates"
                rank={stats?.rank}
              />
              <StatCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Conversion Rate"
                value={stats?.clicks ? `${Math.round((stats.conversions / stats.clicks) * 100)}%` : "—"}
                sub="Clicks to purchases"
              />
            </>
          )}
        </div>

        {/* Paid refs notice */}
        <div className="mb-8 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-amber-500">Paid Referrals Only.</span>{" "}
            Your "Paid Referrals" count only includes referrals that have completed a purchase. Clicks alone do not count toward your ranking or rewards.
          </p>
        </div>

        {/* Rank card */}
        {!isLoading && stats?.rank && (
          <div className={`mb-8 p-6 rounded-2xl border flex items-center gap-6 ${
            stats.rank === 1 ? "border-yellow-400/30 bg-yellow-400/5 shadow-[0_0_20px_rgba(250,204,21,0.1)]" :
            stats.rank === 2 ? "border-slate-300/30 bg-slate-300/5" :
            stats.rank === 3 ? "border-amber-600/30 bg-amber-600/5" :
            stats.rank <= 10 ? "border-primary/30 bg-primary/5" :
            "border-border bg-card"
          }`}>
            <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center flex-shrink-0 ${
              stats.rank === 1 ? "bg-yellow-400 border-yellow-500 text-black shadow-[0_0_20px_rgba(250,204,21,0.4)]" :
              stats.rank === 2 ? "bg-slate-300 border-slate-400 text-black" :
              stats.rank === 3 ? "bg-amber-600 border-amber-700 text-white" :
              stats.rank <= 10 ? "bg-emerald-500 border-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" :
              "bg-primary/10 border-primary/20 text-primary"
            }`}>
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">Your current leaderboard position</p>
              <div className={`text-4xl font-black ${
                stats.rank === 1 ? "text-yellow-400 italic drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" :
                stats.rank === 2 ? "text-slate-100 italic drop-shadow-[0_0_10px_rgba(226,232,240,0.5)]" :
                stats.rank === 3 ? "text-amber-500 italic drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]" :
                stats.rank === 4 ? "text-cyan-400 italic drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" :
                stats.rank <= 10 ? "text-emerald-500 font-black drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]" :
                "text-primary"
              }`}>
                #{stats.rank}
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Ranked by total <strong>paid referrals</strong> — keep pushing!</p>
            </div>
          </div>
        )}

        {/* Support Section */}
        <div className="mt-12 p-8 rounded-2xl border border-primary/20 bg-primary/5 text-center">
          <h2 className="text-xl font-bold mb-2">Need Help?</h2>
          <p className="text-sm text-muted-foreground mb-6">Our support team is here to help you with your application or dashboard.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={SUPPORT_WHATSAPP} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button className="w-full bg-[#25D366] hover:bg-[#1DB954] text-white font-bold" data-testid="button-dashboard-wa">
                <FaWhatsapp className="w-4 h-4 mr-2" /> WhatsApp Support
              </Button>
            </a>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full border-primary/30 hover:bg-primary/10 font-bold" data-testid="button-dashboard-email">
                <MessageCircle className="w-4 h-4 mr-2 text-primary" /> Email Support
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
