import DashboardLayout from "@/components/layout/dashboard-layout";
import { useUser } from "@/context/user-context";
import { useListSessions, getListSessionsQueryKey } from "@workspace/api-client-react";
import { User, Shield, Hash, Activity, Clock, Zap, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export default function Info() {
  const { user } = useUser();
  const { data: sessions = [], isLoading } = useListSessions({
    query: { queryKey: getListSessionsQueryKey() }
  });

  const totalMessages = sessions.reduce((acc, curr) => acc + curr.messagesSent, 0);
  const activeCount = sessions.filter(s => s.status === 'running').length;

  const panelStyle = {
    background: 'linear-gradient(145deg, rgba(10,12,22,0.8) 0%, rgba(6,8,16,0.9) 100%)',
    border: '1px solid rgba(0,212,255,0.08)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">

        {/* Header */}
        <div>
          <p className="text-white/25 font-mono text-[10px] tracking-[0.3em] uppercase mb-1">Account</p>
          <h1 className="font-gothic text-4xl text-white tracking-widest" style={{textShadow:'0 0 30px rgba(0,212,255,0.2)'}}>
            Identity
          </h1>
        </div>

        {/* Profile + stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Profile card */}
          <div className="md:col-span-2 rounded-xl p-6 relative overflow-hidden" style={panelStyle}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
              <User className="w-32 h-32" />
            </div>

            <div className="flex items-start gap-5 relative z-10">
              {/* Avatar */}
              <div className="relative shrink-0">
                {user?.avatar ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`}
                    alt="Avatar"
                    className="w-20 h-20 rounded-xl"
                    style={{border:'1px solid rgba(0,212,255,0.2)',boxShadow:'0 0 20px rgba(0,212,255,0.1)'}}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl flex items-center justify-center"
                    style={{background:'rgba(0,212,255,0.06)',border:'1px solid rgba(0,212,255,0.15)'}}>
                    <User className="w-8 h-8 text-cyan-400/40" />
                  </div>
                )}
                {user?.isAdmin && (
                  <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest uppercase"
                    style={{background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',boxShadow:'0 0 10px rgba(239,68,68,0.2)'}}>
                    ADMIN
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-white/25 text-[10px] font-mono tracking-[0.25em] uppercase mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> Username
                  </p>
                  <p className="text-2xl font-bold text-white tracking-wide">{user?.username}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/25 text-[10px] font-mono tracking-[0.2em] uppercase mb-1 flex items-center gap-1">
                      <Hash className="w-3 h-3" /> Discord ID
                    </p>
                    <p className="font-mono text-xs text-white/50 bg-white/[0.03] px-2 py-1.5 rounded-lg border border-white/5">
                      {user?.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/25 text-[10px] font-mono tracking-[0.2em] uppercase mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Access Level
                    </p>
                    <div className="flex items-center gap-2 bg-white/[0.03] px-2 py-1.5 rounded-lg border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: user?.isAdmin ? '#f87171' : '#4ade80',
                          boxShadow: user?.isAdmin ? '0 0 6px rgba(248,113,113,0.8)' : '0 0 6px rgba(74,222,128,0.8)'
                        }} />
                      <span className="text-xs font-mono text-white/50">
                        {user?.isAdmin ? 'Administrator' : 'Authorized'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats panel */}
          <div className="rounded-xl p-5 relative overflow-hidden flex flex-col gap-4" style={panelStyle}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
            <p className="text-white/25 text-[10px] font-mono tracking-[0.25em] uppercase flex items-center gap-1.5">
              <Activity className="w-3 h-3" /> Stats
            </p>

            <div className="space-y-4">
              {[
                { label: 'Total Sessions', value: sessions.length, icon: Zap, color: '#00d4ff' },
                { label: 'Running Now', value: activeCount, icon: Activity, color: '#4ade80', pulse: activeCount > 0 },
                { label: 'Messages Fired', value: totalMessages.toLocaleString(), icon: MessageSquare, color: '#a855f7' },
              ].map(({ label, value, icon: Icon, color, pulse }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b last:border-b-0"
                  style={{borderColor:'rgba(255,255,255,0.04)'}}>
                  <div className="flex items-center gap-2 text-white/35">
                    <Icon className="w-3.5 h-3.5" style={{color}} />
                    <span className="text-xs font-mono">{label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-gothic" style={{color,textShadow:`0 0 15px ${color}60`}}>{value}</span>
                    {pulse && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-xl overflow-hidden" style={panelStyle}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent" />
          <div className="px-5 py-4 border-b flex items-center gap-2"
            style={{borderColor:'rgba(255,255,255,0.05)',background:'rgba(255,255,255,0.01)'}}>
            <Clock className="w-3.5 h-3.5 text-white/25" />
            <span className="text-[10px] font-mono text-white/25 tracking-[0.25em] uppercase">Session Timeline</span>
          </div>

          {isLoading ? (
            <div className="py-10 text-center text-white/25 text-sm font-mono tracking-widest animate-pulse">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="py-10 text-center text-white/20 text-sm font-mono">No session history</div>
          ) : (
            <div className="divide-y" style={{borderColor:'rgba(255,255,255,0.03)'}}>
              {sessions.map(session => {
                const isRunning = session.status === 'running';
                const isError = session.status === 'error';
                const dotColor = isRunning ? '#4ade80' : isError ? '#ef4444' : 'rgba(255,255,255,0.2)';
                return (
                  <div key={session.id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.015] transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="relative shrink-0">
                        <div className="w-2 h-2 rounded-full" style={{background:dotColor,boxShadow:`0 0 6px ${dotColor}`}} />
                        {isRunning && (
                          <div className="absolute inset-0 w-2 h-2 rounded-full animate-ping" style={{background:dotColor,opacity:0.4}} />
                        )}
                      </div>
                      <div>
                        <p className="font-mono text-xs text-white/60">#{session.id} · {session.channelId}</p>
                        <p className="text-white/30 text-[11px] mt-0.5 font-mono">
                          Created {format(new Date(session.createdAt), "MMM d, yyyy · HH:mm")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/70 text-sm font-mono font-bold">{session.messagesSent}
                        <span className="text-white/25 text-[11px] font-normal ml-1">sent</span>
                      </p>
                      {session.lastSentAt && (
                        <p className="text-white/25 text-[11px] font-mono mt-0.5">
                          Last: {format(new Date(session.lastSentAt), "HH:mm:ss")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
