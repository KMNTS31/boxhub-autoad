import { Button } from "@/components/ui/button";
import { ShieldAlert, LogOut } from "lucide-react";
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.15)_0%,transparent_70%)]" />
      
      <div className="relative z-10 bg-card p-10 rounded-lg lightning-border border-destructive/50 max-w-lg w-full text-center shadow-[0_0_30px_rgba(220,38,38,0.15)]">
        <div className="w-24 h-24 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-6 animate-pulse">
          <ShieldAlert className="w-12 h-12 text-destructive" />
        </div>
        
        <h1 className="font-gothic text-5xl text-white mb-4 tracking-wider text-destructive">
          Access Denied
        </h1>
        
        <div className="space-y-4 mb-8">
          <p className="text-xl text-white font-medium uppercase tracking-widest">
            You do not have access to this dashboard
          </p>
          <p className="text-muted-foreground">
            Your Discord account is not authorized to use the auto-ad tool. 
            Contact an administrator to be authorized.
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="lg" 
          className="w-full h-12 border-white/20 text-white hover:bg-white hover:text-black font-bold uppercase tracking-wider transition-all duration-300"
          onClick={handleLogout}
          data-testid="button-back-to-login"
        >
          <LogOut className="mr-2 w-5 h-5" />
          Back to Login
        </Button>
      </div>
    </div>
  );
}
