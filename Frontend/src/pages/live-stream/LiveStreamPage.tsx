import { useState, useEffect, useRef } from 'react';
import { Play, Circle, Maximize2, Video } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { socketClient } from '../../services/socket/socketClient';
import { toast } from 'sonner';

export function LiveStreamPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [streamFrame, setStreamFrame] = useState<string | null>(null);
  
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const socket = socketClient.connect();
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsLive(true);
      socket.emit('join-live-stream');
    });

    socket.on('disconnect', () => {
      setIsLive(false);
    });

    socket.on('live-stream-data', (data: ArrayBuffer | Buffer) => {
      // Assuming data is a JPEG buffer
      const blob = new Blob([data], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      setStreamFrame(url);
      
      // Cleanup previous URL to avoid memory leaks
      return () => URL.revokeObjectURL(url);
    });

    socket.on('recording-status', (status: { active: boolean }) => {
      setIsRecording(status.active);
    });

    return () => {
      socketClient.disconnect();
    };
  }, []);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecordingToggle = () => {
    if (isRecording) {
      socketRef.current?.emit('stop-recording');
      toast.info('Recording stopped');
    } else {
      socketRef.current?.emit('start-recording');
      toast.info('Recording started');
    }
  };

  const handleFullscreen = () => {
    const videoElement = document.getElementById('live-video-container');
    if (videoElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoElement.requestFullscreen();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Player */}
          <div className="relative bg-black rounded-lg overflow-hidden shadow-xl" id="live-video-container">
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
              {streamFrame ? (
                <img src={streamFrame} alt="Live Stream" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-4">
                    <Video className="w-10 h-10 text-white/70" />
                  </div>
                  <p className="text-white/70 text-lg">Waiting for camera feed...</p>
                  <p className="text-white/50 text-sm mt-2">Front Entrance Camera</p>
                </div>
              )}

              {/* Connection Status Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg z-10">
                <div className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-[#10B981] animate-pulse' : 'bg-[#EF4444]'}`} />
                <span className="text-white text-sm font-medium">
                  {isLive ? 'LIVE' : 'DISCONNECTED'}
                </span>
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={handleFullscreen}
                className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors p-2.5 rounded-lg z-10"
              >
                <Maximize2 className="w-5 h-5 text-white" />
              </button>

              {/* Recording Indicator Overlay */}
              {isRecording && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-[#EF4444] px-3 py-2 rounded-lg z-10">
                  <Circle className="w-3 h-3 text-white fill-white animate-pulse" />
                  <span className="text-white text-sm font-medium">REC {formatDuration(recordingDuration)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Recording Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Recording Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleRecordingToggle}
                  size="lg"
                  disabled={!isLive}
                  className={`flex-1 h-12 ${
                    isRecording
                      ? 'bg-[#EF4444] hover:bg-[#dc2626] text-white'
                      : 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Circle className="w-5 h-5 mr-2 fill-white" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>
              </div>

              {isRecording ? (
                <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-[#EF4444]">
                    <Circle className="w-4 h-4 fill-current animate-pulse" />
                    <span className="font-medium">Recording in progress</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Started by {user?.name} at {new Date().toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    {isLive ? 'Click "Start Recording" to begin capturing footage' : 'Camera is offline. Recording unavailable.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Camera Info */}
          <Card>
            <CardHeader>
              <CardTitle>Camera Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Camera Name</p>
                <p className="font-medium">Front Entrance</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">Main Building - Level 1</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`} />
                  <span className="font-medium">{isLive ? 'Online' : 'Offline'}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolution</p>
                <p className="font-medium">1920x1080 (Full HD)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Frame Rate</p>
                <p className="font-medium">30 fps</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="font-medium">2.4 GB / 50 GB</p>
                <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-[#2563EB]" style={{ width: '4.8%' }} />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recording Duration</p>
                <p className="font-medium">3h 24m</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Recordings</p>
                <p className="font-medium">12 clips</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Motion Events</p>
                <p className="font-medium">47 detected</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
