import { useState } from 'react';
import { Eye, EyeOff, Video, Check, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegisterMutation } from '../api/authApi';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { toast } from 'sonner';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch || !agreeToTerms) return;

    try {
      await register({ fullName: name, email, password }).unwrap();
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err: any) {
     toast.error(err.data?.message || 'Registration failed');
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
          <h1 className="font-bold text-foreground text-2xl">SecureWatch</h1>
          <p className="mt-2 text-muted-foreground">Create your account</p>
        </div>

        {/* Register Form */}
        <div className="bg-card shadow-xl p-8 border border-border rounded-xl">
          <h2 className="mb-6 font-semibold text-card-foreground text-xl">Sign Up</h2>
          
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
              {password && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Password strength:</span>
                    <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                  </div>
                  <div className="bg-muted rounded-full h-2 overflow-hidden">
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
                  className="pr-10 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="top-1/2 right-3 absolute text-muted-foreground hover:text-foreground transition-colors -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {confirmPassword && (
                <div className="flex items-center gap-1.5 mt-1 text-xs">
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
                className="font-normal text-sm leading-relaxed cursor-pointer"
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
              disabled={isLoading || !passwordsMatch || !agreeToTerms}
              className="bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-50 w-full h-11 text-white disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-[#2563EB] hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-muted-foreground text-xs text-center">
          © 2026 SecureWatch. All rights reserved.
        </p>
      </div>
    </div>
  );
}
