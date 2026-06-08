import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useListSessions, getListSessionsQueryKey, useCreateSession, useStartSession, useStopSession, useDeleteSession } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Play, Square, Trash2, Plus, Clock, MessageSquare, Activity, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";

const sessionSchema = z.object({
  channelId: z.string().min(1, "Required"),
  message: z.string().min(1, "Required"),
  delay: z.coerce.number().min(0).default(0),
  interval: z.coerce.number().min(1000, "Min 1000ms").default(5000),
  userToken: z.string().min(1, "Required"),
});
type SessionFormValues = z.infer<typeof sessionSchema>;

const fieldClass = "bg-white/[0.04] border-white/10 text-white font-mono text-sm h-9 focus-visible:ring-0 focus-visible:border-cyan-400/40 rounded-lg";

export default function Sessions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: sessions = [], isLoading } = useListSessions({ query: { queryKey: getListSessionsQueryKey() } });
  const createMutation = useCreateSession();
  const startMutation  = useStartSession();
  const stopMutation   = useStopSession();
  const deleteMutation = useDeleteSession();

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { channelId: "", message: "", delay: 0, interval: 5000, userToken: "" },
  });

  const onSubmit = (data: SessionFormValues) => {
    createMutation.mutate({ data }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() }); setOpen(false); form.reset(); toast({ title: "Session Created" }); },
      onError: (e: any) => toast({ variant: "destructive", title: "Error", description: e.message }),
    });
  };

  const act = (action: 'start'|'stop'|'delete', id: number) => {
    const m = action === 'start' ? startMutation : action === 'stop' ? stopMutation : deleteMutation;
    m.mutate({ id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() }); toast({ title: `Session ${action}ed` }); } });
  };

  const runningCount = sessions.filter(s => s.status === 'running').length;

  return (
    <DashboardLayout>
      <div className="page-enter max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="label mb-1">Management</p>
            <h1 className="font-gothic text-[42px] leading-none text-white tracking-widest animate-textglow">Sessions</h1>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="btn-cyan flex items-center gap-1.5" style={{ height: '38px', padding: '0 18px' }}>
                <Plus size={13} /> New Session
              </button>
            </DialogTrigger>
            <DialogContent
              className="max-w-md"
              style={{
                background: 'linear-gradient(145deg, rgba(8,10,20,0.99) 0%, rgba(4,6,14,1) 100%)',
                border: '1px solid rgba(0,220,255,0.18)',
                boxShadow: '0 0 80px rgba(0,0,0,0.9), 0 0 40px rgba(0,220,255,0.06)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(0,220,255,0.5),transparent)' }} />
              <DialogHeader>
                <DialogTitle className="font-gothic text-2xl tracking-wider text-white">New Session</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5 pt-2">
                  {([
                    { name: 'channelId', label: 'Channel ID',    ph: '1234567890...' },
                    { name: 'userToken', label: 'Discord Token', ph: 'MTE...', type: 'password' },
                  ] as any[]).map(f => (
                    <FormField key={f.name} control={form.control} name={f.name} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="label">{f.label}</FormLabel>
                        <FormControl><Input type={f.type || 'text'} {...field} className={fieldClass} placeholder={f.ph} /></FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )} />
                  ))}
                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label">Message</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="bg-white/[0.04] border-white/10 text-white font-mono text-sm min-h-[72px] focus-visible:ring-0 focus-visible:border-cyan-400/40 rounded-lg resize-none" placeholder="!boxfight..." />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { name: 'delay',    label: 'Initial Delay (ms)' },
                      { name: 'interval', label: 'Interval (ms)' },
                    ] as any[]).map(f => (
                      <FormField key={f.name} control={form.control} name={f.name} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="label">{f.label}</FormLabel>
                          <FormControl><Input type="number" {...field} className={fieldClass} /></FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )} />
                    ))}
                  </div>
                  <button type="submit" disabled={createMutation.isPending} className="btn-cyan w-full" style={{ height: '40px', marginTop: '8px' }}>
                    {createMutation.isPending ? "Creating..." : "Create Session"}
                  </button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table card */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.4)' }}>

          {/* Top strip */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(0,220,255,0.2),transparent)' }} />

          {/* Column headers */}
          <div className="grid px-5 py-3 border-b" style={{ gridTemplateColumns: '110px 1fr 2fr 140px 90px', gap: '12px', borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.15)' }}>
            {['Status','Channel','Message','Timing','Actions'].map(h => <span key={h} className="thead-cell">{h}</span>)}
          </div>

          {isLoading ? (
            <div className="py-14 text-center label" style={{ letterSpacing: '0.2em' }}>Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="py-16 text-center">
              <Zap size={28} className="mx-auto mb-3 text-white/10" />
              <p className="text-white/25 text-sm font-mono">No sessions configured</p>
            </div>
          ) : (
            <div>
              {sessions.map(session => {
                const running = session.status === 'running';
                const errored = session.status === 'error';
                const dotC = running ? '#4ade80' : errored ? '#f87171' : 'rgba(255,255,255,0.25)';
                return (
                  <div key={session.id}
                    className="trow grid px-5 py-4 items-center group"
                    style={{ gridTemplateColumns: '110px 1fr 2fr 140px 90px', gap: '12px' }}
                  >
                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotC, boxShadow: `0 0 6px ${dotC}` }} />
                      <span className={`font-mono text-[10px] uppercase tracking-wider ${running ? 'badge-running' : errored ? 'badge-error' : 'badge-stopped'} px-2 py-0.5 rounded-md`}>
                        {session.status}
                      </span>
                    </div>

                    {/* Channel */}
                    <span className="font-mono text-xs text-white/45 truncate">{session.channelId}</span>

                    {/* Message */}
                    <span className="text-sm text-white/60 italic truncate">"{session.message}"</span>

                    {/* Timing + stats */}
                    <div className="space-y-1 font-mono text-[11px] text-white/30">
                      <div className="flex items-center gap-1.5"><Clock size={10} />{session.interval}ms interval</div>
                      <div className="flex items-center gap-1.5"><MessageSquare size={10} />{session.messagesSent} sent</div>
                      {session.lastSentAt && (
                        <div className="flex items-center gap-1.5"><Activity size={10} />{format(new Date(session.lastSentAt), "HH:mm:ss")}</div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!running
                        ? <button onClick={() => act('start', session.id)} disabled={startMutation.isPending} className="icon-btn icon-btn-green"><Play size={12} /></button>
                        : <button onClick={() => act('stop',  session.id)} disabled={stopMutation.isPending}  className="icon-btn icon-btn-amber"><Square size={12} /></button>}
                      <button onClick={() => act('delete', session.id)} disabled={deleteMutation.isPending} className="icon-btn icon-btn-red"><Trash2 size={12} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          {sessions.length > 0 && (
            <div className="px-5 py-3 flex justify-between border-t" style={{ borderColor: 'rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.1)' }}>
              <span className="label">{sessions.length} TOTAL</span>
              <span className="label">{runningCount} RUNNING</span>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
