import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useGetAdminStats, getGetAdminStatsQueryKey, useListAuthorizedUsers, getListAuthorizedUsersQueryKey, useAuthorizeUser, useRevokeUser } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Users, Zap, MessageSquare, Search, UserPlus, ShieldOff, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const authorizeSchema = z.object({
  discordId: z.string().min(1, "Discord ID required"),
  username: z.string().min(1, "Username required"),
  notes: z.string().optional(),
});
type AuthorizeFormValues = z.infer<typeof authorizeSchema>;

const inputClass = "bg-white/[0.03] border-white/10 text-white font-mono text-sm focus-visible:ring-0 focus-visible:border-cyan-400/40 h-9";
const labelClass = "text-white/40 text-[10px] font-mono tracking-[0.25em] uppercase";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: stats } = useGetAdminStats({ query: { queryKey: getGetAdminStatsQueryKey() } });
  const { data: users = [], isLoading: isLoadingUsers } = useListAuthorizedUsers({ query: { queryKey: getListAuthorizedUsersQueryKey() } });

  const authorizeMutation = useAuthorizeUser();
  const revokeMutation = useRevokeUser();

  const form = useForm<AuthorizeFormValues>({
    resolver: zodResolver(authorizeSchema),
    defaultValues: { discordId: "", username: "", notes: "" },
  });

  const onSubmit = (data: AuthorizeFormValues) => {
    authorizeMutation.mutate({ discordId: data.discordId, data: { username: data.username, notes: data.notes } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAuthorizedUsersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        setIsDialogOpen(false);
        form.reset();
        toast({ title: "User Authorized" });
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Error", description: err.message });
      }
    });
  };

  const handleRevoke = (discordId: string) => {
    if (confirm("Revoke this user's access? Active sessions will stop.")) {
      revokeMutation.mutate({ discordId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAuthorizedUsersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
          toast({ title: "Access Revoked" });
        }
      });
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.discordId.includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">

        {/* Header */}
        <div>
          <p className="text-white/25 font-mono text-[10px] tracking-[0.3em] uppercase mb-1">Restricted</p>
          <h1 className="font-gothic text-4xl tracking-widest flex items-center gap-3"
            style={{color:'#ef4444',textShadow:'0 0 30px rgba(239,68,68,0.3)'}}>
            <ShieldAlert className="w-8 h-8" style={{filter:'drop-shadow(0 0 8px rgba(239,68,68,0.5))'}} />
            Admin Panel
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Authorized Users", value: stats?.totalAuthorized ?? 0, icon: Users, color: '#00d4ff' },
            { label: "Active Sessions", value: stats?.activeSessionsCount ?? 0, icon: Zap, color: '#4ade80', pulse: (stats?.activeSessionsCount ?? 0) > 0 },
            { label: "Total Messages", value: (stats?.totalMessagesSent ?? 0).toLocaleString(), icon: MessageSquare, color: '#a855f7' },
          ].map(({ label, value, icon: Icon, color, pulse }) => (
            <div key={label} className="stat-card rounded-xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity">
                <Icon className="w-20 h-20" />
              </div>
              <p className="text-white/35 text-[10px] font-mono tracking-[0.25em] uppercase mb-2">{label}</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-gothic" style={{ color, textShadow: `0 0 20px ${color}40` }}>
                  {value}
                </p>
                {pulse && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{boxShadow:'0 0 8px rgba(74,222,128,0.8)'}} />}
              </div>
            </div>
          ))}
        </div>

        {/* User Management */}
        <div className="rounded-xl overflow-hidden"
          style={{
            background:'linear-gradient(145deg, rgba(10,12,22,0.8) 0%, rgba(6,8,16,0.9) 100%)',
            border:'1px solid rgba(239,68,68,0.08)',
            boxShadow:'0 4px 24px rgba(0,0,0,0.4)'
          }}>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b"
            style={{borderColor:'rgba(255,255,255,0.05)',background:'rgba(255,255,255,0.01)'}}>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-8 text-sm bg-white/[0.03] border-white/10 text-white focus-visible:ring-0 focus-visible:border-cyan-400/30"
              />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-8 px-4 font-bold uppercase tracking-wider text-[11px] shrink-0"
                  style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',color:'#f87171',boxShadow:'0 0 12px rgba(239,68,68,0.08)'}}>
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Grant Access
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm"
                style={{
                  background:'linear-gradient(145deg, rgba(10,12,22,0.99) 0%, rgba(6,8,16,1) 100%)',
                  border:'1px solid rgba(0,212,255,0.15)',
                  boxShadow:'0 0 60px rgba(0,0,0,0.8)'
                }}>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
                <DialogHeader>
                  <DialogTitle className="font-gothic text-2xl tracking-wider text-white">Grant Access</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                    <FormField control={form.control} name="discordId" render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>Discord ID</FormLabel>
                        <FormControl><Input {...field} className={inputClass} placeholder="123456789..." /></FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="username" render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>Username</FormLabel>
                        <FormControl><Input {...field} className={inputClass} /></FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>Notes (optional)</FormLabel>
                        <FormControl><Input {...field} className={inputClass} /></FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )} />
                    <Button type="submit" disabled={authorizeMutation.isPending} className="w-full h-9 font-bold uppercase tracking-wider text-xs"
                      style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171'}}>
                      {authorizeMutation.isPending ? "Processing..." : "Authorize User"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b"
            style={{borderColor:'rgba(255,255,255,0.04)',background:'rgba(0,0,0,0.1)'}}>
            {['User', 'Discord ID', 'Sessions', 'Last Seen', ''].map(h => (
              <span key={h} className="text-[10px] font-mono text-white/20 tracking-[0.25em] uppercase">{h}</span>
            ))}
          </div>

          {/* Rows */}
          {isLoadingUsers ? (
            <div className="py-12 text-center text-white/25 text-sm font-mono tracking-widest">Loading...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-white/20 text-sm font-mono">No users found</div>
          ) : (
            <div className="divide-y" style={{borderColor:'rgba(255,255,255,0.03)'}}>
              {filteredUsers.map(u => (
                <div key={u.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center hover:bg-white/[0.015] transition-colors group">

                  {/* User */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center overflow-hidden"
                      style={{border:'1px solid rgba(0,212,255,0.15)',background:'rgba(0,212,255,0.06)'}}>
                      {u.avatar
                        ? <img src={`https://cdn.discordapp.com/avatars/${u.discordId}/${u.avatar}.png`} className="w-full h-full" alt="" />
                        : <User className="w-3.5 h-3.5 text-cyan-400/50" />}
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-semibold leading-none">{u.username}</p>
                      {u.notes && <p className="text-white/30 text-[11px] mt-0.5 truncate max-w-[120px]">{u.notes}</p>}
                    </div>
                  </div>

                  {/* Discord ID */}
                  <span className="font-mono text-xs text-white/35 truncate">{u.discordId}</span>

                  {/* Sessions */}
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-yellow-500/50" />
                    <span className="text-white/60 text-xs">{u.sessionCount}</span>
                  </div>

                  {/* Last seen */}
                  <div className="text-xs text-white/30 font-mono flex items-center gap-1">
                    {u.lastSeen ? (
                      <><Clock className="w-3 h-3" />{format(new Date(u.lastSeen), "MMM d HH:mm")}</>
                    ) : "Never"}
                  </div>

                  {/* Revoke */}
                  <button
                    onClick={() => handleRevoke(u.discordId)}
                    disabled={revokeMutation.isPending}
                    className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-mono uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all"
                    style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.15)',color:'rgba(239,68,68,0.6)'}}>
                    <ShieldOff className="w-3 h-3" /> Revoke
                  </button>
                </div>
              ))}
            </div>
          )}

          {filteredUsers.length > 0 && (
            <div className="px-5 py-3 border-t"
              style={{borderColor:'rgba(255,255,255,0.04)',background:'rgba(255,255,255,0.005)'}}>
              <span className="text-white/15 text-[10px] font-mono tracking-widest">{filteredUsers.length} AUTHORIZED USERS</span>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
