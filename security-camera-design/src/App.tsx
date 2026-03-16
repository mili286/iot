import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { LiveStreamPage } from './components/LiveStreamPage';
import { RecordingsListPage } from './components/RecordingsListPage';
import { RecordingPlaybackPage } from './components/RecordingPlaybackPage';

export type Page = 'login' | 'register' | 'live-stream' | 'recordings' | 'playback';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Recording {
  id: string;
  thumbnail: string;
  date: string;
  time: string;
  duration: number; // in seconds
  triggerType: 'User' | 'Button' | 'Motion';
  startedBy: string;
  fileSize: number; // in MB
  format: string;
  resolution: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = (email: string, password: string, rememberMe: boolean) => {
    // Mock login
    const user: User = {
      id: '1',
      name: 'John Smith',
      email: email,
    };
    setCurrentUser(user);
    setCurrentPage('live-stream');
  };

  const handleRegister = (name: string, email: string, password: string) => {
    // Mock registration
    const user: User = {
      id: '1',
      name: name,
      email: email,
    };
    setCurrentUser(user);
    setCurrentPage('live-stream');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
  };

  const viewRecording = (recordingId: string) => {
    setSelectedRecordingId(recordingId);
    setCurrentPage('playback');
  };

  return (
    <div className="min-h-screen bg-background">
      {currentPage === 'login' && (
        <LoginPage
          onLogin={handleLogin}
          onNavigateToRegister={() => setCurrentPage('register')}
        />
      )}
      
      {currentPage === 'register' && (
        <RegisterPage
          onRegister={handleRegister}
          onNavigateToLogin={() => setCurrentPage('login')}
        />
      )}
      
      {currentPage === 'live-stream' && currentUser && (
        <LiveStreamPage
          user={currentUser}
          onLogout={handleLogout}
          onNavigateToRecordings={() => navigateToPage('recordings')}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
      )}
      
      {currentPage === 'recordings' && currentUser && (
        <RecordingsListPage
          user={currentUser}
          onLogout={handleLogout}
          onNavigateToLiveStream={() => navigateToPage('live-stream')}
          onViewRecording={viewRecording}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
      )}
      
      {currentPage === 'playback' && currentUser && selectedRecordingId && (
        <RecordingPlaybackPage
          recordingId={selectedRecordingId}
          user={currentUser}
          onLogout={handleLogout}
          onBack={() => navigateToPage('recordings')}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
      )}
    </div>
  );
}
