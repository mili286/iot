import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetRecordingByIdQuery, useDeleteRecordingMutation } from '../../features/recordings/api/recordingsApi';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Trash2,
  Share2,
  User as UserIcon,
  MousePointer,
  Activity,
  Clock,
  HardDrive,
  FileVideo,
  Monitor,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Slider } from '../../components/ui/slider';
import { toast } from 'sonner';

export function RecordingPlaybackPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: recording, isLoading, isError } = useGetRecordingByIdQuery(id!);
  const [deleteRecording] = useDeleteRecordingMutation();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
      videoRef.current.muted = isMuted;
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [volume, isMuted, playbackSpeed]);

  if (isLoading) return <div className="text-center py-20">Loading recording...</div>;
  if (isError || !recording) return <div className="text-center py-20 text-destructive">Recording not found</div>;

  const videoUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/recordings/${recording.id}`;

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const getTriggerBadgeColor = (trigger: string): string => {
    switch (trigger.toLowerCase()) {
      case 'user':
        return 'bg-[#2563EB] text-white hover:bg-[#2563EB]';
      case 'button':
        return 'bg-[#F59E0B] text-white hover:bg-[#F59E0B]';
      case 'motion':
        return 'bg-[#10B981] text-white hover:bg-[#10B981]';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger.toLowerCase()) {
      case 'user':
        return <UserIcon className="w-4 h-4" />;
      case 'button':
        return <MousePointer className="w-4 h-4" />;
      case 'motion':
        return <Activity className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this recording?')) {
      try {
        await deleteRecording(recording.id).unwrap();
        toast.success('Recording deleted');
        navigate('/recordings');
      } catch (err: any) {
        toast.error('Failed to delete recording');
      }
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `${videoUrl}?download=true`;
    link.setAttribute('download', recording.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/recordings')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Recordings
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Player */}
          <div className="relative bg-black rounded-lg overflow-hidden shadow-xl group" ref={containerRef}>
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full aspect-video"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={handlePlayPause}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Play/Pause Overlay (only shows when paused) */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 rounded-full p-5 transition-all transform scale-110">
                  <Play className="w-8 h-8 text-[#2563EB] fill-[#2563EB] ml-1" />
                </div>
              </div>
            )}

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Progress Bar */}
              <div className="mb-3">
                <Slider
                  value={[currentTime]}
                  max={duration || recording.duration}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-white mt-1">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(duration || recording.duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePlayPause}
                    className="text-white hover:text-[#2563EB] transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:text-[#2563EB] transition-colors"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={100}
                      step={1}
                      onValueChange={(value) => {
                        setVolume(value[0]);
                        if (value[0] > 0) setIsMuted(false);
                      }}
                      className="w-20"
                    />
                  </div>

                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="bg-black/50 text-white text-sm px-2 py-1 rounded border border-white/20 hover:bg-white/20 transition-colors outline-none"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>

                <button
                  onClick={handleFullscreen}
                  className="text-white hover:text-[#2563EB] transition-colors"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Panel */}
        <div className="space-y-4">
          {/* Recording Details */}
          <Card>
            <CardHeader>
              <CardTitle>Recording Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* General Info */}
              <div>
                <h4 className="font-medium mb-3">General Information</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Recording Date & Time</p>
                      <p className="text-sm font-medium">{formatDate(recording.recordingDate || recording.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Sync Date & Time</p>
                      <p className="text-sm font-medium">{formatDate(recording.syncDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="text-sm font-medium">{formatDuration(recording.duration)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trigger Info */}
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-3">Trigger Information</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getTriggerIcon(recording.triggerType)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Trigger Type</p>
                      <Badge className={`${getTriggerBadgeColor(recording.triggerType)} mt-1 border-0`}>
                        {recording.triggerType}
                      </Badge>
                    </div>
                  </div>
                  {recording.triggerType === 'user' && recording.userName && (
                    <div className="flex items-start gap-3">
                      <UserIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Started By</p>
                        <p className="text-sm font-medium">{recording.userName}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* File Info */}
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-3">File Information</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <HardDrive className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">File Size</p>
                      <p className="text-sm font-medium">{formatFileSize(recording.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileVideo className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Filename</p>
                      <p className="text-sm font-medium truncate max-w-[180px]" title={recording.filename}>
                        {recording.filename}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={handleDownload}
                className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied to clipboard');
                }}
                variant="outline"
                className="w-full"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
