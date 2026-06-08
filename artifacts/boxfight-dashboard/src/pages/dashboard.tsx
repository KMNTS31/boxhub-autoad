import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useUser } from "@/context/user-context";
import { useValidateDiscordToken, useListSessions, getListSessionsQueryKey, useStartSession, useStopSession, useDeleteSession } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Key, ShieldCheck, Zap, AlertTriangle, Play, Square, Trash2, Plus, MessageSquare, Clock } from "lucide-react";
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

  const { data: sessions = [], isLoading: isLoadingSessions } = useListSessions({
    query: { queryKey: getListSessionsQueryKey() }
  });

  const activeSessions = sessions.filter(s => s.status === 'running');
  const totalMessages = sessions.reduce((acc, s) => acc + s.messagesSent, 0);

  const handleValidate = () => {
    if (!token) return;
    validateMutation.mutate({ data: { token } }, {
      onSuccess: (res) => {
        if (res.valid) {
          setIsValidated(true);
          setValidatedUser(res.username || null);
          toast({ title: "Token Valid", description: `Authenticated as ${res.username}` });
        } else {
          setIsValidated(false);
          setValidatedUser(null);
          toast({ variant: "destructive", title: "Invalid Token", description: res.error || "Token rejected" });
        }
      },
      onError: () => {
        setIsValidated(false);
        toast({ variant: "destructive", title: "Validation Failed", description: "Network error" });
      }
    });
  };

  const handleStart = (id: number) => {
    startMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
        toast({ title: "Session Started" });
      }
    });
  };

  const handleStop = (id: number) => {
    stopMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
        toast({ title: "Session Stopped" });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
        toast({ title: "Session Deleted" });
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* Page header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/25 font-mono text-[10px] tracking-[0.3em] uppercase mb-1">Overview</p>
            <h1 className="font-gothic text-4xl text-white tracking-widest" style={{textShadow:'0 0 30px rgba(0,212,255,0.2)'}}>
              Dashboard
            </h1>
          </div>
          <p className="text-white/30 text-sm">
            Welcome, <span className="text-white/60 font-medium">{user?.username}</span>
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Sessions", value: sessions.length, icon: Zap, color: 'rgba(0,212,255,0.6)' },
            { label: "Active Now", value: activeSessions.length, icon: Play, color: 'rgba(74,222,128,0.6)', pulse: activeSessions.length > 0 },
            { label: "Messages Fired", value: totalMessages.toLocaleString(), icon: MessageSquare, color: 'rgba(168,85,247,0.6)' },
          ].map(({ label, value, icon: Icon, color, pulse }) => (
            <div key={label} className="stat-card rounded-xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity">
                <Icon className="w-20 h-20" />
              </div>
              <p className="text-white/35 text-[10px] font-mono tracking-[0.25em] uppercase mb-2">{label}</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-gothic" style={{ color, textShadow: `0 0 20px ${color}` }}>
                  {value}
                </p>
                {pulse && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{boxShadow:'0 0 8px rgba(74,222,128,0.8)'}} />}
              </div>
            </div>
          ))}
        </div>

        {/* Token Validator */}
        <div className="rounded-xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(145deg, rgba(12,14,24,0.8) 0%, rgba(8,10,18,0.9) 100%)',
            border: '1px solid rgba(0,212,255,0.1)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)'
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
          <div className="p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{background:'rgba(0,212,255,0.08)',border:'1px solid rgba(0,212,255,0.15)'}}>
                <Key className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-white/90 text-sm font-semibold">Discord Token Validator</h3>
                <p className="text-white/30 text-xs">Verify a user token before creating sessions</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-yellow-500/50 text-xs">
                <AlertTriangle className="w-3 h-3" />
                <span className="font-mono text-[10px] tracking-widest uppercase">Never Share</span>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  type={showToken ? "text" : "password"}
                  placeholder="MTE... (paste Discord token)"
                  value={token}
                  onChange={(e) => { setToken(e.target.value); setIsValidated(false); }}
                  className="bg-white/[0.03] border-white/10 text-white pr-10 font-mono text-sm focus-visible:ring-0 focus-visible:border-cyan-400/40 h-10 input-glow"
                  data-testid="input-discord-token"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button
                onClick={handleValidate}
                disabled={!token || validateMutation.isPending}
                className="h-10 px-5 font-bold text-xs uppercase tracking-widest transition-all"
                style={{
                  background: token ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${token ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  color: token ? '#00d4ff' : 'rgba(255,255,255,0.3)',
                }}
                data-testid="button-validate-token"
              >
                {validateMutation.isPending ? "Checking..." : "Validate"}
              </Button>
            </div>

            {isValidated && validatedUser && (
              <div className="flex items-center justify-between mt-3 p-3 rounded-lg"
                style={{background:'rgba(74,222,128,0.05)',border:'1px solid rgba(74,222,128,0.15)'}}>
                <div className="flex items-center gap-2 text-green-400">
                  <ShieldCheck className="w-4 h-4" style={{filter:'drop-shadow(0 0 6px rgba(74,222,128,0.6))'}} />
                  <span className="text-sm">Valid token for <span className="text-white font-bold">{validatedUser}</span></span>
                </div>
                <Link href="/sessions">
                  <Button size="sm" className="h-7 px-3 text-xs font-bold uppercase tracking-wider"
                    style={{background:'rgba(74,222,128,0.1)',border:'1px solid rgba(74,222,128,0.25)',color:'#4ade80'}}>
                    <Plus className="w-3 h-3 mr-1" /> New Session
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sessions list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400/60" />
              <h2 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Recent Sessions</h2>
            </div>
            <Link href="/sessions">
              <Button size="sm" className="h-7 px-3 text-[10px] font-mono uppercase tracking-wider"
                style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.4)'}}>
                View All →
              </Button>
            </Link>
          </div>

          {isLoadingSessions ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1,2].map(i => (
                <div key={i} className="rounded-xl h-36 animate-pulse"
                  style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.04)'}} />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-xl p-10 text-center"
              style={{background:'rgba(255,255,255,0.01)',border:'1px dashed rgba(255,255,255,0.06)'}}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{background:'rgba(0,212,255,0.06)',border:'1px solid rgba(0,212,255,0.1)'}}>
                <Zap className="w-5 h-5 text-cyan-400/40" />
              </div>
              <p className="text-white/25 text-sm mb-4">No sessions configured yet</p>
              {isValidated && (
                <Link href="/sessions">
                  <Button size="sm" className="font-bold uppercase tracking-wider text-xs"
                    style={{background:'rgba(0,212,255,0.1)',border:'1px solid rgba(0,212,255,0.25)',color:'#00d4ff'}}>
                    Create Your First Session
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sessions.slice(0, 4).map(session => {
                const isRunning = session.status === 'running';
                const statusColor = isRunning ? '#4ade80' : session.status === 'error' ? '#ef4444' : 'rgba(255,255,255,0.3)';
                return (
                  <div key={session.id}
                    className="rounded-xl p-4 group transition-all duration-200 relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(145deg, rgba(12,14,24,0.8) 0%, rgba(8,10,18,0.9) 100%)',
                      border: `1px solid ${isRunning ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)'}`,
                    }}
                  >
                    {isRunning && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/40 to-transparent" />}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{background:statusColor,boxShadow:`0 0 6px ${statusColor}`}} />
                        <span className="text-[10px] font-mono uppercase tracking-widest" style={{color:statusColor}}>
                          {session.status}
                        </span>
                      </div>
                      <span className="text-white/20 font-mono text-[10px]">#{session.id}</span>
                    </div>

                    <p className="font-mono text-xs text-white/40 mb-1">CH: {session.channelId}</p>
                    <p className="text-white/70 text-sm truncate italic mb-3">"{session.message}"</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[11px] text-white/30">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{session.interval}ms</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{session.messagesSent} sent</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isRunning ? (
                          <button onClick={() => handleStart(session.id)} disabled={startMutation.isPending}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            style={{background:'rgba(74,222,128,0.08)',border:'1px solid rgba(74,222,128,0.2)',color:'#4ade80'}}>
                            <Play className="w-3 h-3" />
                          </button>
                        ) : (
                          <button onClick={() => handleStop(session.id)} disabled={stopMutation.isPending}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            style={{background:'rgba(251,191,36,0.08)',border:'1px solid rgba(251,191,36,0.2)',color:'#fbbf24'}}>
                            <Square className="w-3 h-3" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(session.id)} disabled={deleteMutation.isPending}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.15)',color:'rgba(239,68,68,0.7)'}}>
                          <Trash2 className="w-3 h-3" />
                        </button>
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
