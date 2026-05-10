import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, CheckCircle, Ticket, Clock, MapPin, Users, Zap, ArrowLeft, PartyPopper, ExternalLink, Copy } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import logoPath from "@assets/f45832e5-fd75-4649-94b8-25101588a119_removalai_preview_1778429832966.png";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

type Screen = "event" | "checkout" | "success";

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
      {children}
    </span>
  );
}

export default function MockPlatform() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const [refCode, setRefCode] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("event");
  const [countdown, setCountdown] = useState(3);
  const [tracked, setTracked] = useState(false);
  const [trackStatus, setTrackStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setRefCode(ref);
  }, []);

  const handleBuyNow = () => {
    setScreen("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmPurchase = async () => {
    setScreen("success");
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (refCode && !tracked) {
      setTrackStatus("loading");
      try {
        await fetch(`${BASE_URL}/api/public/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: refCode, type: "conversion" }),
        });
        setTrackStatus("success");
        setTracked(true);
      } catch {
        setTrackStatus("error");
      }
    }

    let t = 3;
    const timer = setInterval(() => {
      t -= 1;
      setCountdown(t);
      if (t <= 0) clearInterval(timer);
    }, 1000);
  };

  const demoLink = `${window.location.origin}${BASE_URL}/demo?ref=YOURAFFILIATECODE`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top ribbon */}
      <div className="bg-primary/10 border-b border-primary/20 py-2 px-4 text-center">
        <p className="text-xs font-semibold text-primary">
          🎯 DEMO MODE — This is a mock ticketing page showing how affiliate tracking works end-to-end.
          {refCode && <> Affiliate code detected: <code className="bg-primary/20 px-1.5 py-0.5 rounded font-mono font-bold ml-1">{refCode}</code></>}
        </p>
      </div>

      {/* Nav */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to DOT
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">Mock Ticketing Platform</span>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ── HOW IT WORKS BANNER ─────────────────────────────── */}
        <div className="mb-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-black text-lg mb-1 flex items-center gap-2"><Zap className="w-5 h-5 text-primary" /> How Affiliate Tracking Works</h2>
          <p className="text-sm text-muted-foreground mb-5">When an affiliate shares their unique link, here's what happens behind the scenes:</p>
          <div className="grid sm:grid-cols-4 gap-3">
            {[
              { step: "1", title: "Affiliate shares link", desc: "Their unique link includes their code as a URL parameter: ?ref=CODE", icon: <ExternalLink className="w-4 h-4" /> },
              { step: "2", title: "Visitor clicks link", desc: "A click event is recorded for that affiliate code in real-time.", icon: <Users className="w-4 h-4" /> },
              { step: "3", title: "Visitor purchases", desc: "On checkout confirmation, a conversion event fires to your API.", icon: <Ticket className="w-4 h-4" /> },
              { step: "4", title: "Dashboard updates", desc: "Affiliate's paid referral count and rank update instantly.", icon: <CheckCircle className="w-4 h-4" /> },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-2 p-4 rounded-xl bg-accent/30 border border-border">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-black flex-shrink-0">{item.step}</span>
                  <div className="text-primary">{item.icon}</div>
                </div>
                <p className="text-xs font-bold">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Try it section */}
          <div className="mt-5 p-4 rounded-xl border border-primary/20 bg-primary/5">
            <p className="text-xs font-bold text-primary mb-2">Try it yourself — affiliate link format:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-background border border-border rounded-lg px-3 py-2 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                {demoLink}
              </code>
              <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(demoLink)} className="flex-shrink-0 gap-1.5 text-xs">
                <Copy className="w-3 h-3" /> Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Open that URL in a new tab to see the tracking in action with a real affiliate code.</p>
          </div>
        </div>

        {/* ── EVENT PAGE ──────────────────────────────────────── */}
        {screen === "event" && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Hero */}
              <div className="rounded-2xl overflow-hidden border border-border bg-card">
                <div className="h-52 bg-gradient-to-br from-black via-gray-900 to-green-950 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.3)_0%,transparent_70%)]" />
                  <div className="relative text-center">
                    <img src={logoPath} alt="DOT" className="w-16 h-16 object-contain mx-auto mb-3" />
                    <h1 className="text-4xl font-black text-white leading-none">FEARLESS</h1>
                    <h2 className="text-4xl font-black text-primary">WEEK 2.0</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Tag>Student Event</Tag>
                    <Tag>Limited Spots</Tag>
                    <Tag>Live Music</Tag>
                    <Tag>Networking</Tag>
                  </div>
                  <h2 className="text-xl font-black mb-3">FEARLESS WEEK 2.0 — The Premier Student Experience</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The most anticipated student event of the year returns. FEARLESS WEEK 2.0 brings together the brightest young minds for a week of growth, connection, and unforgettable experiences. Secure your spot before they sell out.
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="font-bold">Event Details</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { icon: <Clock className="w-4 h-4" />, label: "Date & Time", value: "July 15–21, 2025 · 10AM daily" },
                    { icon: <MapPin className="w-4 h-4" />, label: "Location", value: "Victoria Island, Lagos, Nigeria" },
                    { icon: <Users className="w-4 h-4" />, label: "Capacity", value: "500 attendees (limited)" },
                  ].map((d, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-accent/20 border border-border">
                      <div className="text-primary mt-0.5">{d.icon}</div>
                      <div>
                        <p className="text-xs text-muted-foreground">{d.label}</p>
                        <p className="text-sm font-semibold">{d.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ticket card */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-primary/30 bg-card p-6 sticky top-20 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-bold text-green-400 uppercase tracking-wider">On Sale</span>
                </div>
                <div>
                  <p className="text-3xl font-black">₦15,000</p>
                  <p className="text-xs text-muted-foreground">Early bird price · All access pass</p>
                </div>
                <div className="py-3 border-y border-border space-y-2 text-sm">
                  {["Full week access", "Welcome kit & merch", "Networking sessions", "Live performances", "Meals included"].map((p) => (
                    <div key={p} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
                {refCode && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <p className="text-xs text-primary font-medium">Affiliate referral: <strong>{refCode}</strong></p>
                  </div>
                )}
                <Button onClick={handleBuyNow} className="w-full bg-primary text-primary-foreground font-bold py-5 text-base" data-testid="button-buy-now">
                  <Ticket className="w-5 h-5 mr-2" /> Buy Now
                </Button>
                <p className="text-xs text-center text-muted-foreground">Secure payment · Instant confirmation</p>
              </div>
            </div>
          </div>
        )}

        {/* ── CHECKOUT ────────────────────────────────────────── */}
        {screen === "checkout" && (
          <div className="max-w-lg mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black">Complete Your Order</h2>
              <p className="text-muted-foreground text-sm mt-1">Mock checkout — no real payment required</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-bold">Order Summary</h3>
              <div className="flex items-center justify-between py-3 border-y border-border">
                <div>
                  <p className="font-semibold text-sm">FEARLESS WEEK 2.0 — All Access</p>
                  <p className="text-xs text-muted-foreground">July 15–21, 2025 · Victoria Island, Lagos</p>
                </div>
                <span className="font-black text-primary">₦15,000</span>
              </div>
              {refCode && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Referred by affiliate</span>
                  <code className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{refCode}</code>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Mock Payment Details</h3>
              <div className="space-y-3">
                <input className="w-full bg-accent/30 border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cardholder Name (demo)" defaultValue="Demo Attendee" readOnly />
                <input className="w-full bg-accent/30 border border-border rounded-xl px-4 py-3 text-sm font-mono" placeholder="Card Number (demo)" defaultValue="4242 4242 4242 4242" readOnly />
                <div className="grid grid-cols-2 gap-3">
                  <input className="bg-accent/30 border border-border rounded-xl px-4 py-3 text-sm font-mono" placeholder="MM/YY" defaultValue="12/27" readOnly />
                  <input className="bg-accent/30 border border-border rounded-xl px-4 py-3 text-sm font-mono" placeholder="CVV" defaultValue="123" readOnly />
                </div>
              </div>
              <p className="text-xs text-muted-foreground bg-accent/30 rounded-lg p-3">
                This is a demo. No real payment is processed. Clicking "Confirm" simulates a purchase and fires a conversion event to the affiliate tracking API.
              </p>
            </div>

            <Button onClick={handleConfirmPurchase} className="w-full bg-primary text-primary-foreground font-bold py-5 text-base" data-testid="button-confirm-purchase">
              Confirm Purchase — ₦15,000
            </Button>
            <Button variant="ghost" onClick={() => setScreen("event")} className="w-full text-sm text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to event
            </Button>
          </div>
        )}

        {/* ── SUCCESS ─────────────────────────────────────────── */}
        {screen === "success" && (
          <div className="max-w-lg mx-auto text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto animate-bounce">
              <PartyPopper className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-black">Purchase Complete!</h2>
            <p className="text-muted-foreground">Your FEARLESS WEEK 2.0 ticket has been confirmed. Check your WhatsApp for your ticket.</p>

            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-3 text-left">
              <h3 className="font-bold text-sm uppercase tracking-wider text-primary">Affiliate Tracking Result</h3>
              {!refCode ? (
                <p className="text-sm text-muted-foreground">No affiliate code was present on this purchase. In production, this means no conversion would be credited.</p>
              ) : trackStatus === "loading" ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Firing conversion event to affiliate API...
                </div>
              ) : trackStatus === "success" ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                    <CheckCircle className="w-4 h-4" /> Conversion tracked successfully!
                  </div>
                  <p className="text-xs text-muted-foreground">Affiliate code <strong className="text-foreground">{refCode}</strong> was credited with 1 paid referral. Their leaderboard rank and dashboard stats updated instantly.</p>
                  <div className="bg-background border border-border rounded-xl p-3 font-mono text-xs mt-2 space-y-1">
                    <p className="text-muted-foreground">POST /api/public/track</p>
                    <p>{`{ "code": "${refCode}", "type": "conversion" }`}</p>
                    <p className="text-green-400">→ 200 OK — conversion recorded</p>
                  </div>
                </div>
              ) : trackStatus === "error" ? (
                <div className="text-sm text-destructive">Could not reach tracking API. In production this would be retried.</div>
              ) : null}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => { setScreen("event"); setRefCode(null); setTracked(false); setTrackStatus("idle"); }} variant="outline" className="flex-1">
                Reset Demo
              </Button>
              <Button onClick={() => setLocation("/")} className="flex-1 bg-primary text-primary-foreground font-bold">
                Back to DOT Platform
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
