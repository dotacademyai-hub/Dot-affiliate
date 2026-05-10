import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGetLeaderboard } from "@workspace/api-client-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Moon, Sun, Trophy, Users, TrendingUp, Shield, ChevronRight, MessageCircle, Star, Zap, Target, ArrowRight } from "lucide-react";
import { SiInstagram, SiTiktok, SiX, SiSnapchat, SiFacebook } from "react-icons/si";
import { FaWhatsapp } from "react-icons/fa";
import logoPath from "@assets/f45832e5-fd75-4649-94b8-25101588a119_removalai_preview_1778429832966.png";

const SUPPORT_WHATSAPP = "https://wa.me/2349000000000";

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <SiInstagram className="w-4 h-4" />,
  tiktok: <SiTiktok className="w-4 h-4" />,
  twitter: <SiX className="w-4 h-4" />,
  snapchat: <SiSnapchat className="w-4 h-4" />,
  whatsapp: <FaWhatsapp className="w-4 h-4" />,
  facebook: <SiFacebook className="w-4 h-4" />,
};

const platformColors: Record<string, string> = {
  instagram: "from-pink-500 to-purple-600",
  tiktok: "from-cyan-400 to-black",
  twitter: "from-gray-400 to-gray-700",
  snapchat: "from-yellow-400 to-yellow-600",
  whatsapp: "from-green-400 to-green-700",
  facebook: "from-blue-500 to-blue-800",
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-yellow-400 font-black text-lg">01</span>;
  if (rank === 2) return <span className="text-gray-300 font-black text-lg">02</span>;
  if (rank === 3) return <span className="text-amber-600 font-black text-lg">03</span>;
  return <span className="text-muted-foreground font-bold text-sm">{String(rank).padStart(2, "0")}</span>;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { data: leaderboard, isLoading: leaderboardLoading } = useGetLeaderboard();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3" data-testid="nav-logo">
            <img src={logoPath} alt="DOT" className="w-8 h-8 object-contain dark:brightness-100 brightness-50" />
            <span className="font-black text-xl tracking-tight">DOT</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
              data-testid="button-theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/auth")} data-testid="button-nav-login">
              Login
            </Button>
            <Button size="sm" onClick={() => setLocation("/auth?mode=signup")} className="bg-primary text-primary-foreground" data-testid="button-nav-apply">
              Apply Now <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-16">
        <div className="absolute inset-0 dark:opacity-100 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-8" data-testid="hero-badge">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Limited Spots Available</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6" data-testid="hero-headline">
            FEARLESS
            <span className="block text-primary">WEEK 2.0</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
            Partner with DOT to drive attendance for the most anticipated student event of the year.
            Get your unique tracking link, exclusive incentives, and direct access to our team.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-10">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-amber-500 font-medium">Only affiliates whose referrals PURCHASE the product are tracked and rewarded</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setLocation("/auth?mode=signup")}
              className="bg-primary text-primary-foreground text-base font-bold px-8 py-6 rounded-xl hover:bg-primary/90 transition-all hover:scale-105"
              data-testid="button-hero-apply"
            >
              Become a Partner <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation("/auth")}
              className="text-base font-semibold px-8 py-6 rounded-xl"
              data-testid="button-hero-login"
            >
              Partner Login
            </Button>
          </div>
        </div>
        <div className="absolute bottom-10 left-0 right-0 flex justify-center animate-bounce">
          <div className="w-6 h-9 border-2 border-primary/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-primary rounded-full" />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">The Process</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: <Target className="w-6 h-6" />, title: "Apply", desc: "Submit your influencer profile. Tell us your reach, platforms, and why you're the right fit for FEARLESS WEEK 2.0." },
              { step: "02", icon: <Shield className="w-6 h-6" />, title: "Get Approved", desc: "Our team reviews your application. Selected partners receive a unique tracking link and onboarding details within 48 hours." },
              { step: "03", icon: <TrendingUp className="w-6 h-6" />, title: "Earn", desc: "Share your link and earn rewards for every confirmed purchase. Track your rank, conversions, and impact in real-time." },
            ].map((item, i) => (
              <div key={i} className="relative p-8 rounded-2xl border border-border bg-card group hover:border-primary/40 transition-all" data-testid={`card-step-${i}`}>
                <div className="absolute -top-3 -right-3 text-6xl font-black text-primary/5 group-hover:text-primary/10 transition-colors select-none">{item.step}</div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAID ONLY NOTICE */}
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1 text-amber-500">Paid Referrals Only</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We only track and reward affiliates whose referrals <strong className="text-foreground">complete a purchase</strong> of the product.
                Clicks and sign-ups alone do not count toward your conversion score or leaderboard ranking.
                Only confirmed, paid transactions are credited to your affiliate account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PERKS */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">Why Partner With Us</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">What You Get</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Zap />, title: "Unique Tracking Link", desc: "Your personal affiliate link with real-time analytics dashboard." },
              { icon: <Star />, title: "Exclusive Incentives", desc: "Top performers receive special rewards and recognition." },
              { icon: <Users />, title: "Direct Access", desc: "Get direct communication with the DOT organizing team." },
              { icon: <Trophy />, title: "Public Leaderboard", desc: "Compete with other affiliates and climb the rankings." },
            ].map((perk, i) => (
              <div key={i} className="p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all" data-testid={`card-perk-${i}`}>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {perk.icon}
                </div>
                <h3 className="font-bold mb-2">{perk.title}</h3>
                <p className="text-muted-foreground text-sm">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERBOARD */}
      <section id="leaderboard" className="py-24 px-6 bg-accent/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">Live Rankings</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight flex items-center justify-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" /> Top Affiliates
            </h2>
            <p className="text-muted-foreground mt-3 text-sm">Updated in real-time. Only paid referrals count toward rankings.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card overflow-hidden" data-testid="leaderboard-table">
            <div className="grid grid-cols-12 px-6 py-3 border-b border-border bg-muted/30">
              <span className="col-span-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">#</span>
              <span className="col-span-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Affiliate</span>
              <span className="col-span-3 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Platform</span>
              <span className="col-span-2 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Paid Refs</span>
              <span className="col-span-1 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Clicks</span>
            </div>
            {leaderboardLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 px-6 py-4 border-b border-border/50">
                  <Skeleton className="col-span-1 h-5 w-8" />
                  <Skeleton className="col-span-5 h-5 w-32" />
                  <Skeleton className="col-span-3 h-5 w-20 mx-auto" />
                  <Skeleton className="col-span-2 h-5 w-10 ml-auto" />
                  <Skeleton className="col-span-1 h-5 w-10 ml-auto" />
                </div>
              ))
            ) : !leaderboard || leaderboard.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground" data-testid="leaderboard-empty">
                <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No active affiliates yet. Be the first to join!</p>
              </div>
            ) : (
              leaderboard.map((entry, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-12 px-6 py-4 border-b border-border/50 items-center hover:bg-accent/5 transition-colors ${i < 3 ? "bg-primary/3" : ""}`}
                  data-testid={`leaderboard-row-${entry.rank}`}
                >
                  <div className="col-span-1">
                    <RankBadge rank={entry.rank} />
                  </div>
                  <div className="col-span-5">
                    <span className={`font-semibold ${i < 3 ? "text-foreground" : "text-foreground/80"}`}>{entry.name}</span>
                  </div>
                  <div className="col-span-3 flex justify-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${platformColors[entry.primaryPlatform] ?? "from-gray-500 to-gray-700"} text-white`}>
                      {platformIcons[entry.primaryPlatform]}
                      {entry.primaryPlatform.charAt(0).toUpperCase() + entry.primaryPlatform.slice(1)}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="font-bold text-primary">{entry.conversions}</span>
                  </div>
                  <div className="col-span-1 text-right">
                    <span className="text-muted-foreground text-sm">{entry.clicks}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-8 text-center">
            <Button size="lg" onClick={() => setLocation("/auth?mode=signup")} className="bg-primary text-primary-foreground font-bold" data-testid="button-leaderboard-cta">
              Join the Competition <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* SUPPORT */}
      <section id="support" className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">Get Help</span>
          <h2 className="text-3xl font-black tracking-tight mb-4">Need Support?</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Have questions about the program, your application, or your affiliate dashboard?
            Our team is available on WhatsApp to help you succeed.
          </p>
          <a
            href={SUPPORT_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="button-support-whatsapp"
          >
            <Button size="lg" className="bg-[#25D366] hover:bg-[#1DB954] text-white font-bold px-8 py-6 rounded-xl">
              <FaWhatsapp className="w-5 h-5 mr-2" /> Contact Support on WhatsApp
            </Button>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoPath} alt="DOT" className="w-7 h-7 object-contain dark:brightness-100 brightness-50" />
            <span className="font-black text-lg">DOT</span>
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} DOT. FEARLESS WEEK 2.0 — All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#support" className="hover:text-foreground transition-colors">Support</a>
            <button onClick={() => setLocation("/auth")} className="hover:text-foreground transition-colors">Partner Login</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
