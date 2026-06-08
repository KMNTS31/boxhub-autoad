import { Button } from "@/components/ui/button";
import { ShieldX, LogOut } from "lucide-react";
import { useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function Unauthorized() {
  const logout = useLogout();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout.mutate({}, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/login");
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(220,38,38,0.08)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.02)_2px,rgba(0,0,0,0.02)_4px)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl p-10 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(12,8,8,0.97) 0%, rgba(8,5,5,0.99) 100%)',
            border: '1px solid rgba(220,38,38,0.2)',
            boxShadow: '0 0 60px rgba(220,38,38,0.08), 0 20px 60px rgba(0,0,0,0.6)'
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

          <div className="relative mb-6 inline-block">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
              style={{
                background: 'rgba(220,38,38,0.08)',
                border: '1px solid rgba(220,38,38,0.2)',
                boxShadow: '0 0 30px rgba(220,38,38,0.15)'
              }}
            >
              <ShieldX className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <h1 className="font-gothic text-5xl text-red-400 mb-2 tracking-wider"
            style={{textShadow:'0 0 20px rgba(220,38,38,0.5)'}}>
            Access Denied
          </h1>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent mx-auto mb-6" />

          <p className="text-white/60 text-sm leading-relaxed mb-8">
            Your Discord account is not authorized to access this dashboard.
            Contact an administrator to request access.
          </p>

          <Button
            size="lg"
            className="w-full h-11 font-bold uppercase tracking-[0.15em] text-sm transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)'
            }}
            onClick={handleLogout}
            data-testid="button-back-to-login"
          >
            <LogOut className="mr-2 w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
