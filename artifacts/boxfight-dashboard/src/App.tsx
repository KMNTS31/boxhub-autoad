import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";

import Disclaimer from "@/pages/disclaimer";
import Login from "@/pages/login";
import Unauthorized from "@/pages/unauthorized";
import Dashboard from "@/pages/dashboard";
import Sessions from "@/pages/sessions";
import Info from "@/pages/info";
import Admin from "@/pages/admin";
import { UserProvider, useUser } from "@/context/user-context";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, adminOnly = false }: { component: any, adminOnly?: boolean }) {
  const { user, isLoading, isError } = useUser();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const agreed = localStorage.getItem("boxfight_agreed") === "true";
    if (!agreed && location !== "/") {
      setLocation("/");
      return;
    }

    if (!isLoading) {
      if (isError || !user) {
        setLocation("/login");
      } else if (!user.isAuthorized && !user.isAdmin) {
        setLocation("/unauthorized");
      } else if (adminOnly && !user.isAdmin) {
        setLocation("/dashboard");
      }
    }
  }, [user, isLoading, isError, location, setLocation, adminOnly]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-t-2 border-white animate-spin"></div>
          <p className="text-muted-foreground font-gothic text-2xl animate-pulse">Checking auth...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (!user.isAuthorized && !user.isAdmin) return null;
  if (adminOnly && !user.isAdmin) return null;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Disclaimer} />
      <Route path="/login" component={Login} />
      <Route path="/unauthorized" component={Unauthorized} />
      
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/sessions">
        {() => <ProtectedRoute component={Sessions} />}
      </Route>
      <Route path="/info">
        {() => <ProtectedRoute component={Info} />}
      </Route>
      <Route path="/admin">
        {() => <ProtectedRoute component={Admin} adminOnly />}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <UserProvider>
            <Router />
          </UserProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
