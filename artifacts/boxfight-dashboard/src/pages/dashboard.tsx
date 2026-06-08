import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useUser } from "@/context/user-context";
import { useValidateDiscordToken, useListSessions, getListSessionsQueryKey, useStartSession, useStopSession, useDeleteSession } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ShieldCheck, Zap, AlertTriangle, Play, Square, Trash2, Plus, MessageSquare, Clock, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [validatedUser, setValidatedUser] = useState<string | null>(null);

  const validateMutation = useValidateDiscordToken();
  const startMutation = useStartSession();
  const stopMutation = useStopSession();
  const deleteMutation = useDeleteSession();

  const { data: sessions = [], isLoading } = useListSessions({ query: { queryKey: getListSessionsQueryKey() } });
  const activeSessions = sessions.filter(s => s.status === 'running');
  const totalMessages = sessions.reduce((a, s) => a + s.messagesSent, 0);

  const handleValidate = () => {
    if (!token) return;
    validateMutation.mutate({ data: { token } }, {
      onSuccess: res => {
        if (res.valid) { setIsValidated(true); setValidatedUser(res.username || null); toast({ title: "Token Valid", description: `Authenticated as ${res.username}` }); }
        else { setIsValidated(false); setValidatedUser(null); toast({ variant: "destructive", title: "Invalid Token", description: res.error || "Token rejected" }); }
      },
      onError: () => { setIsValidated(false); toast({ variant: "destructive", title: "Validation Failed" }); }
    });
  };

  const handleStart = (id: number) => startMutation.mutate({ id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() }); toast({ title: "Started" }); } });
  const handleStop  = (id: number) => stopMutation.mutate( { id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() }); toast({ title: "Stopped" }); } });
  const handleDelete= (id: number) => deleteMutation.mutate({ id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() }); toast({ title: "Deleted" }); } });

  return (
    <DashboardLayout>
      <div className="page-enter max-w-5xl mx-auto space-y-7">

        {/* ── Header ── */}
        <div className="flex items-end justify-between">
          <div>
            <p className="label mb-1">Overview</p>
            <h1 className="font-gothic text-[42px] leading-none text-white tracking-widest animate-textglow">Dashboard</h1>
          </div>
          <p className="text-white/30 text-sm pb-1">
            Welcome back, <span className="text-white/70 font-semibold">{user?.username}</span>
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Sessions",      val: sessions.length,              icon: Zap,           glow: 'glow-cyan'   },
            { label: "Active Now",    val: activeSessions.length,        icon: Play,          glow: 'glow-green', pulse: activeSessions.length > 0 },
            { label: "Messages Sent", val: totalMessages.toLocaleString(), icon: MessageSquare, glow: 'glow-purple' },
          ].map(({ label, val, icon: Icon, glow, pulse }) => (
            <div key={label} className="stat-card rounded-2xl p-5 group">
              <div className="flex items-start justify-between mb-3">
                <p className="label">{label}</p>
                <Icon size={14} className="text-white/10 group-hover:text-white/20 transition-colors" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-gothic ${glow}`}>{val}</span>
                {pulse && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulsedot" style={{ boxShadow: '0 0 8px rgba(52,211,153,0.9)' }} />}
              </div>
            </div>
          ))}
        </div>

        {/* ── Token validator ── */}
        <div className="panel rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,220,255,0.1)', border: '1px solid rgba(0,220,255,0.2)' }}>
              <Key size={15} style={{ color: '#00dcff' }} />
            </div>
            <div>
              <p className="text-white/85 text-sm font-semibold">Token Validator</p>
              <p className="text-white/35 text-xs">Verify a Discord user token before creating a session</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-amber-400/50">
              <AlertTriangle size={12} />
              <span className="font-mono text-[10px] tracking-widest uppercase">Never Share</span>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type={showToken ? "text" : "password"}
                placeholder="MTE... (paste Discord token)"
                value={token}
                onChange={e => { setToken(e.target.value); setIsValidated(false); }}
                className="field pr-10"
                data-testid="input-discord-token"
              />
              <button type="button" onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button
              onClick={handleValidate}
              disabled={!token || validateMutation.isPending}
              className="btn-cyan disabled:opacity-40 disabled:cursor-not-allowed"
              data-testid="button-validate-token"
            >
              {validateMutation.isPending ? "Checking..." : "Validate"}
            </button>
          </div>

          {isValidated && validatedUser && (
            <div className="mt-3 flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck size={15} style={{ filter: 'drop-shadow(0 0 5px rgba(52,211,153,0.7))' }} />
                <span className="text-sm">Valid · <span className="text-white font-bold">{validatedUser}</span></span>
              </div>
              <Link href="/sessions">
                <button className="btn-cyan" style={{ height: '30px', fontSize: '10px' }}>
                  <Plus size={12} className="inline mr-1" />New Session
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* ── Sessions ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/70 text-sm font-semibold flex items-center gap-2">
              <Zap size={14} className="text-cyan-400/60" />
              Recent Sessions
            </p>
            <Link href="/sessions">
              <button className="btn-ghost">View All →</button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1,2].map(i => <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />)}
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)' }}>
              <Zap size={24} className="mx-auto mb-3 text-white/10" />
              <p className="text-white/25 text-sm mb-4">No sessions configured yet</p>
              {isValidated && (
                <Link href="/sessions">
                  <button className="btn-cyan">Create Your First Session</button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sessions.slice(0, 4).map(session => {
                const running = session.status === 'running';
                const errored = session.status === 'error';
                const dotC = running ? '#4ade80' : errored ? '#f87171' : 'rgba(255,255,255,0.2)';
                return (
                  <div key={session.id} className="panel rounded-2xl p-4 group relative overflow-hidden shimmer-hover"
                    style={running ? { borderColor: 'rgba(74,222,128,0.18)', boxShadow: '0 0 24px rgba(74,222,128,0.05)' } : {}}>
                    {running && <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(74,222,128,0.5), transparent)' }} />}

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotC, boxShadow: `0 0 6px ${dotC}` }} />
                        <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: dotC }}>{session.status}</span>
                      </div>
                      <span className="font-mono text-[10px] text-white/20">#{session.id}</span>
                    </div>

                    <p className="font-mono text-xs text-white/40 mb-1 truncate">CH: {session.channelId}</p>
                    <p className="text-sm text-white/65 italic truncate mb-3">"{session.message}"</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[11px] text-white/30 font-mono">
                        <span className="flex items-center gap-1"><Clock size={10} />{session.interval}ms</span>
                        <span className="flex items-center gap-1"><MessageSquare size={10} />{session.messagesSent}</span>
                      </div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!running
                          ? <button onClick={() => handleStart(session.id)} disabled={startMutation.isPending} className="icon-btn icon-btn-green"><Play size={12} /></button>
                          : <button onClick={() => handleStop(session.id)}  disabled={stopMutation.isPending}  className="icon-btn icon-btn-amber"><Square size={12} /></button>}
                        <button onClick={() => handleDelete(session.id)} disabled={deleteMutation.isPending} className="icon-btn icon-btn-red"><Trash2 size={12} /></button>
                      </div>
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
