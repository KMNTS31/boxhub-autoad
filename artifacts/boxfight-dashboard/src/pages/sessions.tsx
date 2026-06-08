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
  channelId: z.string().min(1, "Channel ID is required"),
  message: z.string().min(1, "Message is required"),
  delay: z.coerce.number().min(0).default(0),
  interval: z.coerce.number().min(1000, "Min 1000ms").default(5000),
  userToken: z.string().min(1, "Discord token is required"),
});

type SessionFormValues = z.infer<typeof sessionSchema>;

const statusStyle = (status: string) => {
  if (status === 'running') return { color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)', glow: 'rgba(74,222,128,0.4)' };
  if (status === 'error') return { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', glow: 'rgba(239,68,68,0.4)' };
  return { color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', glow: 'transparent' };
};

export default function Sessions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: sessions = [], isLoading } = useListSessions({
    query: { queryKey: getListSessionsQueryKey() }
  });

  const createMutation = useCreateSession();
  const startMutation = useStartSession();
  const stopMutation = useStopSession();
  const deleteMutation = useDeleteSession();

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { channelId: "", message: "", delay: 0, interval: 5000, userToken: "" },
  });

  const onSubmit = (data: SessionFormValues) => {
    createMutation.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
        setIsDialogOpen(false);
        form.reset();
        toast({ title: "Session Created" });
      },
      onError: (error: any) => {
        toast({ variant: "destructive", title: "Error", description: error.message });
      }
    });
  };

  const handleAction = (action: 'start' | 'stop' | 'delete', id: number) => {
    const mut = action === 'start' ? startMutation : action === 'stop' ? stopMutation : deleteMutation;
    mut.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
        toast({ title: `Session ${action === 'delete' ? 'deleted' : action + 'ed'}` });
      }
    });
  };

  const inputClass = "bg-white/[0.03] border-white/10 text-white font-mono text-sm focus-visible:ring-0 focus-visible:border-cyan-400/40 h-9";
  const labelClass = "text-white/40 text-[10px] font-mono tracking-[0.25em] uppercase";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/25 font-mono text-[10px] tracking-[0.3em] uppercase mb-1">Management</p>
            <h1 className="font-gothic text-4xl text-white tracking-widest" style={{textShadow:'0 0 30px rgba(0,212,255,0.2)'}}>
              Sessions
            </h1>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-9 px-4 font-bold uppercase tracking-wider text-xs transition-all"
                style={{
                  background:'rgba(0,212,255,0.1)',
                  border:'1px solid rgba(0,212,255,0.3)',
                  color:'#00d4ff',
                  boxShadow:'0 0 16px rgba(0,212,255,0.1)'
                }}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> New Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md"
              style={{
                background:'linear-gradient(145deg, rgba(10,12,22,0.99) 0%, rgba(6,8,16,1) 100%)',
                border:'1px solid rgba(0,212,255,0.15)',
                boxShadow:'0 0 60px rgba(0,212,255,0.08), 0 40px 80px rgba(0,0,0,0.8)'
              }}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
              <DialogHeader>
                <DialogTitle className="font-gothic text-2xl tracking-wider text-white">New Session</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                  <FormField control={form.control} name="channelId" render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Channel ID</FormLabel>
                      <FormControl>
                        <Input {...field} className={inputClass} placeholder="1234567890..." />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Message</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="bg-white/[0.03] border-white/10 text-white font-mono text-sm min-h-[80px] focus-visible:ring-0 focus-visible:border-cyan-400/40 resize-none" placeholder="!boxfight..." />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="delay" render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>Initial Delay (ms)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className={inputClass} />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="interval" render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>Interval (ms)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className={inputClass} />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="userToken" render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Discord Token</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} className={inputClass} placeholder="MTE..." />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )} />
                  <Button type="submit" disabled={createMutation.isPending} className="w-full h-10 font-bold uppercase tracking-wider text-xs mt-2"
                    style={{background:'rgba(0,212,255,0.12)',border:'1px solid rgba(0,212,255,0.3)',color:'#00d4ff',boxShadow:'0 0 20px rgba(0,212,255,0.1)'}}>
                    {createMutation.isPending ? "Creating..." : "Create Session"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Sessions table card */}
        <div className="rounded-xl overflow-hidden"
          style={{
            background:'linear-gradient(145deg, rgba(10,12,22,0.8) 0%, rgba(6,8,16,0.9) 100%)',
            border:'1px solid rgba(0,212,255,0.08)',
            boxShadow:'0 4px 24px rgba(0,0,0,0.4)'
          }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

          {/* Table header */}
          <div className="grid grid-cols-[1fr_1.5fr_2fr_1fr_auto] gap-4 px-5 py-3.5 border-b"
            style={{borderColor:'rgba(255,255,255,0.05)',background:'rgba(255,255,255,0.01)'}}>
            {['Status', 'Channel', 'Message', 'Timing', 'Actions'].map(h => (
              <span key={h} className="text-[10px] font-mono text-white/25 tracking-[0.25em] uppercase">{h}</span>
            ))}
          </div>

          {/* Rows */}
          {isLoading ? (
            <div className="py-12 text-center text-white/25 text-sm font-mono tracking-widest">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{background:'rgba(0,212,255,0.05)',border:'1px solid rgba(0,212,255,0.1)'}}>
                <Zap className="w-5 h-5 text-cyan-400/30" />
              </div>
              <p className="text-white/20 text-sm font-mono">No sessions configured</p>
            </div>
          ) : (
            <div className="divide-y" style={{borderColor:'rgba(255,255,255,0.03)'}}>
              {sessions.map((session) => {
                const s = statusStyle(session.status);
                return (
                  <div key={session.id}
                    className="grid grid-cols-[1fr_1.5fr_2fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-white/[0.015] transition-colors group">

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:s.color,boxShadow:`0 0 6px ${s.glow}`}} />
                      <span className="text-[10px] font-mono uppercase tracking-wider" style={{color:s.color}}>{session.status}</span>
                    </div>

                    {/* Channel */}
                    <span className="font-mono text-xs text-white/50 truncate">{session.channelId}</span>

                    {/* Message */}
                    <span className="text-sm text-white/60 truncate italic">"{session.message}"</span>

                    {/* Timing + stats */}
                    <div className="flex flex-col gap-1 text-[11px] text-white/30 font-mono">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{session.interval}ms</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{session.messagesSent} sent</span>
                      {session.lastSentAt && (
                        <span className="flex items-center gap-1 text-[10px]">
                          <Activity className="w-3 h-3" />{format(new Date(session.lastSentAt), "HH:mm:ss")}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {session.status !== 'running' ? (
                        <button onClick={() => handleAction('start', session.id)} disabled={startMutation.isPending}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{background:'rgba(74,222,128,0.08)',border:'1px solid rgba(74,222,128,0.2)',color:'#4ade80'}}>
                          <Play className="w-3 h-3" />
                        </button>
                      ) : (
                        <button onClick={() => handleAction('stop', session.id)} disabled={stopMutation.isPending}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{background:'rgba(251,191,36,0.08)',border:'1px solid rgba(251,191,36,0.2)',color:'#fbbf24'}}>
                          <Square className="w-3 h-3" />
                        </button>
                      )}
                      <button onClick={() => handleAction('delete', session.id)} disabled={deleteMutation.isPending}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                        style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.15)',color:'rgba(239,68,68,0.6)'}}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          {sessions.length > 0 && (
            <div className="px-5 py-3 flex items-center justify-between border-t"
              style={{borderColor:'rgba(255,255,255,0.04)',background:'rgba(255,255,255,0.005)'}}>
              <span className="text-white/20 text-[10px] font-mono tracking-widest">{sessions.length} TOTAL SESSIONS</span>
              <span className="text-white/20 text-[10px] font-mono tracking-widest">
                {sessions.filter(s=>s.status==='running').length} RUNNING
              </span>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
