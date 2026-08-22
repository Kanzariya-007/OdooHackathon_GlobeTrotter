import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Error / Loading states
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const tempErrors: typeof errors = {};
    if (!email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Invalid email address format';
    }
    
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const user = await login(email, password);
      onLoginSuccess(user);
      navigate('/dashboard');
    } catch (err: any) {
      setErrors({ form: err.message || 'Login failed. Please check your credentials.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Background gradients for aesthetics */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50/50 pointer-events-none" />
      
      <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-xl p-6 sm:p-8 text-left">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-100 mb-3 flex items-center justify-center">
            <Compass size={28} className="animate-spin-slow" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Welcome to GlobeTrotter</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Plan your next adventure with ease.</p>
        </div>

        {/* Global Error Banner */}
        {errors.form && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span className="font-semibold">{errors.form}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              disabled={isLoading}
              className="pl-9"
            />
            <Mail size={16} className="absolute left-3 bottom-3 text-slate-400" />
          </div>

          <div className="relative">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              disabled={isLoading}
              className="pl-9"
            />
            <Lock size={16} className="absolute left-3 bottom-3 text-slate-400" />
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full mt-2 py-2.5 text-sm font-semibold"
          >
            Sign In
          </Button>
        </form>

        {/* Footer switch */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">
              Create one now
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
