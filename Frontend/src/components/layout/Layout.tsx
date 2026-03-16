import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '../ui/sonner';

export const Layout: React.FC = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Header />
        <main className="container mx-auto py-6 px-4">
          <Outlet />
        </main>
        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  );
};
