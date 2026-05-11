import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useGetLeaderboard } from "@workspace/api-client-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Moon, Sun, Trophy, Users, TrendingUp, Shield, ChevronRight, MessageCircle, Star, Zap, Target, ArrowRight, Menu, X } from "lucide-react";
import { SiInstagram, SiTiktok, SiX, SiSnapchat, SiFacebook } from "react-icons/si";
import { FaWhatsapp } from "react-icons/fa";
import logoPath from "@assets/f45832e5-fd75-4649-94b8-25101588a119_removalai_preview_1778429832966.png";
import flyerPath from "@assets/prizes-flyer.jpeg";

const SUPPORT_WHATSAPP = "https://wa.me/2349114896168";
const SUPPORT_EMAIL = "dotacademy.ai@gmail.com";

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

export default function Home() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { data: leaderboard, isLoading: leaderboardLoading } = useGetLeaderboard();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || mobileMenuOpen ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3" data-testid="nav-logo">
            <img src={logoPath} alt="DOT" className="w-8 h-8 object-contain dark:brightness-100 brightness-50" />
            <span className="font-black text-xl tracking-tight">DOT</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
              data-testid="button-theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href="/auth">
              <Button variant="ghost" size="sm" data-testid="button-nav-login">
                Login
              </Button>
            </Link>
            <Link href="/auth?mode=signup">
              <Button size="sm" className="bg-primary text-primary-foreground" data-testid="button-nav-apply">
                Apply Now <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Mobile Nav Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md px-6 py-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
            <Link href="/auth">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-lg font-bold" 
                onClick={() => setMobileMenuOpen(false)}
              >
                Partner Login
              </Button>
            </Link>
            <Link href="/auth?mode=signup">
              <Button 
                className="w-full text-lg font-bold py-6 bg-primary text-primary-foreground" 
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
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
            <Link href="/auth?mode=signup">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground text-base font-bold px-8 py-6 rounded-xl hover:bg-primary/90 transition-all hover:scale-105"
                data-testid="button-hero-apply"
              >
                Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/auth">
              <Button
                size="lg"
                variant="outline"
                className="text-base font-semibold px-8 py-6 rounded-xl"
                data-testid="button-hero-login"
              >
                Partner Login
              </Button>
            </Link>
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
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 lg:order-1 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
                <img 
                  src={flyerPath} 
                  alt="FEARLESS WEEK 2.0 Prizes" 
                  className="w-full h-auto object-contain hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">Win Big</span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Built the Future, <span className="text-primary">Reap the Rewards</span></h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  The top influencers who drive the most attendance for FEARLESS WEEK 2.0 stand a chance to win massive prizes. From the latest MacBook Pro M3 to an iPhone 16, your hard work as an ambassador pays off.
                </p>
              </div>
              
              <div className="grid gap-4">
                {[
                  { place: "1st Place", prize: "MacBook Pro M3 + Elite Recognition", color: "text-yellow-400" },
                  { place: "2nd Place", prize: "iPhone 16 + Elite Recognition", color: "text-gray-300" },
                  { place: "3rd Place", prize: "Creator Ultimate Kit + Elite Recognition", color: "text-amber-600" },
                  { place: "4th - 10th", prize: "Exclusive Cash Rewards & DOT Merch", color: "text-primary" },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/50 hover:bg-card transition-colors">
                    <div className={`text-sm font-black uppercase tracking-wider ${p.color} w-24`}>{p.place}</div>
                    <div className="text-sm font-semibold">{p.prize}</div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm font-bold text-primary flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Every ambassador earns 10% commission on every ticket sold!
                </p>
              </div>
            </div>
          </div>

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
            <p className="text-muted-foreground mt-3 text-sm">Ranking is strictly based on the number of <strong>paid referrals</strong>. Only ambassadors with Refs &gt; 0 are displayed.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl" data-testid="leaderboard-table">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 px-6 py-4 border-b border-border bg-muted/30">
              <span className="col-span-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">#</span>
              <span className="col-span-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Ambassador</span>
              <span className="col-span-2 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Platform</span>
              <span className="col-span-2 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Paid Refs</span>
              <span className="col-span-2 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Clicks</span>
            </div>

            {leaderboardLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-6 border-b border-border/50">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-6 flex-1 max-w-[200px]" />
                    <Skeleton className="h-6 w-20 ml-auto" />
                  </div>
                </div>
              ))
            ) : !Array.isArray(leaderboard) || leaderboard.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground" data-testid="leaderboard-empty">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-base font-semibold">No ambassadors ranked yet</p>
                <p className="text-sm mt-1">Be the first to secure a paid referral!</p>
              </div>
            ) : (
              leaderboard.map((entry: any, i: number) => (
                <div
                  key={i}
                  className={`relative flex flex-col md:grid md:grid-cols-12 px-6 py-5 border-b border-border/50 items-start md:items-center hover:bg-primary/5 transition-all group ${i < 3 ? "bg-primary/3" : ""}`}
                  data-testid={`leaderboard-row-${entry.rank}`}
                >
                  {/* Rank & Username Row */}
                  <div className="flex items-center justify-between w-full md:col-span-6 mb-4 md:mb-0">
                    <div className="flex items-center gap-4">
                      <RankBadge rank={entry.rank} />
                      <div className="flex flex-col">
                        <span className={`font-black tracking-tight ${entry.rank <= 10 ? "text-foreground" : "text-foreground/80"}`}>
                          {entry.username}
                        </span>
                        <div className="md:hidden mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gradient-to-r ${platformColors[entry.primaryPlatform] ?? "from-gray-500 to-gray-700"} text-white`}>
                            {platformIcons[entry.primaryPlatform]}
                            {entry.primaryPlatform}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mobile Stats Summary */}
                    <div className="md:hidden text-right">
                      <div className="text-[10px] font-black uppercase text-muted-foreground mb-0.5">Paid Refs</div>
                      <div className="text-xl font-black text-primary leading-none">{entry.conversions}</div>
                    </div>
                  </div>

                  {/* Platform & Stats Row (Desktop) / Extra Stats (Mobile) */}
                  <div className="flex items-center justify-between w-full md:contents">
                    <div className="hidden md:flex md:col-span-2 justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-gradient-to-r ${platformColors[entry.primaryPlatform] ?? "from-gray-500 to-gray-700"} text-white shadow-lg`}>
                        {platformIcons[entry.primaryPlatform]}
                        {entry.primaryPlatform}
                      </span>
                    </div>
                    
                    {/* Desktop Stats */}
                    <div className="hidden md:block md:col-span-2 text-right">
                      <span className="text-lg font-black text-primary">{entry.conversions}</span>
                    </div>
                    <div className="hidden md:block md:col-span-2 text-right">
                      <span className="text-sm font-bold text-muted-foreground">{entry.clicks} <span className="text-[10px] uppercase ml-0.5">Clicks</span></span>
                    </div>

                    {/* Mobile Extra Stats */}
                    <div className="md:hidden flex items-center gap-4 text-xs font-bold text-muted-foreground">
                       <span>{entry.clicks} Clicks</span>
                       <div className="w-1 h-1 rounded-full bg-border" />
                       <span className="text-primary/80 uppercase">{entry.conversions} Conversions</span>
                    </div>
                  </div>
                  
                  {/* Decorative indicator for Top 10 */}
                  {entry.rank <= 10 && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40 md:bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              ))
            )}
          </div>
          <div className="mt-8 text-center">
            <Link href="/auth?mode=signup">
              <Button size="lg" className="bg-primary text-primary-foreground font-bold" data-testid="button-leaderboard-cta">
                Join the Competition <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SUPPORT */}
      <section id="support" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">Get Help</span>
          <h2 className="text-3xl font-black tracking-tight mb-4">Need Support?</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            Have questions about the program, your application, or your affiliate dashboard?
            Our team is available to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={SUPPORT_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-support-whatsapp"
              className="w-full sm:w-auto"
            >
              <Button size="lg" className="w-full bg-[#25D366] hover:bg-[#1DB954] text-white font-bold px-8 py-6 rounded-xl">
                <FaWhatsapp className="w-5 h-5 mr-2" /> WhatsApp Support
              </Button>
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="w-full sm:w-auto"
              data-testid="button-support-email"
            >
              <Button size="lg" variant="outline" className="w-full border-primary/30 hover:bg-primary/5 font-bold px-8 py-6 rounded-xl">
                <MessageCircle className="w-5 h-5 mr-2 text-primary" /> Email Support
              </Button>
            </a>
          </div>
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
            <Link href="/auth">
              <button className="hover:text-foreground transition-colors">Partner Login</button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
