import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetAffiliateMe, useUpdateAffiliateSettings, useChangePassword } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetAffiliateMeQueryKey } from "@workspace/api-client-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Moon, Sun, ArrowLeft, LogOut, Loader2, User, Lock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import logoPath from "@assets/f45832e5-fd75-4649-94b8-25101588a119_removalai_preview_1778429832966.png";
import { useToast } from "@/hooks/use-toast";

const settingsSchema = z.object({
  name: z.string().min(2, "Name too short"),
  whatsappNumber: z.string().min(7, "Required"),
  phoneNumber: z.string().optional(),
  primaryPlatform: z.enum(["instagram", "tiktok", "twitter", "snapchat", "whatsapp", "facebook"]).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(8, "Min. 8 characters"),
  confirmPassword: z.string().min(1, "Required"),
}).refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

type SettingsForm = z.infer<typeof settingsSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "twitter", label: "Twitter (X)" },
  { value: "snapchat", label: "Snapchat" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "facebook", label: "Facebook" },
];

export default function Settings() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dashData, isLoading } = useGetAffiliateMe();
  const affiliate = dashData?.affiliate;

  const updateMutation = useUpdateAffiliateSettings();
  const passwordMutation = useChangePassword();

  const settingsForm = useForm<SettingsForm>({ resolver: zodResolver(settingsSchema) });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (affiliate) {
      settingsForm.reset({
        name: affiliate.name,
        whatsappNumber: affiliate.whatsappNumber ?? "",
        phoneNumber: affiliate.phoneNumber ?? "",
        primaryPlatform: affiliate.primaryPlatform as SettingsForm["primaryPlatform"],
      });
    }
  }, [affiliate]);

  const onSaveSettings = settingsForm.handleSubmit(async (data) => {
    try {
      await updateMutation.mutateAsync({ data: { ...data, primaryPlatform: data.primaryPlatform } });
      queryClient.invalidateQueries({ queryKey: getGetAffiliateMeQueryKey() });
      toast({ title: "Settings saved", description: "Your profile has been updated." });
    } catch {
      toast({ title: "Error", description: "Failed to update settings.", variant: "destructive" });
    }
  });

  const onChangePassword = passwordForm.handleSubmit(async (data) => {
    try {
      await passwordMutation.mutateAsync({ data: { currentPassword: data.currentPassword, newPassword: data.newPassword } });
      passwordForm.reset();
      toast({ title: "Password changed", description: "Your password has been updated." });
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "data" in err ? (err as { data?: { error?: string } }).data?.error : "Failed to change password";
      toast({ title: "Error", description: msg ?? "Failed to change password", variant: "destructive" });
    }
  });

  const logout = () => {
    localStorage.removeItem("affiliateToken");
    setLocation("/auth");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/dashboard")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-accent transition-colors" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <img src={logoPath} alt="DOT" className="w-7 h-7 object-contain dark:brightness-100 brightness-50" />
            <span className="font-black">Settings</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Profile Settings */}
        <div className="rounded-2xl border border-border bg-card p-6" data-testid="card-profile-settings">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold">Profile Information</h2>
              <p className="text-xs text-muted-foreground">Update your account details</p>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <form onSubmit={onSaveSettings} className="space-y-4">
              <div>
                <Label htmlFor="s-name">Full Name</Label>
                <Input id="s-name" {...settingsForm.register("name")} className="mt-1" data-testid="input-name" />
                {settingsForm.formState.errors.name && <p className="text-destructive text-xs mt-1">{settingsForm.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="s-whatsapp">WhatsApp Number</Label>
                <Input id="s-whatsapp" {...settingsForm.register("whatsappNumber")} className="mt-1" data-testid="input-whatsapp" />
                {settingsForm.formState.errors.whatsappNumber && <p className="text-destructive text-xs mt-1">{settingsForm.formState.errors.whatsappNumber.message}</p>}
              </div>
              <div>
                <Label htmlFor="s-phone">Phone Number</Label>
                <Input id="s-phone" {...settingsForm.register("phoneNumber")} className="mt-1" data-testid="input-phone" />
              </div>
              <div>
                <Label htmlFor="s-platform">Primary Platform</Label>
                <Select
                  value={settingsForm.watch("primaryPlatform")}
                  onValueChange={(v) => settingsForm.setValue("primaryPlatform", v as SettingsForm["primaryPlatform"])}
                >
                  <SelectTrigger className="mt-1" data-testid="select-platform">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={updateMutation.isPending} className="w-full font-bold" data-testid="button-save-profile">
                {updateMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
              </Button>
            </form>
          )}
        </div>

        {/* Change Password */}
        <div className="rounded-2xl border border-border bg-card p-6" data-testid="card-password-settings">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold">Change Password</h2>
              <p className="text-xs text-muted-foreground">Update your login password</p>
            </div>
          </div>
          <form onSubmit={onChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="p-current">Current Password</Label>
              <Input id="p-current" type="password" {...passwordForm.register("currentPassword")} className="mt-1" data-testid="input-current-password" />
              {passwordForm.formState.errors.currentPassword && <p className="text-destructive text-xs mt-1">{passwordForm.formState.errors.currentPassword.message}</p>}
            </div>
            <div>
              <Label htmlFor="p-new">New Password</Label>
              <Input id="p-new" type="password" {...passwordForm.register("newPassword")} className="mt-1" data-testid="input-new-password" />
              {passwordForm.formState.errors.newPassword && <p className="text-destructive text-xs mt-1">{passwordForm.formState.errors.newPassword.message}</p>}
            </div>
            <div>
              <Label htmlFor="p-confirm">Confirm New Password</Label>
              <Input id="p-confirm" type="password" {...passwordForm.register("confirmPassword")} className="mt-1" data-testid="input-confirm-password" />
              {passwordForm.formState.errors.confirmPassword && <p className="text-destructive text-xs mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" variant="outline" disabled={passwordMutation.isPending} className="w-full font-bold" data-testid="button-change-password">
              {passwordMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</> : "Update Password"}
            </Button>
          </form>
        </div>

        {/* Logout */}
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <h2 className="font-bold mb-1 text-destructive">Sign Out</h2>
          <p className="text-sm text-muted-foreground mb-4">You'll need to log in again to access your dashboard.</p>
          <Button variant="destructive" onClick={logout} className="font-bold" data-testid="button-logout">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
