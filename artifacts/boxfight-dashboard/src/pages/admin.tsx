import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useGetAdminStats, getGetAdminStatsQueryKey, useListAuthorizedUsers, getListAuthorizedUsersQueryKey, useAuthorizeUser, useRevokeUser } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  discordId: z.string().min(1, "Discord ID is required"),
  username: z.string().min(1, "Username is required"),
  notes: z.string().optional(),
});

type AuthorizeFormValues = z.infer<typeof authorizeSchema>;

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
        toast({ variant: "destructive", title: "Error", description: err.message || "Failed to authorize user" });
      }
    });
  };

  const handleRevoke = (discordId: string) => {
    if (confirm("Are you sure you want to revoke this user's access? Active sessions will be halted.")) {
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
      <div className="space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-gothic tracking-widest text-destructive animate-static-glow flex items-center gap-3">
            <ShieldAlert className="w-8 h-8" /> 
            Admin Control
          </h1>
          <p className="text-muted-foreground uppercase tracking-widest text-sm mt-1">System Overview & Access Management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Users className="w-24 h-24"/></div>
            <CardContent className="p-6 relative z-10">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Total Authorized</p>
              <p className="text-4xl font-gothic text-white">{stats?.totalAuthorized || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Zap className="w-24 h-24"/></div>
            <CardContent className="p-6 relative z-10">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Active Sessions</p>
              <div className="flex items-center gap-3">
                <p className="text-4xl font-gothic text-white">{stats?.activeSessionsCount || 0}</p>
                {(stats?.activeSessionsCount || 0) > 0 && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><MessageSquare className="w-24 h-24"/></div>
            <CardContent className="p-6 relative z-10">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Global Messages Sent</p>
              <p className="text-4xl font-gothic text-white">{stats?.totalMessagesSent?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card className="bg-card lightning-border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.01]">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search users by ID or username..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-input border-white/10 text-white w-full"
              />
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase shrink-0">
                  <UserPlus className="w-4 h-4 mr-2" /> Grant Access
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-white/20 lightning-border text-foreground">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-gothic tracking-wider text-white">Grant Access</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="discordId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground uppercase tracking-widest text-xs">Discord ID</FormLabel>
                          <FormControl><Input {...field} className="bg-input border-white/10 text-white font-mono" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground uppercase tracking-widest text-xs">Username</FormLabel>
                          <FormControl><Input {...field} className="bg-input border-white/10 text-white" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground uppercase tracking-widest text-xs">Notes (Optional)</FormLabel>
                          <FormControl><Input {...field} className="bg-input border-white/10 text-white" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={authorizeMutation.isPending} className="w-full bg-white text-black hover:bg-white/90 font-bold uppercase tracking-wider mt-4">
                      {authorizeMutation.isPending ? "Processing..." : "Authorize User"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-black/20">
                <TableRow className="border-white/10">
                  <TableHead className="text-muted-foreground uppercase tracking-widest text-xs py-4">User</TableHead>
                  <TableHead className="text-muted-foreground uppercase tracking-widest text-xs py-4">Discord ID</TableHead>
                  <TableHead className="text-muted-foreground uppercase tracking-widest text-xs py-4">Status</TableHead>
                  <TableHead className="text-muted-foreground uppercase tracking-widest text-xs py-4">Last Seen</TableHead>
                  <TableHead className="text-right text-muted-foreground uppercase tracking-widest text-xs py-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingUsers ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading users...</TableCell></TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No authorized users found.</TableCell></TableRow>
                ) : (
                  filteredUsers.map(u => (
                    <TableRow key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                            {u.avatar ? <img src={`https://cdn.discordapp.com/avatars/${u.discordId}/${u.avatar}.png`} className="w-full h-full rounded-full" alt=""/> : <User className="w-4 h-4 text-white/50" />}
                          </div>
                          <div>
                            <p className="font-bold text-white">{u.username}</p>
                            {u.notes && <p className="text-xs text-muted-foreground truncate max-w-[150px]">{u.notes}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-white/70">{u.discordId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs">
                          <Zap className="w-3 h-3 text-yellow-500" />
                          <span className="text-white">{u.sessionCount} Configs</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {u.lastSeen ? (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {format(new Date(u.lastSeen), "MMM d, HH:mm")}</span>
                        ) : "Never"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-destructive hover:bg-destructive/20 hover:text-destructive border border-transparent hover:border-destructive/30"
                          onClick={() => handleRevoke(u.discordId)}
                          disabled={revokeMutation.isPending}
                        >
                          <ShieldOff className="w-4 h-4 mr-2" /> Revoke
                        </Button>
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
