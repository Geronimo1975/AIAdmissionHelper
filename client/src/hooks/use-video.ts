import { useEffect, useRef, useState } from "react";
import { useToast } from "./use-toast";

interface VideoConfig {
  sessionId: string;
  onEnd?: (transcript: string) => void;
}

export function useVideo({ sessionId, onEnd }: VideoConfig) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}`;
    
    webSocketRef.current = new WebSocket(wsUrl);
    
    webSocketRef.current.onopen = () => {
      setIsConnected(true);
      webSocketRef.current?.send(JSON.stringify({
        type: 'join',
        sessionId
      }));
    };

    webSocketRef.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'offer':
          await handleOffer(data);
          break;
        case 'answer':
          await handleAnswer(data);
          break;
        case 'ice-candidate':
          await handleIceCandidate(data);
          break;
      }
    };

    return () => {
      webSocketRef.current?.close();
      peerConnectionRef.current?.close();
    };
  }, [sessionId]);

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      peerConnectionRef.current = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      stream.getTracks().forEach(track => {
        peerConnectionRef.current?.addTrack(track, stream);
      });

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          webSocketRef.current?.send(JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate
          }));
        }
      };

      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      
      webSocketRef.current?.send(JSON.stringify({
        type: 'offer',
        offer
      }));

      startRecording(stream);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Video Error",
        description: "Failed to access camera/microphone"
      });
    }
  };

  const startRecording = (stream: MediaStream) => {
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
        webSocketRef.current?.send(JSON.stringify({
          type: 'recording-chunk',
          chunk: event.data
        }));
      }
    };

    mediaRecorder.start(1000);
    setIsRecording(true);
  };

  const stopRecording = async () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);

    const blob = new Blob(recordedChunksRef.current, {
      type: 'video/webm'
    });

    // Convert audio to text using browser's speech recognition
    const audioContext = new AudioContext();
    const audioBuffer = await blob.arrayBuffer();
    const audioData = await audioContext.decodeAudioData(audioBuffer);
    
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const finalTranscript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ');
      
      setTranscript(finalTranscript);
      onEnd?.(finalTranscript);
    };

    recognition.start();
  };

  const handleOffer = async (data: any) => {
    await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peerConnectionRef.current?.createAnswer();
    await peerConnectionRef.current?.setLocalDescription(answer);
    
    webSocketRef.current?.send(JSON.stringify({
      type: 'answer',
      answer
    }));
  };

  const handleAnswer = async (data: any) => {
    await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
  };

  const handleIceCandidate = async (data: any) => {
    await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
  };

  return {
    localVideoRef,
    remoteVideoRef,
    isConnected,
    isRecording,
    transcript,
    startLocalStream,
    stopRecording
  };
}
