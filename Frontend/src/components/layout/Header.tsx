import { Video, User as UserIcon, LogOut, Monitor, Film, Moon, Sun } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/store/authSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/Button';

export function Header() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const currentPage = location.pathname.includes('recordings') ? 'recordings' : 'live-stream';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="top-0 z-50 sticky bg-card shadow-sm border-border border-b">
      <div className="mx-auto px-4 container">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex justify-center items-center bg-[#2563EB] rounded-lg w-10 h-10">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground text-lg">Secure Watch</h1>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Button
              variant={currentPage === 'live-stream' ? 'default' : 'ghost'}
              asChild
              className={currentPage === 'live-stream' ? 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white' : ''}
            >
              <Link to="/live-stream">
                <Monitor className="mr-2 w-4 h-4" />
                Live Stream
              </Link>
            </Button>
            <Button
              variant={currentPage === 'recordings' ? 'default' : 'ghost'}
              asChild
              className={currentPage === 'recordings' ? 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white' : ''}
            >
              <Link to="/recordings">
                <Film className="mr-2 w-4 h-4" />
                Recordings
              </Link>
            </Button>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-accent px-3 py-2 rounded-lg outline-none transition-colors">
                  <div className="hidden sm:block text-right">
                    <p className="font-medium text-foreground text-sm">{user.name}</p>
                  </div>
                  <div className="flex justify-center items-center bg-[#2563EB] rounded-full w-10 h-10">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="md:hidden" asChild>
                  <Link to="/live-stream">
                    <Monitor className="mr-2 w-4 h-4" />
                    Live Stream
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="md:hidden" asChild>
                  <Link to="/recordings">
                    <Film className="mr-2 w-4 h-4" />
                    Recordings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="md:hidden" />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 w-4 h-4" />
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
