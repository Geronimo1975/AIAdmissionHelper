import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ChatResponse {
  content: string;
  confidence: number;
}

export function useChat() {
  const { toast } = useToast();

  const { mutateAsync: sendMessage } = useMutation<
    ChatResponse,
    Error,
    { message: string; userId: number }
  >({
    mutationFn: async ({ message, userId }) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, userId }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  return {
    sendMessage: (message: string, userId?: number) =>
      sendMessage({ message, userId: userId || 0 }),
  };
}
