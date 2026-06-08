import DashboardLayout from "@/components/layout/dashboard-layout";
import { useUser } from "@/context/user-context";
import { useListSessions, getListSessionsQueryKey } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Hash, Activity, Clock, Zap } from "lucide-react";
import { format } from "date-fns";

export default function Info() {
  const { user } = useUser();
  const { data: sessions = [], isLoading } = useListSessions({
    query: { queryKey: getListSessionsQueryKey() }
  });

  const totalMessages = sessions.reduce((acc, curr) => acc + curr.messagesSent, 0);
  const activeCount = sessions.filter(s => s.status === 'running').length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-gothic tracking-widest text-white animate-static-glow">Identity & Stats</h1>
          <p className="text-muted-foreground uppercase tracking-widest text-sm mt-1">Profile Information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <Card className="bg-card lightning-border border-white/10 md:col-span-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <User className="w-32 h-32" />
            </div>
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-white flex items-center gap-2 uppercase tracking-wider text-sm">
                <Shield className="w-4 h-4 text-white/50" />
                Discord Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  {user?.avatar ? (
                    <img 
                      src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`} 
                      alt="Avatar" 
                      className="w-24 h-24 rounded-lg border-2 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-white/5 border-2 border-white/20 flex items-center justify-center">
                      <User className="w-10 h-10 text-white/50" />
                    </div>
                  )}
                  {user?.isAdmin && (
                    <Badge className="absolute -top-3 -right-3 bg-red-500 text-white border-none shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                      ADMIN
                    </Badge>
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Username</p>
                    <p className="text-2xl font-bold text-white tracking-wide">{user?.username}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Hash className="w-3 h-3" /> Discord ID
                    </p>
                    <p className="font-mono text-sm text-white/70 bg-white/5 px-2 py-1 rounded inline-block">
                      {user?.id}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="bg-card border-white/10">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-white flex items-center gap-2 uppercase tracking-wider text-sm">
                <Activity className="w-4 h-4 text-white/50" />
                Global Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Total Configurations</p>
                <p className="text-3xl font-gothic text-white">{sessions.length}</p>
              </div>
              <Separator className="bg-white/5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Active Now</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-gothic text-white">{activeCount}</p>
                  {activeCount > 0 && <span className="flex w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />}
                </div>
              </div>
              <Separator className="bg-white/5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-500" /> Messages Fired
                </p>
                <p className="text-2xl font-bold text-white font-mono">{totalMessages.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History / Sessions Summary */}
        <Card className="bg-card border-white/10">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-white flex items-center gap-2 uppercase tracking-wider text-sm">
              <Clock className="w-4 h-4 text-white/50" />
              Configuration Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground animate-pulse">Loading timeline...</div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No history available.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {sessions.map(session => (
                  <div key={session.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${
                        session.status === 'running' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 
                        session.status === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 
                        'bg-white/30'
                      }`} />
                      <div>
                        <p className="font-mono text-sm text-white/90">CH: {session.channelId}</p>
                        <p className="text-xs text-muted-foreground mt-1">Created: {format(new Date(session.createdAt), "MMM d, yyyy HH:mm")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{session.messagesSent} <span className="text-muted-foreground font-normal text-xs uppercase tracking-widest">Sent</span></p>
                      {session.lastSentAt && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono">Last: {format(new Date(session.lastSentAt), "HH:mm:ss")}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
