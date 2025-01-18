import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useVideo } from "@/hooks/use-video";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Video, Mic, MicOff, VideoOff, Phone } from "lucide-react";

export default function VideoInterview() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const {
    localVideoRef,
    remoteVideoRef,
    isConnected,
    isRecording,
    transcript,
    startLocalStream,
    stopRecording
  } = useVideo({
    sessionId: id,
    onEnd: async (transcript) => {
      try {
        const response = await fetch(`/api/interview/${id}/end`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ transcript })
        });

        if (!response.ok) {
          throw new Error('Failed to save interview');
        }

        toast({
          title: "Interview Completed",
          description: "Your interview has been recorded and will be evaluated."
        });

        setLocation('/');
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save interview results"
        });
      }
    }
  });

  useEffect(() => {
    if (!id) {
      setLocation('/');
      return;
    }

    startLocalStream().catch(error => {
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Failed to access your camera or microphone"
      });
    });
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="aspect-video relative overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-2 py-1 rounded">
              You
            </div>
          </Card>

          <Card className="aspect-video relative overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-2 py-1 rounded">
              Interviewer
            </div>
          </Card>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            variant={isRecording ? "destructive" : "default"}
            onClick={() => isRecording ? stopRecording() : startLocalStream()}
            disabled={!isConnected}
          >
            {isRecording ? (
              <>
                <Phone className="h-4 w-4 mr-2" />
                End Interview
              </>
            ) : (
              <>
                <Video className="h-4 w-4 mr-2" />
                Start Interview
              </>
            )}
          </Button>
        </div>

        {transcript && (
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Interview Transcript</h3>
            <p className="text-sm text-gray-600">{transcript}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
