import { useState } from 'react';
import { Eye, EyeOff, Video } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation } from '../api/authApi';
import { useAppDispatch } from '../../../app/hooks';
import { setCredentials } from '../store/authSlice';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
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
    <div className="flex justify-center items-center bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 px-4 py-8 min-h-screen">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="mb-8 text-center">
          <div className="inline-flex justify-center items-center bg-[#2563EB] shadow-lg mb-4 rounded-xl w-16 h-16">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-bold text-foreground text-2xl">Secure Watch</h1>
          <p className="mt-2 text-muted-foreground">Professional Security Monitoring</p>
        </div>

        {/* Login Form */}
        <div className="bg-card shadow-xl p-8 border border-border rounded-xl">
          <h2 className="mb-6 font-semibold text-card-foreground text-xl">Sign In</h2>
          
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
                  className="pr-10 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="top-1/2 right-3 absolute text-muted-foreground hover:text-foreground transition-colors -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label
                  htmlFor="remember"
                  className="font-normal text-sm cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              <a
                href="#"
                className="text-[#2563EB] text-sm hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#2563EB] hover:bg-[#1d4ed8] w-full h-11 text-white"
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-[#2563EB] hover:underline"
              >
                Register
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-muted-foreground text-xs text-center">
          © 2026 Secure Watch. All rights reserved.
        </p>
      </div>
    </div>
  );
}
