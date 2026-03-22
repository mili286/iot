import { useState, useEffect, useRef } from 'react';
import { Play, Circle, Maximize2, Video, Loader2 } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { socketClient } from '../../services/socket/socketClient';
import { useGetSystemParametersQuery } from '../../features/system/api/systemApi';
import { toast } from 'sonner';

export function LiveStreamPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { data: systemParams, isLoading: isParamsLoading, refetch: refetchParams } = useGetSystemParametersQuery(undefined, {
    pollingInterval: 5000, // Poll every 5 seconds
  });
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

    socket.on('live-stream-data', (data: ArrayBuffer) => {
      // Assuming data is a JPEG buffer
      const blob = new Blob([data], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      setStreamFrame(url);
      
      // Cleanup previous URL to avoid memory leaks
      return () => URL.revokeObjectURL(url);
    });

    socket.on('recording-status', (status: { active: boolean }) => {
      setIsRecording(status.active);
      refetchParams();
    });

    return () => {
      socketClient.disconnect();
    };
  }, []);

  // Recording timer
  useEffect(() => {
    let interval: number;
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

  const formatTotalDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m ${seconds % 60}s`;
  };

  const handleRecordingToggle = () => {
    if (isRecording) {
      socketRef.current?.emit('stop-recording');
      toast.info('Recording stopped');
    } else {
      socketRef.current?.emit('start-recording', { userId: user?.id });
      toast.info('Recording started');
    }
    setTimeout(() => refetchParams(), 1000);
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
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        {/* Main Video Area */}
        <div className="space-y-4 lg:col-span-2">
          {/* Video Player */}
          <div className="relative bg-black shadow-xl rounded-lg overflow-hidden" id="live-video-container">
            <div className="relative flex justify-center items-center bg-gradient-to-br from-slate-800 to-slate-900 aspect-video">
              {streamFrame ? (
                <img src={streamFrame} alt="Live Stream" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center">
                  <div className="inline-flex justify-center items-center bg-white/10 mb-4 rounded-full w-20 h-20">
                    <Video className="w-10 h-10 text-white/70" />
                  </div>
                  <p className="text-white/70 text-lg">Waiting for camera feed...</p>
                  <p className="mt-2 text-white/50 text-sm">Front Entrance Camera</p>
                </div>
              )}

              {/* Connection Status Badge */}
              <div className="top-4 left-4 z-10 absolute flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg">
                <div className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-[#10B981] animate-pulse' : 'bg-[#EF4444]'}`} />
                <span className="font-medium text-white text-sm">
                  {isLive ? 'LIVE' : 'DISCONNECTED'}
                </span>
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={handleFullscreen}
                className="top-4 right-4 z-10 absolute bg-black/50 hover:bg-black/70 backdrop-blur-sm p-2.5 rounded-lg transition-colors"
              >
                <Maximize2 className="w-5 h-5 text-white" />
              </button>

              {/* Recording Indicator Overlay */}
              {isRecording && (
                <div className="bottom-4 left-4 z-10 absolute flex items-center gap-2 bg-[#EF4444] px-3 py-2 rounded-lg">
                  <Circle className="fill-white w-3 h-3 text-white animate-pulse" />
                  <span className="font-medium text-white text-sm">REC {formatDuration(recordingDuration)}</span>
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
                      <Circle className="fill-white mr-2 w-5 h-5" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 w-5 h-5" />
                      Start Recording
                    </>
                  )}
                </Button>
              </div>

              {isRecording ? (
                <div className="bg-[#EF4444]/10 p-4 border border-[#EF4444]/20 rounded-lg">
                  <div className="flex items-center gap-2 text-[#EF4444]">
                    <Circle className="fill-current w-4 h-4 animate-pulse" />
                    <span className="font-medium">Recording in progress</span>
                  </div>
                  <p className="mt-2 text-muted-foreground text-sm">
                    Started by {user?.name} at {new Date().toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-muted-foreground text-sm">
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
                <p className="text-muted-foreground text-sm">Camera Name</p>
                <p className="font-medium">Front Entrance</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Location</p>
                <p className="font-medium">Main Building - Level 1</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${systemParams?.status === 'Active' ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`} />
                  <span className="font-medium">{systemParams?.status || 'Inactive'}</span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Resolution</p>
                <p className="font-medium">{systemParams?.resolution || '1280x720'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Frame Rate</p>
                <p className="font-medium">30 fps</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-muted-foreground text-sm">Storage Used</p>
                <p className="font-medium">2.4 GB / 50 GB</p>
                <div className="bg-muted mt-2 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#2563EB] h-full" style={{ width: '4.8%' }} />
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Recording Duration</p>
                <p className="font-medium">{formatTotalDuration(systemParams?.totalRecordingsDuration || 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Recordings</p>
                <p className="font-medium">{systemParams?.recordingsCount || 0} clips</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Motion Events</p>
                <p className="font-medium">{systemParams?.motionEventsCount || 0} detected</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
