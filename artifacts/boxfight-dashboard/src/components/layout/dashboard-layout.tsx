import { Link, useLocation } from "wouter";
import { useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/context/user-context";
import { 
  LayoutDashboard, 
  ListTree, 
  Info, 
  ShieldAlert, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user } = useUser();
  const logout = useLogout();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout.mutate({}, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/login");
      }
    });
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/sessions", label: "Sessions", icon: ListTree },
    { href: "/info", label: "Info", icon: Info },
  ];

  if (user?.isAdmin) {
    navItems.push({ href: "/admin", label: "Admin", icon: ShieldAlert });
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-sidebar hidden md:flex flex-col relative z-10">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <img src="/ChatGPT_Image_Jun_7,_2026,_07_35_03_PM_1780946581008.png" alt="Logo" className="w-10 h-10 rounded-full lightning-border" />
          <h2 className="font-gothic text-2xl tracking-wider text-white">! boxfight</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} data-testid={`nav-${item.label.toLowerCase()}`}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all cursor-pointer ${
                  isActive 
                    ? "bg-accent text-white lightning-border shadow-[0_0_10px_rgba(255,255,255,0.1)]" 
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}>
                  <item.icon size={20} className={isActive ? "animate-pulse" : ""} />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-md bg-white/5 border border-white/10">
            {user?.avatar ? (
              <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} alt="Avatar" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <span className="text-xs">{user?.username.substring(0, 2).toUpperCase()}</span>
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-white truncate">{user?.username}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.id}</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-muted-foreground hover:text-white border-white/10 hover:border-white/30 hover:bg-white/5"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-auto relative">
        {/* Background glow effects */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white/5 to-transparent pointer-events-none -z-10" />
        
        <div className="flex-1 p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
