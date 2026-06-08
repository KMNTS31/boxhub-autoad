import { Link, useLocation } from "wouter";
import { useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/context/user-context";
import { LayoutDashboard, ListTree, Info, ShieldAlert, LogOut, User, Zap } from "lucide-react";

interface DashboardLayoutProps { children: React.ReactNode; }

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
    { href: "/sessions",  label: "Sessions",  icon: ListTree },
    { href: "/info",      label: "Identity",  icon: Info },
  ];
  if (user?.isAdmin) navItems.push({ href: "/admin", label: "Admin", icon: ShieldAlert });

  return (
    <div className="flex min-h-screen w-full" style={{ background: 'hsl(225 20% 5%)' }}>

      {/* ── Sidebar ── */}
      <aside
        className="w-[220px] flex-shrink-0 hidden md:flex flex-col relative z-20"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 100%)',
          backdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div className="px-4 pt-5 pb-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="relative shrink-0">
            <img
              src="/ChatGPT_Image_Jun_7,_2026,_07_35_03_PM_1780946581008.png"
              alt="Logo"
              className="w-9 h-9 rounded-full"
              style={{ border: '1px solid rgba(0,220,255,0.3)', boxShadow: '0 0 14px rgba(0,220,255,0.25), 0 0 32px rgba(0,220,255,0.08)' }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
          </div>
          <div className="min-w-0">
            <p className="font-gothic text-xl text-white leading-none tracking-wider" style={{ textShadow: '0 0 20px rgba(0,220,255,0.3)' }}>! boxfight</p>
            <p className="label mt-0.5" style={{ fontSize: '9px' }}>AUTO AD v2</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 pt-4">
          <p className="label px-3 pb-2" style={{ fontSize: '9px' }}>Navigation</p>
          {navItems.map(item => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} data-testid={`nav-${item.label.toLowerCase()}`}>
                <div className={`nav-item ${isActive ? 'active' : ''}`}>
                  <item.icon size={15} style={isActive ? { color: '#00dcff', filter: 'drop-shadow(0 0 5px rgba(0,220,255,0.7))' } : {}} />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulsedot" style={{ boxShadow: '0 0 6px #00dcff' }} />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div
            className="flex items-center gap-2.5 p-3 rounded-xl mb-2 shimmer-hover"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {user?.avatar ? (
              <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} alt="Avatar"
                className="w-8 h-8 rounded-full shrink-0"
                style={{ border: '1px solid rgba(0,220,255,0.25)' }} />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(0,220,255,0.1)', border: '1px solid rgba(0,220,255,0.2)' }}>
                <User size={14} className="text-cyan" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-white/80 text-xs font-semibold truncate leading-none">{user?.username}</p>
              {user?.isAdmin ? (
                <p className="font-mono text-[9px] tracking-widest text-red-400 mt-0.5 leading-none">ADMIN</p>
              ) : (
                <p className="font-mono text-[9px] tracking-widest text-emerald-400/70 mt-0.5 leading-none">AUTHORIZED</p>
              )}
            </div>
            {user?.isAdmin && (
              <Zap size={12} style={{ color: '#f87171', filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.7))', flexShrink: 0 }} />
            )}
          </div>

          <button onClick={handleLogout} data-testid="button-logout"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/25 hover:text-red-400/60 hover:bg-red-500/5 transition-all text-xs cursor-pointer"
          >
            <LogOut size={12} />
            <span className="font-mono tracking-wider text-[10px] uppercase">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 overflow-auto relative">
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-100 pointer-events-none" />
        {/* Top glow bar */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,220,255,0.15), transparent)' }} />
        <div className="relative z-10 p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
