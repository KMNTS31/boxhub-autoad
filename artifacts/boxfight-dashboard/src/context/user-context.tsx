import React, { createContext, useContext, ReactNode } from "react";
import { useGetMe, getGetMeQueryKey, DiscordUser } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface UserContextType {
  user: DiscordUser | null;
  isLoading: boolean;
  isError: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  isError: false,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const agreed = localStorage.getItem("boxfight_agreed") === "true";

  const { data: user, isLoading, isError } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
    },
  });

  // Auth routing logic is handled in App.tsx to avoid complex context effects
  
  return (
    <UserContext.Provider value={{ user: user ?? null, isLoading, isError }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
