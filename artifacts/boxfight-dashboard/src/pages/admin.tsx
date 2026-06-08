import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useGetAdminStats, getGetAdminStatsQueryKey, useListAuthorizedUsers, getListAuthorizedUsersQueryKey, useAuthorizeUser, useRevokeUser } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ShieldAlert, Users, Zap, MessageSquare, Search, UserPlus, ShieldOff, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  discordId: z.string().min(1, "Required"),
  username:  z.string().min(1, "Required"),
  notes:     z.string().optional(),
});
type FormVals = z.infer<typeof schema>;
const fieldClass = "bg-white/[0.04] border-white/10 text-white font-mono text-sm h-9 focus-visible:ring-0 focus-visible:border-cyan-400/40 rounded-lg";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { data: stats } = useGetAdminStats({ query: { queryKey: getGetAdminStatsQueryKey() } });
  const { data: users = [], isLoading } = useListAuthorizedUsers({ query: { queryKey: getListAuthorizedUsersQueryKey() } });
  const authorizeMutation = useAuthorizeUser();
  const revokeMutation    = useRevokeUser();

  const form = useForm<FormVals>({ resolver: zodResolver(schema), defaultValues: { discordId: "", username: "", notes: "" } });

  const onSubmit = (data: FormVals) => {
    authorizeMutation.mutate({ discordId: data.discordId, data: { username: data.username, notes: data.notes } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAuthorizedUsersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        setOpen(false); form.reset(); toast({ title: "User Authorized" });
      },
      onError: (e: any) => toast({ variant: "destructive", title: "Error", description: e.message }),
    });
  };

  const revoke = (discordId: string) => {
    if (!confirm("Revoke this user's access? Active sessions will stop.")) return;
    revokeMutation.mutate({ discordId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAuthorizedUsersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        toast({ title: "Access Revoked" });
      }
    });
  };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) || u.discordId.includes(search)
  );

  return (
    <DashboardLayout>
      <div className="page-enter max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <p className="label mb-1">Restricted</p>
          <h1 className="font-gothic text-[42px] leading-none tracking-widest flex items-center gap-3 glow-red">
            <ShieldAlert size={36} style={{ filter: 'drop-shadow(0 0 10px rgba(239,68,68,0.6))' }} />
            Admin Panel
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Authorized Users",  val: stats?.totalAuthorized ?? 0,                     icon: Users,         glow: 'glow-cyan' },
            { label: "Active Sessions",   val: stats?.activeSessionsCount ?? 0,                 icon: Zap,           glow: 'glow-green', pulse: (stats?.activeSessionsCount ?? 0) > 0 },
            { label: "Total Messages",    val: (stats?.totalMessagesSent ?? 0).toLocaleString(), icon: MessageSquare, glow: 'glow-purple' },
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

        {/* User management */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(239,68,68,0.1)', boxShadow: '0 4px 32px rgba(0,0,0,0.4)' }}>

          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(239,68,68,0.3),transparent)' }} />

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.15)' }}>
            <div className="relative w-full max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="field pl-8"
                style={{ height: '34px' }}
              />
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="btn-red flex items-center gap-1.5 shrink-0">
                  <UserPlus size={13} /> Grant Access
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-sm"
                style={{
                  background: 'linear-gradient(145deg, rgba(8,10,20,0.99) 0%, rgba(4,6,14,1) 100%)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  boxShadow: '0 0 80px rgba(0,0,0,0.9)',
                }}>
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(239,68,68,0.5),transparent)' }} />
                <DialogHeader>
                  <DialogTitle className="font-gothic text-2xl tracking-wider text-white">Grant Access</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5 pt-2">
                    {([
                      { name: 'discordId', label: 'Discord ID',         ph: '123456789...' },
                      { name: 'username',  label: 'Username',            ph: 'username' },
                      { name: 'notes',     label: 'Notes (optional)',    ph: '' },
                    ] as any[]).map(f => (
                      <FormField key={f.name} control={form.control} name={f.name} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="label">{f.label}</FormLabel>
                          <FormControl><Input {...field} className={fieldClass} placeholder={f.ph} /></FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )} />
                    ))}
                    <button type="submit" disabled={authorizeMutation.isPending} className="btn-red w-full" style={{ height: '38px', width: '100%' }}>
                      {authorizeMutation.isPending ? "Processing..." : "Authorize User"}
                    </button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Column headers */}
          <div className="grid px-5 py-3 border-b" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px', gap: '12px', borderColor: 'rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.1)' }}>
            {['User','Discord ID','Sessions','Last Seen',''].map(h => <span key={h} className="thead-cell">{h}</span>)}
          </div>

          {isLoading ? (
            <div className="py-12 text-center label" style={{ letterSpacing: '0.2em' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-white/20 text-sm font-mono">No users found</div>
          ) : (
            <div>
              {filtered.map(u => (
                <div key={u.id}
                  className="trow grid px-5 py-3.5 items-center group"
                  style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px', gap: '12px' }}>

                  {/* User */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden flex items-center justify-center"
                      style={{ border: '1px solid rgba(0,220,255,0.15)', background: 'rgba(0,220,255,0.06)' }}>
                      {u.avatar
                        ? <img src={`https://cdn.discordapp.com/avatars/${u.discordId}/${u.avatar}.png`} className="w-full h-full" alt="" />
                        : <User size={14} className="text-cyan-400/50" />}
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-semibold leading-none">{u.username}</p>
                      {u.notes && <p className="text-white/30 text-[11px] mt-0.5 truncate max-w-[110px] font-mono">{u.notes}</p>}
                    </div>
                  </div>

                  {/* Discord ID */}
                  <span className="font-mono text-xs text-white/35 truncate">{u.discordId}</span>

                  {/* Sessions */}
                  <div className="flex items-center gap-1.5">
                    <Zap size={11} className="text-amber-400/50" />
                    <span className="text-white/55 text-sm font-mono">{u.sessionCount}</span>
                  </div>

                  {/* Last seen */}
                  <div className="flex items-center gap-1 font-mono text-xs text-white/30">
                    {u.lastSeen ? <><Clock size={10} />{format(new Date(u.lastSeen), "MMM d HH:mm")}</> : "Never"}
                  </div>

                  {/* Revoke */}
                  <button
                    onClick={() => revoke(u.discordId)}
                    disabled={revokeMutation.isPending}
                    className="btn-red flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ height: '28px', fontSize: '10px' }}
                  >
                    <ShieldOff size={11} /> Revoke
                  </button>
                </div>
              ))}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t flex justify-between" style={{ borderColor: 'rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.1)' }}>
              <span className="label">{filtered.length} AUTHORIZED</span>
              <span className="label">ADMIN PANEL</span>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
