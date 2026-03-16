import { useState } from 'react';
import { Eye, EyeOff, Video } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation } from '../api/authApi';
import { useAppDispatch } from '../../../app/hooks';
import { setCredentials } from '../store/authSlice';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { toast } from 'sonner';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.authToken }));
      toast.success('Login successful');
      navigate('/live-stream');
    } catch (err: any) {
      toast.error(err.data?.message || 'Login failed');
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
          <h1 className="text-2xl font-bold text-foreground">SecureWatch</h1>
          <p className="text-muted-foreground mt-2">Professional Security Monitoring</p>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-xl shadow-xl border border-border p-8">
          <h2 className="text-xl font-semibold text-card-foreground mb-6">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
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
              disabled={isLoading}
              className="w-full h-11 bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#2563EB] hover:underline font-medium"
              >
                Register
              </Link>
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
