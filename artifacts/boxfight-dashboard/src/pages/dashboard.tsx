import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useUser } from "@/context/user-context";
import {
  useValidateDiscordToken,
  useListSessions,
  getListSessionsQueryKey,
  useStartSession,
  useStopSession,
  useDeleteSession,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

import { Eye, EyeOff, ShieldCheck, Zap, AlertTriangle, Play, Square, Trash2, Plus, MessageSquare, Clock, Key } from "lucide-react";

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

  const { data: sessions = [], isLoading } = useListSessions({
    query: { queryKey: getListSessionsQueryKey() },
  });

  const activeSessions = sessions.filter((s) => s.status === "running");
  const totalMessages = sessions.reduce((a, s) => a + s.messagesSent, 0);

  const handleValidate = () => {
    if (!token) return;

    validateMutation.mutate(
      { data: { token } },
      {
        onSuccess: (res: any) => {
          // FIX: API client is incorrectly typed as void, so we safely assert
          if (res?.valid) {
            setIsValidated(true);
            setValidatedUser(res.username ?? null);

            toast({
              title: "Token Valid",
              description: `Authenticated as ${res.username}`,
            });
          } else {
            setIsValidated(false);
            setValidatedUser(null);

            toast({
              variant: "destructive",
              title: "Invalid Token",
              description: res?.error || "Token rejected",
            });
          }
        },
        onError: () => {
          setIsValidated(false);
          setValidatedUser(null);

          toast({
            variant: "destructive",
            title: "Validation Failed",
          });
        },
      }
    );
  };

  const handleStart = (id: number) =>
    startMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getListSessionsQueryKey(),
          });
          toast({ title: "Started" });
        },
      }
    );

  const handleStop = (id: number) =>
    stopMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getListSessionsQueryKey(),
          });
          toast({ title: "Stopped" });
        },
      }
    );

  const handleDelete = (id: number) =>
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getListSessionsQueryKey(),
          });
          toast({ title: "Deleted" });
        },
      }
    );

  return (
    <DashboardLayout>
      <div className="page-enter max-w-5xl mx-auto space-y-7">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="label mb-1">Overview</p>
            <h1 className="font-gothic text-[42px] leading-none text-white tracking-widest animate-textglow">
              Dashboard
            </h1>
          </div>

          <p className="text-white/30 text-sm pb-1">
            Welcome back,{" "}
            <span className="text-white/70 font-semibold">{user?.username}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Sessions", val: sessions.length, icon: Zap },
            { label: "Active Now", val: activeSessions.length, icon: Play },
            { label: "Messages Sent", val: totalMessages.toLocaleString(), icon: MessageSquare },
          ].map(({ label, val, icon: Icon }) => (
            <div key={label} className="stat-card rounded-2xl p-5 group">
              <div className="flex justify-between mb-3">
                <p className="label">{label}</p>
                <Icon size={14} className="text-white/10" />
              </div>
              <div className="text-4xl font-gothic text-white">
                {val}
              </div>
            </div>
          ))}
        </div>

        {/* Token Validator */}
        <div className="panel rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <Key size={15} />
            <div>
              <p className="text-white/85 text-sm font-semibold">
                Token Validator
              </p>
              <p className="text-white/35 text-xs">
                Verify a Discord token before creating a session
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type={showToken ? "text" : "password"}
              placeholder="Paste Discord token"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setIsValidated(false);
              }}
              className="field flex-1"
            />

            <button
              onClick={() => setShowToken(!showToken)}
              className="text-white/50"
            >
              {showToken ? <EyeOff /> : <Eye />}
            </button>

            <button
              onClick={handleValidate}
              disabled={!token || validateMutation.isPending}
              className="btn-cyan"
            >
              Validate
            </button>
          </div>

          {isValidated && validatedUser && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck size={15} />
                <span>
                  Valid · <b>{validatedUser}</b>
                </span>
              </div>

              <Link href="/sessions">
                <button className="btn-cyan mt-2">
                  <Plus size={12} /> New Session
                </button>
              </Link>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}