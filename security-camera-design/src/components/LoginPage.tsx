import { useState } from 'react';
import { Eye, EyeOff, Video } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';

interface LoginPageProps {
  onLogin: (email: string, password: string, rememberMe: boolean) => void;
  onNavigateToRegister: () => void;
}

export function LoginPage({ onLogin, onNavigateToRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email, password, rememberMe);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2563EB] rounded-xl mb-4 shadow-lg">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-foreground">SecureWatch</h1>
          <p className="text-muted-foreground mt-2">Professional Security Monitoring</p>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-xl shadow-xl border border-border p-8">
          <h2 className="text-card-foreground mb-6">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              <a
                href="#"
                className="text-sm text-[#2563EB] hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
            >
              Login
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                onClick={onNavigateToRegister}
                className="text-[#2563EB] hover:underline font-medium"
              >
                Register
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 SecureWatch. All rights reserved.
        </p>
      </div>
    </div>
  );
}
