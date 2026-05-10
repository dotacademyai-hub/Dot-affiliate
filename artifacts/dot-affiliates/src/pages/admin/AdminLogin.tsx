import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Moon, Sun, ShieldCheck } from "lucide-react";
import logoPath from "@assets/f45832e5-fd75-4649-94b8-25101588a119_removalai_preview_1778429832966.png";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  username: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
});

type AdminLoginForm = z.infer<typeof schema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const mutation = useAdminLogin();

  const form = useForm<AdminLoginForm>({ resolver: zodResolver(schema) });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const res = await mutation.mutateAsync({ data });
      localStorage.setItem("adminToken", res.token);
      setLocation("/admin/dashboard");
    } catch {
      toast({ title: "Access denied", description: "Invalid admin credentials.", variant: "destructive" });
    }
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
          data-testid="button-theme-toggle"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src={logoPath} alt="DOT" className="w-12 h-12 object-contain dark:brightness-100 brightness-50 mb-4" />
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-black">Admin Access</h1>
          <p className="text-muted-foreground text-sm mt-1">DOT Affiliates Control Panel</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6" data-testid="admin-login-card">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="admin-username">Username</Label>
              <Input
                id="admin-username"
                autoComplete="off"
                placeholder="Admin username"
                {...form.register("username")}
                className="mt-1"
                data-testid="input-admin-username"
              />
              {form.formState.errors.username && (
                <p className="text-destructive text-xs mt-1">{form.formState.errors.username.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                {...form.register("password")}
                className="mt-1"
                data-testid="input-admin-password"
              />
              {form.formState.errors.password && (
                <p className="text-destructive text-xs mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full font-bold bg-primary text-primary-foreground"
              disabled={mutation.isPending}
              data-testid="button-admin-login"
            >
              {mutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Authenticating...</>
              ) : (
                "Enter Admin Panel"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Restricted access. Unauthorized entry is prohibited.
        </p>
      </div>
    </div>
  );
}
