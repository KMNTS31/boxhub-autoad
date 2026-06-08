import { Link, useLocation } from "wouter";
import { useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/context/user-context";
import {
  LayoutDashboard,
  ListTree,
  Info,
  ShieldAlert,
  LogOut,
  User
} from "lucide-react";

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
      <aside
        className="w-60 flex-shrink-0 hidden md:flex flex-col relative z-10"
        style={{
          background: 'linear-gradient(180deg, hsl(220 16% 5%) 0%, hsl(220 15% 4%) 100%)',
          borderRight: '1px solid rgba(0,212,255,0.08)',
          boxShadow: '2px 0 20px rgba(0,0,0,0.3)'
        }}
      >
        {/* Logo area */}
        <div className="p-5 flex items-center gap-3 relative"
          style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
          <div className="relative shrink-0">
            <img
              src="/ChatGPT_Image_Jun_7,_2026,_07_35_03_PM_1780946581008.png"
              alt="Logo"
              className="w-9 h-9 rounded-full"
              style={{
                border:'1px solid rgba(0,212,255,0.25)',
                boxShadow:'0 0 12px rgba(0,212,255,0.2)'
              }}
            />
          </div>
          <div>
            <h2 className="font-gothic text-xl tracking-wider text-white leading-none">! boxfight</h2>
            <p className="text-white/25 text-[10px] font-mono tracking-[0.2em] uppercase mt-0.5">Auto Ad v2</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <p className="text-white/20 text-[9px] font-mono tracking-[0.3em] uppercase px-3 py-2.5">Navigation</p>
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} data-testid={`nav-${item.label.toLowerCase()}`}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${
                    isActive ? 'nav-active' : 'text-white/35 hover:text-white/80 hover:bg-white/[0.03]'
                  }`}
                >
                  <item.icon
                    size={16}
                    className={isActive ? 'text-cyan-400' : 'group-hover:text-white/60 transition-colors'}
                    style={isActive ? {filter:'drop-shadow(0 0 6px rgba(0,212,255,0.6))'} : {}}
                  />
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1 h-1 rounded-full bg-cyan-400"
                      style={{boxShadow:'0 0 6px rgba(0,212,255,1)'}} />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User area */}
        <div className="p-3" style={{borderTop:'1px solid rgba(255,255,255,0.04)'}}>
          {/* User row */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-1"
            style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)'}}>
            {user?.avatar ? (
              <img
                src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                alt="Avatar"
                className="w-7 h-7 rounded-full shrink-0"
                style={{border:'1px solid rgba(0,212,255,0.2)'}}
              />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{background:'rgba(0,212,255,0.1)',border:'1px solid rgba(0,212,255,0.2)'}}>
                <User size={13} className="text-cyan-400" />
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="text-white/80 text-xs font-semibold truncate">{user?.username}</p>
              {user?.isAdmin && (
                <p className="text-[10px] font-mono text-cyan-400/70 tracking-widest">ADMIN</p>
              )}
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            data-testid="button-logout"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/25 hover:text-red-400/70 hover:bg-red-500/5 transition-all text-xs font-medium cursor-pointer"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-auto relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-64 bg-[radial-gradient(ellipse_70%_30%_at_50%_0%,rgba(0,212,255,0.03)_0%,transparent_100%)] pointer-events-none" />
        <div className="flex-1 p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
