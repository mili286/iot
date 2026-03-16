import { useState, useMemo } from 'react';
import { User, Recording } from '../App';
import { Header } from './Header';
import { mockRecordings } from './mockData';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Play, Download, Trash2, Search, Filter, Clock, User as UserIcon, MousePointer, Activity, Video } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface RecordingsListPageProps {
  user: User;
  onLogout: () => void;
  onNavigateToLiveStream: () => void;
  onViewRecording: (recordingId: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function RecordingsListPage({
  user,
  onLogout,
  onNavigateToLiveStream,
  onViewRecording,
  isDarkMode,
  onToggleDarkMode,
}: RecordingsListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrigger, setFilterTrigger] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [dateRange, setDateRange] = useState<string>('all');

  // Filter and sort recordings
  const filteredRecordings = useMemo(() => {
    let filtered = [...mockRecordings];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.startedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.triggerType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply trigger filter
    if (filterTrigger !== 'all') {
      filtered = filtered.filter((r) => r.triggerType === filterTrigger);
    }

    // Apply date range filter
    if (dateRange !== 'all') {
      const today = new Date('2026-02-05');
      const recordingDate = (dateStr: string) => new Date(dateStr);
      
      filtered = filtered.filter((r) => {
        const rDate = recordingDate(r.date);
        if (dateRange === 'today') {
          return rDate.toDateString() === today.toDateString();
        } else if (dateRange === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return rDate >= weekAgo;
        } else if (dateRange === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return rDate >= monthAgo;
        }
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime();
      } else if (sortBy === 'duration') {
        return b.duration - a.duration;
      }
      return 0;
    });

    return filtered;
  }, [searchQuery, filterTrigger, sortBy, dateRange]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date('2026-02-05');
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
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
        return <UserIcon className="w-3 h-3" />;
      case 'Button':
        return <MousePointer className="w-3 h-3" />;
      case 'Motion':
        return <Activity className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const handleDelete = (recordingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this recording?')) {
      // In a real app, delete the recording
      alert('Recording deleted (mock)');
    }
  };

  const handleDownload = (recordingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Downloading recording ${recordingId} (mock)`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onLogout={onLogout}
        currentPage="recordings"
        onNavigateToLiveStream={onNavigateToLiveStream}
        onNavigateToRecordings={() => {}}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
      />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-foreground mb-2">Recordings</h1>
          <p className="text-muted-foreground">
            View and manage your security camera recordings
          </p>
        </div>

        {/* Filters Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user or trigger type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Date Range */}
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>

              {/* Trigger Filter */}
              <Select value={filterTrigger} onValueChange={setFilterTrigger}>
                <SelectTrigger>
                  <SelectValue placeholder="Trigger type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Triggers</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Button">Button</SelectItem>
                  <SelectItem value="Motion">Motion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span>{filteredRecordings.length} recording(s) found</span>
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="duration">Longest Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Recordings Grid */}
        {filteredRecordings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRecordings.map((recording) => (
              <Card
                key={recording.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden"
                onClick={() => onViewRecording(recording.id)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                  <ImageWithFallback
                    src={`https://source.unsplash.com/800x450/?${recording.thumbnail}`}
                    alt={`Recording ${recording.id}`}
                    className="w-full h-full object-cover opacity-70"
                  />
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 rounded-full p-3">
                      <Play className="w-6 h-6 text-[#2563EB] fill-[#2563EB]" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-white text-xs font-medium">
                    {formatDuration(recording.duration)}
                  </div>

                  {/* Trigger Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className={`${getTriggerBadgeColor(recording.triggerType)} flex items-center gap-1`}>
                      {getTriggerIcon(recording.triggerType)}
                      {recording.triggerType}
                    </Badge>
                  </div>
                </div>

                {/* Recording Info */}
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {formatDate(recording.date)}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{recording.time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UserIcon className="w-3.5 h-3.5" />
                      <span className="truncate">{recording.startedBy}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewRecording(recording.id);
                        }}
                      >
                        <Play className="w-3.5 h-3.5 mr-1.5" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleDownload(recording.id, e)}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleDelete(recording.id, e)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-16">
            <CardContent className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                <Video className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-foreground mb-2">No recordings found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search query
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setFilterTrigger('all');
                  setDateRange('all');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
