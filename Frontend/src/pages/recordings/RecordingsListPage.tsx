import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetRecordingsQuery, useDeleteRecordingMutation } from '../../features/recordings/api/recordingsApi';
import { Play, Download, Trash2, Search, Filter, Clock, User as UserIcon, MousePointer, Activity, Video, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';
import { Input } from '../../components/ui/Input';

export function RecordingsListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 12; // Use a multiple of 4 for grid layout
  const { data: recordings = [], currentData, isLoading, isFetching, isError } = useGetRecordingsQuery({ page, limit });
  const [deleteRecording] = useDeleteRecordingMutation();
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isFetching || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isFetching, hasMore]
  );

  // Update hasMore based on the last response
  useEffect(() => {
    if (currentData && currentData.length < limit) {
      setHasMore(false);
    }
  }, [currentData, limit]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrigger, setFilterTrigger] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [dateRange, setDateRange] = useState<string>('all');

  // Filter and sort recordings
  const filteredRecordings = useMemo(() => {
    let filtered = [...recordings];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          (r.filename && r.filename.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (r.triggerType && r.triggerType.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply trigger filter
    if (filterTrigger !== 'all') {
      filtered = filtered.filter((r) => r.triggerType === filterTrigger);
    }

    // Apply date range filter
    if (dateRange !== 'all') {
      const today = new Date();
      filtered = filtered.filter((r) => {
        const rDate = new Date(r.createdAt);
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
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'duration') {
        return b.duration - a.duration;
      }
      return 0;
    });

    return filtered;
  }, [recordings, searchQuery, filterTrigger, sortBy, dateRange]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
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

  const getTriggerBadgeColor = (trigger?: string): string => {
    if (!trigger) return 'bg-muted text-muted-foreground';
    
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

  const getTriggerIcon = (trigger?: string) => {
    if (!trigger) return null;
    
    switch (trigger.toLowerCase()) {
      case 'user':
        return <UserIcon className="w-3 h-3" />;
      case 'button':
        return <MousePointer className="w-3 h-3" />;
      case 'motion':
        return <Activity className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const handleDelete = async (recordingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this recording?')) {
      try {
        await deleteRecording(recordingId).unwrap();
        toast.success('Recording deleted');
      } catch (err: any) {
        toast.error('Failed to delete recording');
      }
    }
  };

  const handleDownload = (recording: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/recordings/${recording.id}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', recording.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div className="py-20 text-center">Loading recordings...</div>;
  if (isError) return <div className="py-20 text-destructive text-center">Error loading recordings</div>;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="mb-2 font-bold text-foreground text-2xl">Recordings</h1>
        <p className="text-muted-foreground">
          View and manage your security camera recordings
        </p>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
                <Input
                  placeholder="Search by filename or trigger type..."
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
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="button">Button</SelectItem>
                <SelectItem value="motion">Motion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-border border-t">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
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
        <div className="space-y-8">
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRecordings.map((recording, index) => (
              <Card
                key={recording.id}
                ref={index === filteredRecordings.length - 1 ? lastElementRef : null}
                className="group hover:shadow-lg overflow-hidden transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/recordings/${recording.id}`)}
              >
              {/* Thumbnail */}
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 aspect-video overflow-hidden">
                <div className="flex justify-center items-center bg-slate-800 w-full h-full">
                  <Video className="w-12 h-12 text-slate-600" />
                </div>
                
                {/* Play Overlay */}
                <div className="absolute inset-0 flex justify-center items-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 p-3 rounded-full">
                    <Play className="fill-[#2563EB] w-6 h-6 text-[#2563EB]" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="right-2 bottom-2 absolute bg-black/70 backdrop-blur-sm px-2 py-1 rounded font-medium text-white text-xs">
                  {formatDuration(recording.duration)}
                </div>

                {/* Trigger Badge */}
                <div className="top-2 left-2 absolute">
                  <Badge className={`${getTriggerBadgeColor(recording.triggerType)} flex items-center gap-1 border-0`}>
                    {getTriggerIcon(recording.triggerType)}
                    {recording.triggerType}
                  </Badge>
                </div>
              </div>

              {/* Recording Info */}
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {formatDate(recording.recordingDate || recording.createdAt)}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(recording.recordingDate || recording.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <span className="font-medium">Synced:</span>
                      <span>{formatDate(recording.syncDate)} {new Date(recording.syncDate).toLocaleTimeString()}</span>
                    </div>
                    {recording.triggerType === 'user' && recording.userName && (
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <UserIcon className="w-3 h-3" />
                        <span>By: {recording.userName}</span>
                      </div>
                    )}
                    <p className="text-muted-foreground text-xs truncate">{recording.filename}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/recordings/${recording.id}`);
                      }}
                    >
                      <Play className="mr-1.5 w-3.5 h-3.5" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={(e) => handleDownload(recording, e)}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-destructive/10 h-8 text-destructive hover:text-destructive"
                      onClick={(e) => handleDelete(recording.id, e)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Loading Indicator */}
        {isFetching && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
          </div>
        )}

        {!hasMore && filteredRecordings.length > 0 && (
          <p className="py-8 text-muted-foreground text-center">
            No more recordings to load.
          </p>
        )}
      </div>
      ) : (
        <Card className="py-16">
          <CardContent className="text-center">
            <div className="inline-flex justify-center items-center bg-muted mb-4 rounded-full w-16 h-16">
              <Video className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-semibold text-foreground text-lg">No recordings found</h3>
            <p className="mb-6 text-muted-foreground">
              Try adjusting your filters or search query
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setFilterTrigger('all');
                setDateRange('all');
                setPage(1);
                setHasMore(true);
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
