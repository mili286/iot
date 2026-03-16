import { User } from '../App';
import { Video, User as UserIcon, LogOut, Monitor, Film, Moon, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  currentPage: 'live-stream' | 'recordings';
  onNavigateToLiveStream: () => void;
  onNavigateToRecordings: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({
  user,
  onLogout,
  currentPage,
  onNavigateToLiveStream,
  onNavigateToRecordings,
  isDarkMode,
  onToggleDarkMode,
}: HeaderProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-[#2563EB] rounded-lg">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">SecureWatch</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Button
              variant={currentPage === 'live-stream' ? 'default' : 'ghost'}
              onClick={onNavigateToLiveStream}
              className={currentPage === 'live-stream' ? 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white' : ''}
            >
              <Monitor className="w-4 h-4 mr-2" />
              Live Stream
            </Button>
            <Button
              variant={currentPage === 'recordings' ? 'default' : 'ghost'}
              onClick={onNavigateToRecordings}
              className={currentPage === 'recordings' ? 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white' : ''}
            >
              <Film className="w-4 h-4 mr-2" />
              Recordings
            </Button>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDarkMode}
              className="rounded-full"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-accent px-3 py-2 rounded-lg transition-colors">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 bg-[#2563EB] rounded-full">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="md:hidden" onClick={onNavigateToLiveStream}>
                  <Monitor className="w-4 h-4 mr-2" />
                  Live Stream
                </DropdownMenuItem>
                <DropdownMenuItem className="md:hidden" onClick={onNavigateToRecordings}>
                  <Film className="w-4 h-4 mr-2" />
                  Recordings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="md:hidden" />
                <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
