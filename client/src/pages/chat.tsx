import { useState, useRef, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/hooks/use-chat";
import { Send, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface Message {
  content: string;
  isUser: boolean;
}

export default function Chat() {
  const [message, setMessage] = useState("");
  const { user } = useUser();
  const { sendMessage } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = { content: message, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    try {
      const response = await sendMessage(message, user?.id);
      const aiMessage = { content: response.content, isUser: false };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-4 border-b bg-white flex items-center">
        <Button variant="ghost" onClick={() => setLocation("/")} className="mr-4">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">Chat with AI Counselor</h1>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <Card
              key={i}
              className={`max-w-[80%] ${
                msg.isUser ? "ml-auto bg-primary text-primary-foreground" : ""
              }`}
            >
              <CardContent className="p-3">{msg.content}</CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-white">
        <div className="max-w-3xl mx-auto flex gap-4">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
          />
          <Button onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
