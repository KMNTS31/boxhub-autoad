import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useListSessions, getListSessionsQueryKey, useCreateSession, useStartSession, useStopSession, useDeleteSession } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Play, Square, Trash2, Plus, Clock, MessageSquare, Activity } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";

const sessionSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
  message: z.string().min(1, "Message is required"),
  delay: z.coerce.number().min(0, "Delay must be positive").default(0),
  interval: z.coerce.number().min(1000, "Interval must be at least 1000ms").default(5000),
  userToken: z.string().min(1, "Discord token is required"),
});

type SessionFormValues = z.infer<typeof sessionSchema>;

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
    defaultValues: {
      channelId: "",
      message: "",
      delay: 0,
      interval: 5000,
      userToken: "",
    },
  });

  const onSubmit = (data: SessionFormValues) => {
    createMutation.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
        setIsDialogOpen(false);
        form.reset();
        toast({ title: "Session created successfully" });
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Failed to create session",
          description: error.message || "An unknown error occurred",
        });
      }
    });
  };

  const handleAction = (action: 'start' | 'stop' | 'delete', id: number) => {
    const mutation = action === 'start' ? startMutation : action === 'stop' ? stopMutation : deleteMutation;
    mutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
        toast({ title: `Session ${action}ed` });
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-gothic tracking-widest text-white animate-static-glow">Sessions</h1>
            <p className="text-muted-foreground uppercase tracking-widest text-sm mt-1">Manage Auto-Ad Configurations</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase">
                <Plus className="w-4 h-4 mr-2" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/20 lightning-border text-foreground">
              <DialogHeader>
                <DialogTitle className="text-2xl font-gothic tracking-wider text-white">Create Session</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="channelId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground uppercase tracking-widest text-xs">Channel ID</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-input border-white/10 text-white font-mono" placeholder="1234567890..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground uppercase tracking-widest text-xs">Message</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="bg-input border-white/10 text-white min-h-[100px]" placeholder="!boxfight..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="delay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground uppercase tracking-widest text-xs">Initial Delay (ms)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="bg-input border-white/10 text-white font-mono" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="interval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground uppercase tracking-widest text-xs">Interval (ms)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="bg-input border-white/10 text-white font-mono" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="userToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground uppercase tracking-widest text-xs">Discord Token</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} className="bg-input border-white/10 text-white font-mono" placeholder="MTE..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createMutation.isPending} className="w-full bg-white text-black hover:bg-white/90 font-bold uppercase tracking-wider mt-4">
                    {createMutation.isPending ? "Creating..." : "Submit Configuration"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-card lightning-border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5 hover:bg-white/5 border-b border-white/10">
                <TableRow className="border-none">
                  <TableHead className="text-muted-foreground uppercase tracking-widest text-xs py-4">Status</TableHead>
                  <TableHead className="text-muted-foreground uppercase tracking-widest text-xs py-4">Channel</TableHead>
                  <TableHead className="text-muted-foreground uppercase tracking-widest text-xs py-4">Message</TableHead>
                  <TableHead className="text-muted-foreground uppercase tracking-widest text-xs py-4">Timing</TableHead>
                  <TableHead className="text-muted-foreground uppercase tracking-widest text-xs py-4 text-right">Stats & Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading sessions...</TableCell>
                  </TableRow>
                ) : sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No sessions configured</TableCell>
                  </TableRow>
                ) : (
                  sessions.map((session) => (
                    <TableRow key={session.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <TableCell>
                        <Badge className={
                          session.status === 'running' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          session.status === 'stopped' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          session.status === 'error' ? 'bg-destructive/20 text-destructive border-destructive/30' :
                          'bg-white/10 text-white/70 border-white/20'
                        }>
                          {session.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-white/80">{session.channelId}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="truncate text-sm text-white/70">{session.message}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs text-muted-foreground gap-1">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> D: {session.delay}ms</span>
                          <span className="flex items-center gap-1"><Activity className="w-3 h-3"/> I: {session.interval}ms</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-4">
                          <div className="flex flex-col items-end text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 text-white/90">
                              <MessageSquare className="w-3 h-3" />
                              {session.messagesSent} sent
                            </span>
                            {session.lastSentAt && (
                              <span className="opacity-70">
                                Last: {format(new Date(session.lastSentAt), "HH:mm:ss")}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 border-l border-white/10 pl-4">
                            {session.status !== 'running' ? (
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-400 hover:bg-green-500/20 hover:text-green-300" onClick={() => handleAction('start', session.id)}>
                                <Play className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300" onClick={() => handleAction('stop', session.id)}>
                                <Square className="w-4 h-4" />
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/20 hover:text-destructive" onClick={() => handleAction('delete', session.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
