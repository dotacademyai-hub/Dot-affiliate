import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLoginAffiliate, useRegisterAffiliate } from "@workspace/api-client-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Moon, Sun, ArrowLeft, ArrowRight, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";
import logoPath from "@assets/f45832e5-fd75-4649-94b8-25101588a119_removalai_preview_1778429832966.png";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username required"),
  password: z.string().min(1, "Password required"),
});

const signupStep1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores allowed"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  whatsappNumber: z.string().min(7, "WhatsApp number required"),
  phoneNumber: z.string().optional(),
});

const signupStep2Schema = z.object({
  primaryPlatform: z.enum(["instagram", "tiktok", "twitter", "snapchat", "whatsapp", "facebook"]),
  avgEngagement: z.string().min(1, "Required"),
});

const signupStep3Schema = z.object({
  hasPromotedBefore: z.enum(["true", "false"]),
  whatsappGroupsReach: z.string().min(1, "Required"),
  ticketsSellEstimate: z.enum(["0-50", "50-100", "100+"]),
  estimatedReach: z.string().optional(),
  willingToPromote: z.enum(["true", "false"]),
});

const signupStep4Schema = z.object({
  whySelectYou: z.string().min(20, "Please write at least 20 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;
type Step1Form = z.infer<typeof signupStep1Schema>;
type Step2Form = z.infer<typeof signupStep2Schema>;
type Step3Form = z.infer<typeof signupStep3Schema>;
type Step4Form = z.infer<typeof signupStep4Schema>;

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "twitter", label: "Twitter (X)" },
  { value: "snapchat", label: "Snapchat" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "facebook", label: "Facebook" },
];

const STEP_LABELS = ["Personal Info", "Platform", "Experience", "Final Step"];

function RadioGroup({ options, value, onChange, name }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void; name: string }) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${value === opt.value ? "border-primary bg-primary/10 text-foreground" : "border-border hover:border-primary/40"}`}>
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${value === opt.value ? "border-primary" : "border-muted-foreground/40"}`}>
            {value === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
          </div>
          <span className="text-sm font-medium">{opt.label}</span>
          <input type="radio" name={name} value={opt.value} className="sr-only" onChange={() => onChange(opt.value)} />
        </label>
      ))}
    </div>
  );
}

function PasswordInput({ id, placeholder, registration, error, testId }: {
  id: string;
  placeholder: string;
  registration: object;
  error?: string;
  testId?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="relative mt-1">
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          autoComplete="new-password"
          className="pr-10"
          data-testid={testId}
          {...registration}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-destructive text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function Auth() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState(1);
  const [signupData, setSignupData] = useState<Partial<Step1Form & Step2Form & Step3Form & Step4Form>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup") setMode("signup");
  }, []);

  const switchMode = (m: "login" | "signup") => {
    setMode(m);
    setStep(1);
    setSignupData({});
  };

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const step1Form = useForm<Step1Form>({ resolver: zodResolver(signupStep1Schema), defaultValues: signupData as Step1Form });
  const step2Form = useForm<Step2Form>({ resolver: zodResolver(signupStep2Schema), defaultValues: signupData as Step2Form });
  const step3Form = useForm<Step3Form>({ resolver: zodResolver(signupStep3Schema), defaultValues: signupData as Step3Form });
  const step4Form = useForm<Step4Form>({ resolver: zodResolver(signupStep4Schema), defaultValues: signupData as Step4Form });

  const loginMutation = useLoginAffiliate();
  const registerMutation = useRegisterAffiliate();

  const onLogin = loginForm.handleSubmit(async (data) => {
    try {
      const res = await loginMutation.mutateAsync({ data });
      if (res.role === "admin") {
        localStorage.setItem("adminToken", res.token);
        setLocation("/fearless-control-gate-2025");
      } else {
        localStorage.setItem("affiliateToken", res.token);
        setLocation("/dashboard");
      }
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "data" in err ? (err as { data?: { error?: string } }).data?.error : "Login failed";
      toast({ title: "Login failed", description: msg ?? "Invalid credentials", variant: "destructive" });
    }
  });

  const goNext = async () => {
    let valid = false;
    if (step === 1) {
      valid = await step1Form.trigger();
      if (valid) setSignupData((d) => ({ ...d, ...step1Form.getValues() }));
    } else if (step === 2) {
      valid = await step2Form.trigger();
      if (valid) setSignupData((d) => ({ ...d, ...step2Form.getValues() }));
    } else if (step === 3) {
      valid = await step3Form.trigger();
      if (valid) setSignupData((d) => ({ ...d, ...step3Form.getValues() }));
    }
    if (valid) setStep((s) => s + 1);
  };

  const goBack = () => setStep((s) => s - 1);

  const onSubmit = step4Form.handleSubmit(async (data) => {
    const all = { ...signupData, ...data };
    const payload = {
      name: all.name!,
      username: all.username!,
      email: all.email!,
      password: all.password!,
      whatsappNumber: all.whatsappNumber!,
      phoneNumber: all.phoneNumber ?? null,
      primaryPlatform: all.primaryPlatform! as "instagram" | "tiktok" | "twitter" | "snapchat" | "whatsapp" | "facebook",
      avgEngagement: all.avgEngagement!,
      hasPromotedBefore: all.hasPromotedBefore === "true",
      whatsappGroupsReach: all.whatsappGroupsReach!,
      ticketsSellEstimate: all.ticketsSellEstimate! as "0-50" | "50-100" | "100+",
      estimatedReach: all.estimatedReach ?? null,
      willingToPromote: all.willingToPromote === "true",
      whySelectYou: all.whySelectYou!,
    };
    try {
      const res = await registerMutation.mutateAsync({ data: payload });
      localStorage.setItem("affiliateToken", res.token);
      setLocation("/dashboard");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "data" in err ? (err as { data?: { error?: string } }).data?.error : "Registration failed";
      toast({ title: "Registration failed", description: msg ?? "Please try again", variant: "destructive" });
    }
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link href="/">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4" />
            <img src={logoPath} alt="DOT" className="w-7 h-7 object-contain dark:brightness-100 brightness-50" />
            <span className="font-black">DOT</span>
          </button>
        </Link>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
          data-testid="button-theme-toggle-auth"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex rounded-xl border border-border bg-card p-1 mb-8">
            <button onClick={() => switchMode("login")} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`} data-testid="button-mode-login">
              Login
            </button>
            <button onClick={() => switchMode("signup")} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`} data-testid="button-mode-signup">
              Apply Now
            </button>
          </div>

          {mode === "login" ? (
            <div data-testid="login-form">
              <h1 className="text-2xl font-black mb-1">Welcome back</h1>
              <p className="text-muted-foreground text-sm mb-8">Sign in to your affiliate dashboard</p>
              <form onSubmit={onLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-identifier">Email or Username</Label>
                  <Input id="login-identifier" placeholder="you@example.com or username" autoComplete="username" {...loginForm.register("identifier")} className="mt-1" data-testid="input-login-identifier" />
                  {loginForm.formState.errors.identifier && <p className="text-destructive text-xs mt-1">{loginForm.formState.errors.identifier.message}</p>}
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <PasswordInput
                    id="login-password"
                    placeholder="••••••••"
                    registration={loginForm.register("password")}
                    error={loginForm.formState.errors.password?.message}
                    testId="input-login-password"
                  />
                </div>
                <Button type="submit" className="w-full font-bold" disabled={loginMutation.isPending} data-testid="button-login-submit">
                  {loginMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</> : "Sign In"}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-6">
                Not a partner yet?{" "}
                <button onClick={() => switchMode("signup")} className="text-primary font-semibold hover:underline" data-testid="button-switch-to-signup">Apply now</button>
              </p>
            </div>
          ) : (
            <div data-testid="signup-form">
              <div className="mb-6">
                <h1 className="text-xl font-black mb-1">FEARLESS WEEK 2.0</h1>
                <p className="text-sm font-semibold text-primary mb-2">Influencer Partner Application</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We're onboarding a limited number of influencers to help drive attendance. If selected, you'll receive a unique tracking link, incentives, and direct access to our team.
                </p>
              </div>

              <div className="flex items-center gap-2 mb-8">
                {STEP_LABELS.map((label, i) => (
                  <div key={i} className="flex items-center gap-2 flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${i + 1 < step ? "bg-primary text-primary-foreground" : i + 1 === step ? "bg-primary/20 border-2 border-primary text-primary" : "bg-muted text-muted-foreground"}`}>
                      {i + 1 < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    {i < STEP_LABELS.length - 1 && <div className={`flex-1 h-0.5 ${i + 1 < step ? "bg-primary" : "bg-border"}`} />}
                  </div>
                ))}
              </div>

              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Step {step} of 4 — {STEP_LABELS[step - 1]}
              </div>

              {step === 1 && (
                <div className="space-y-4" data-testid="signup-step-1">
                  <div>
                    <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                    <Input id="name" placeholder="Your full name" {...step1Form.register("name")} className="mt-1" data-testid="input-name" />
                    {step1Form.formState.errors.name && <p className="text-destructive text-xs mt-1">{step1Form.formState.errors.name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="username">Username <span className="text-destructive">*</span></Label>
                    <Input id="username" placeholder="Choose a username" {...step1Form.register("username")} className="mt-1" data-testid="input-username" />
                    {step1Form.formState.errors.username && <p className="text-destructive text-xs mt-1">{step1Form.formState.errors.username.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="su-email">Email <span className="text-destructive">*</span></Label>
                    <Input id="su-email" type="email" placeholder="you@example.com" autoComplete="email" {...step1Form.register("email")} className="mt-1" data-testid="input-email" />
                    {step1Form.formState.errors.email && <p className="text-destructive text-xs mt-1">{step1Form.formState.errors.email.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="su-password">Password <span className="text-destructive">*</span></Label>
                    <PasswordInput
                      id="su-password"
                      placeholder="Min. 8 characters"
                      registration={step1Form.register("password")}
                      error={step1Form.formState.errors.password?.message}
                      testId="input-password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp Number <span className="text-destructive">*</span></Label>
                    <Input id="whatsapp" placeholder="+234..." {...step1Form.register("whatsappNumber")} className="mt-1" data-testid="input-whatsapp" />
                    {step1Form.formState.errors.whatsappNumber && <p className="text-destructive text-xs mt-1">{step1Form.formState.errors.whatsappNumber.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+234... (optional)" {...step1Form.register("phoneNumber")} className="mt-1" data-testid="input-phone" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5" data-testid="signup-step-2">
                  <div>
                    <Label className="mb-2 block">Primary Platform <span className="text-destructive">*</span></Label>
                    <RadioGroup options={PLATFORMS} value={step2Form.watch("primaryPlatform") ?? ""} onChange={(v) => step2Form.setValue("primaryPlatform", v as never, { shouldValidate: true })} name="primaryPlatform" />
                    {step2Form.formState.errors.primaryPlatform && <p className="text-destructive text-xs mt-1">{step2Form.formState.errors.primaryPlatform.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="engagement">Average Engagement Per Post <span className="text-destructive">*</span></Label>
                    <Input id="engagement" placeholder="e.g. 5K-10K likes/views" {...step2Form.register("avgEngagement")} className="mt-1" data-testid="input-engagement" />
                    {step2Form.formState.errors.avgEngagement && <p className="text-destructive text-xs mt-1">{step2Form.formState.errors.avgEngagement.message}</p>}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5" data-testid="signup-step-3">
                  <div>
                    <Label className="mb-2 block">Have you promoted events or products before? <span className="text-destructive">*</span></Label>
                    <RadioGroup options={[{ value: "true", label: "YES" }, { value: "false", label: "NO" }]} value={step3Form.watch("hasPromotedBefore") ?? ""} onChange={(v) => step3Form.setValue("hasPromotedBefore", v as never, { shouldValidate: true })} name="hasPromotedBefore" />
                    {step3Form.formState.errors.hasPromotedBefore && <p className="text-destructive text-xs mt-1">Required</p>}
                  </div>
                  <div>
                    <Label htmlFor="groups">How many WhatsApp groups/broadcast lists can you reach? <span className="text-destructive">*</span></Label>
                    <Input id="groups" placeholder="e.g. 10 groups, 5 broadcast lists" {...step3Form.register("whatsappGroupsReach")} className="mt-1" data-testid="input-groups" />
                    {step3Form.formState.errors.whatsappGroupsReach && <p className="text-destructive text-xs mt-1">{step3Form.formState.errors.whatsappGroupsReach.message}</p>}
                  </div>
                  <div>
                    <Label className="mb-2 block">How many tickets can you realistically help us sell? <span className="text-destructive">*</span></Label>
                    <RadioGroup options={[{ value: "0-50", label: "0–50" }, { value: "50-100", label: "50–100" }, { value: "100+", label: "100+" }]} value={step3Form.watch("ticketsSellEstimate") ?? ""} onChange={(v) => step3Form.setValue("ticketsSellEstimate", v as never, { shouldValidate: true })} name="ticketsSellEstimate" />
                    {step3Form.formState.errors.ticketsSellEstimate && <p className="text-destructive text-xs mt-1">Required</p>}
                  </div>
                  <div>
                    <Label htmlFor="reach">Estimated number of people you can reach directly</Label>
                    <Input id="reach" placeholder="e.g. 15,000" {...step3Form.register("estimatedReach")} className="mt-1" data-testid="input-reach" />
                  </div>
                  <div>
                    <Label className="mb-2 block">Are you willing to actively promote FEARLESS WEEK over the next 30 days? <span className="text-destructive">*</span></Label>
                    <RadioGroup options={[{ value: "true", label: "YES" }, { value: "false", label: "NO" }]} value={step3Form.watch("willingToPromote") ?? ""} onChange={(v) => step3Form.setValue("willingToPromote", v as never, { shouldValidate: true })} name="willingToPromote" />
                    {step3Form.formState.errors.willingToPromote && <p className="text-destructive text-xs mt-1">Required</p>}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4" data-testid="signup-step-4">
                  <div>
                    <Label htmlFor="why">Why should we select you as a partner? <span className="text-destructive">*</span></Label>
                    <Textarea id="why" placeholder="Tell us about yourself, your audience, and why you're the right fit for FEARLESS WEEK 2.0..." rows={6} {...step4Form.register("whySelectYou")} className="mt-1 resize-none" data-testid="textarea-why" />
                    {step4Form.formState.errors.whySelectYou && <p className="text-destructive text-xs mt-1">{step4Form.formState.errors.whySelectYou.message}</p>}
                  </div>
                  <p className="text-xs text-muted-foreground bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                    Note: Only affiliates whose referrals complete a purchase are tracked and rewarded.
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={goBack} className="flex-1" data-testid="button-back">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                )}
                {step < 4 ? (
                  <Button type="button" onClick={goNext} className="flex-1 bg-primary text-primary-foreground font-bold" data-testid="button-next">
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="button" onClick={() => onSubmit()} className="flex-1 bg-primary text-primary-foreground font-bold" disabled={registerMutation.isPending} data-testid="button-submit">
                    {registerMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : "Submit Application"}
                  </Button>
                )}
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already a partner?{" "}
                <button onClick={() => switchMode("login")} className="text-primary font-semibold hover:underline" data-testid="button-switch-to-login">Sign in</button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
