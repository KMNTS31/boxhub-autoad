import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useUser } from "@/context/user-context";
import { useValidateDiscordToken, useListSessions, getListSessionsQueryKey, useStartSession, useStopSession, useDeleteSession } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Key, ShieldCheck, Zap, AlertTriangle, Play, Square, Trash2, Plus, ListTree } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

  const handleValidate = () => {
    if (!token) return;
    validateMutation.mutate({ data: { token } }, {
      onSuccess: (res) => {
        if (res.valid) {
          setIsValidated(true);
          setValidatedUser(res.username || null);
          toast({
            title: "Token Validated",
            description: `Successfully authenticated as ${res.username}`,
          });
        } else {
          setIsValidated(false);
          setValidatedUser(null);
          toast({
            variant: "destructive",
            title: "Invalid Token",
            description: res.error || "The provided token is invalid",
          });
        }
      },
      onError: () => {
        setIsValidated(false);
        setValidatedUser(null);
        toast({
          variant: "destructive",
          title: "Validation Failed",
          description: "An error occurred while validating the token",
        });
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
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-gothic tracking-widest text-white animate-static-glow">Dashboard</h1>
            <p className="text-muted-foreground uppercase tracking-widest text-sm mt-1">Welcome back, {user?.username}</p>
          </div>
        </div>

        {/* Token Validation Card */}
        <Card className="bg-card lightning-border border-white/10 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50" />
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-white/70" />
              Discord User Token
            </CardTitle>
            <CardDescription className="text-muted-foreground flex items-center gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Never share your token with anyone. This is stored securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  type={showToken ? "text" : "password"}
                  placeholder="Enter Discord Token (e.g. MTE...)"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    setIsValidated(false);
                  }}
                  className="bg-input border-white/10 text-white pr-10 font-mono focus-visible:ring-white/30"
                  data-testid="input-discord-token"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button 
                onClick={handleValidate} 
                disabled={!token || validateMutation.isPending}
                className="bg-white text-black hover:bg-white/90 font-bold px-6"
                data-testid="button-validate-token"
              >
                {validateMutation.isPending ? "Validating..." : "Validate Token"}
              </Button>
            </div>

            {isValidated && validatedUser && (
              <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-md">
                <div className="flex items-center gap-3 text-green-400">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-medium">Validated as <span className="text-white font-bold">{validatedUser}</span></span>
                </div>
                <Link href="/sessions">
                  <Button variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/20 hover:text-green-300">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Session
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Active Sessions
            </h2>
            <Badge variant="outline" className="border-white/20 bg-white/5 text-white">
              {sessions.length} Total
            </Badge>
          </div>

          {isLoadingSessions ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <Card key={i} className="bg-card border-white/5 h-40 animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <Card className="bg-card border-white/5 p-8 text-center border-dashed">
              <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <ListTree className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">No active sessions found.</p>
              {isValidated && (
                <Link href="/sessions">
                  <Button className="bg-white text-black hover:bg-white/90">
                    Create Your First Session
                  </Button>
                </Link>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map(session => (
                <Card key={session.id} className="bg-card lightning-border border-white/10 flex flex-col group relative overflow-hidden">
                  <div className="p-5 flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground">ID: {session.id}</span>
                      <Badge className={
                        session.status === 'running' ? 'bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]' :
                        session.status === 'stopped' ? 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                        session.status === 'error' ? 'bg-destructive/20 text-destructive border-destructive/30 shadow-[0_0_10px_rgba(220,38,38,0.4)]' :
                        'bg-white/10 text-white/70 border-white/20'
                      }>
                        {session.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Channel ID</p>
                      <p className="font-mono text-white bg-white/5 p-2 rounded border border-white/10 text-sm">
                        {session.channelId}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Message Preview</p>
                      <p className="text-sm text-white/80 line-clamp-2 italic border-l-2 border-white/20 pl-2">
                        "{session.message}"
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-muted-foreground block mb-1">Delay</span>
                        <span className="text-white font-mono">{session.delay}ms</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-muted-foreground block mb-1">Interval</span>
                        <span className="text-white font-mono">{session.interval}ms</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10 p-3 bg-black/40 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-0 w-full translate-y-full group-hover:translate-y-0">
                    <div className="flex gap-2">
                      {session.status !== 'running' ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-green-500/30 text-green-400 hover:bg-green-500/20 hover:text-green-300"
                          onClick={() => handleStart(session.id)}
                          disabled={startMutation.isPending}
                        >
                          <Play className="w-4 h-4 mr-1" /> Start
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
                          onClick={() => handleStop(session.id)}
                          disabled={stopMutation.isPending}
                        >
                          <Square className="w-4 h-4 mr-1" /> Stop
                        </Button>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/20 hover:text-destructive"
                      onClick={() => handleDelete(session.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
