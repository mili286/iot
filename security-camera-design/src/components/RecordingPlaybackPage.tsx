import { useState, useRef } from 'react';
import { User, Recording } from '../App';
import { Header } from './Header';
import { mockRecordings } from './mockData';
import { ImageWithFallback } from './figma/ImageWithFallback';
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
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  MousePointer,
  Activity,
  Clock,
  HardDrive,
  FileVideo,
  Monitor,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';

interface RecordingPlaybackPageProps {
  recordingId: string;
  user: User;
  onLogout: () => void;
  onBack: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function RecordingPlaybackPage({
  recordingId,
  user,
  onLogout,
  onBack,
  isDarkMode,
  onToggleDarkMode,
}: RecordingPlaybackPageProps) {
  const recording = mockRecordings.find((r) => r.id === recordingId);
  const currentIndex = mockRecordings.findIndex((r) => r.id === recordingId);
  const prevRecording = currentIndex > 0 ? mockRecordings[currentIndex - 1] : null;
  const nextRecording = currentIndex < mockRecordings.length - 1 ? mockRecordings[currentIndex + 1] : null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const videoRef = useRef<HTMLDivElement>(null);

  if (!recording) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Recording not found</p>
      </div>
    );
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string, timeStr: string): string => {
    const date = new Date(dateStr + ' ' + timeStr);
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

  const formatFileSize = (mb: number): string => {
    if (mb >= 1000) {
      return `${(mb / 1000).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const getTriggerBadgeColor = (trigger: string): string => {
    switch (trigger) {
      case 'User':
        return 'bg-[#2563EB] text-white hover:bg-[#2563EB]';
      case 'Button':
        return 'bg-[#F59E0B] text-white hover:bg-[#F59E0B]';
      case 'Motion':
        return 'bg-[#10B981] text-white hover:bg-[#10B981]';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'User':
        return <UserIcon className="w-4 h-4" />;
      case 'Button':
        return <MousePointer className="w-4 h-4" />;
      case 'Motion':
        return <Activity className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this recording?')) {
      alert('Recording deleted (mock)');
      onBack();
    }
  };

  const handleDownload = () => {
    alert(`Downloading recording ${recordingId} (mock)`);
  };

  const handleShare = () => {
    alert('Share functionality (mock)');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onLogout={onLogout}
        currentPage="recordings"
        onNavigateToLiveStream={() => {}}
        onNavigateToRecordings={onBack}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
      />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Recordings
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player */}
            <div className="relative bg-black rounded-lg overflow-hidden shadow-xl" ref={videoRef}>
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative">
                <ImageWithFallback
                  src={`https://source.unsplash.com/1920x1080/?${recording.thumbnail}`}
                  alt={`Recording ${recording.id}`}
                  className="w-full h-full object-cover"
                />

                {/* Play/Pause Overlay */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <button
                    onClick={handlePlayPause}
                    className="bg-white/90 hover:bg-white rounded-full p-5 transition-all transform hover:scale-110"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-[#2563EB]" />
                    ) : (
                      <Play className="w-8 h-8 text-[#2563EB] fill-[#2563EB] ml-1" />
                    )}
                  </button>
                </div>

                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <Slider
                      value={[currentTime]}
                      max={recording.duration}
                      step={1}
                      onValueChange={(value) => setCurrentTime(value[0])}
                      className="cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-white mt-1">
                      <span>{formatDuration(currentTime)}</span>
                      <span>{formatDuration(recording.duration)}</span>
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
                        className="bg-white/10 text-white text-sm px-2 py-1 rounded border border-white/20 hover:bg-white/20 transition-colors"
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

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => prevRecording && window.location.reload()}
                disabled={!prevRecording}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => nextRecording && window.location.reload()}
                disabled={!nextRecording}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
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
                        <p className="text-sm text-muted-foreground">Date & Time</p>
                        <p className="text-sm font-medium">{formatDate(recording.date, recording.time)}</p>
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
                        <Badge className={`${getTriggerBadgeColor(recording.triggerType)} mt-1`}>
                          {recording.triggerType}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <UserIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Started By</p>
                        <p className="text-sm font-medium">{recording.startedBy}</p>
                      </div>
                    </div>
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
                        <p className="text-sm font-medium">{formatFileSize(recording.fileSize)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileVideo className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Format</p>
                        <p className="text-sm font-medium">{recording.format}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Monitor className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Resolution</p>
                        <p className="text-sm font-medium">{recording.resolution}</p>
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
                  onClick={handleShare}
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
    </div>
  );
}
