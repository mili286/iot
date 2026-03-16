import { useState } from 'react';
import { Eye, EyeOff, Video, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';

interface RegisterPageProps {
  onRegister: (name: string, email: string, password: string) => void;
  onNavigateToLogin: () => void;
}

export function RegisterPage({ onRegister, onNavigateToLogin }: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
    if (!pwd) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return { strength: 25, label: 'Weak', color: '#EF4444' };
    if (strength === 3) return { strength: 50, label: 'Fair', color: '#F59E0B' };
    if (strength === 4) return { strength: 75, label: 'Good', color: '#3B82F6' };
    return { strength: 100, label: 'Strong', color: '#10B981' };
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && password && passwordsMatch && agreeToTerms) {
      onRegister(name, email, password);
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
          <p className="text-muted-foreground mt-2">Create your account</p>
        </div>

        {/* Register Form */}
        <div className="bg-card rounded-xl shadow-xl border border-border p-8">
          <h2 className="text-card-foreground mb-6">Sign Up</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11"
              />
            </div>

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
                  placeholder="Create a password"
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
              {password && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Password strength:</span>
                    <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${passwordStrength.strength}%`,
                        backgroundColor: passwordStrength.color,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {confirmPassword && (
                <div className="flex items-center text-xs gap-1.5 mt-1">
                  {passwordsMatch ? (
                    <>
                      <Check className="w-4 h-4 text-[#10B981]" />
                      <span className="text-[#10B981]">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-[#EF4444]" />
                      <span className="text-[#EF4444]">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                className="mt-1"
              />
              <Label
                htmlFor="terms"
                className="text-sm font-normal leading-relaxed cursor-pointer"
              >
                I agree to the{' '}
                <a href="#" className="text-[#2563EB] hover:underline" onClick={(e) => e.preventDefault()}>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#2563EB] hover:underline" onClick={(e) => e.preventDefault()}>
                  Privacy Policy
                </a>
              </Label>
            </div>

            <Button
              type="submit"
              disabled={!passwordsMatch || !agreeToTerms}
              className="w-full h-11 bg-[#2563EB] hover:bg-[#1d4ed8] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={onNavigateToLogin}
                className="text-[#2563EB] hover:underline font-medium"
              >
                Login
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
