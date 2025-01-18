import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@db/schema";
import { useToast } from "./use-toast";

interface AuthCredentials {
  username: string;
  password: string;
  email?: string;
}

async function handleAuth(url: string, credentials: AuthCredentials): Promise<User> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export function useUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: AuthCredentials) =>
      handleAuth("/api/login", credentials),
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.username}`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (credentials: AuthCredentials) =>
      handleAuth("/api/register", credentials),
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: "Welcome to Medical Admissions!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message,
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "Come back soon!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message,
      });
    },
  });

  return {
    user,
    isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
  };
}
