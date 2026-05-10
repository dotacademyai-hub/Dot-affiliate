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

const SUPPORT_WHATSAPP = "https://wa.me/2349000000000";

function StatCard({ icon, label, value, sub, highlight }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-2xl border ${highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`} data-testid={`stat-card-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${highlight ? "bg-primary/20 text-primary" : "bg-accent/50 text-muted-foreground"}`}>
        {icon}
      </div>
      <div className={`text-3xl font-black mb-1 ${highlight ? "text-primary" : "text-foreground"}`}>{value}</div>
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

  const copyLink = () => {
    if (stats?.affiliateLink) {
      navigator.clipboard.writeText(stats.affiliateLink);
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
              {isLoading ? <Skeleton className="w-24 h-4" /> : affiliate?.name}
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
            {isLoading ? <Skeleton className="w-48 h-8" /> : `Welcome, ${affiliate?.name?.split(" ")[0]}`}
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
                  {stats?.affiliateLink}
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
          <div className="mb-8 p-6 rounded-2xl border border-border bg-card flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">Your current leaderboard position</p>
              <div className="text-4xl font-black text-primary">#{stats.rank}</div>
              <p className="text-xs text-muted-foreground mt-1">Keep pushing — only paid purchases move you up</p>
            </div>
          </div>
        )}

        {/* Support */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div>
            <h3 className="font-bold mb-1">Need Help?</h3>
            <p className="text-sm text-muted-foreground">Our team is available on WhatsApp to support you.</p>
          </div>
          <a href={SUPPORT_WHATSAPP} target="_blank" rel="noopener noreferrer" data-testid="button-support">
            <Button className="bg-[#25D366] hover:bg-[#1DB954] text-white font-bold whitespace-nowrap">
              <FaWhatsapp className="w-4 h-4 mr-2" /> Contact Support
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
