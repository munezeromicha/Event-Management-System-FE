'use client'

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserCircleIcon, 
  LockClosedIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface LoginFormProps {
  onSubmit: (data: { username: string; password: string; rememberMe: boolean }) => void;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateUsername = (username: string) => {
    return username.length >= 3; // Minimum 3 characters for username
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    const newErrors: { username?: string; password?: string } = {};
    
    // Validate username
    if (!username) {
      newErrors.username = 'Username is required';
    } else if (!validateUsername(username)) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({ username, password, rememberMe });
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={`relative transition-all duration-300 ${focusedField === 'username' ? 'scale-105' : ''}`}>
          <div className="absolute left-3 top-9 text-gray-500">
            <UserCircleIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <Input
            label="Username"
            type="text"
            id="username"
            autoComplete="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) {
                setErrors(prev => ({ ...prev, username: undefined }));
              }
            }}
            onFocus={() => setFocusedField('username')}
            onBlur={() => setFocusedField(null)}
            error={errors.username}
            disabled={isLoading}
            required
            placeholder="Enter your username"
            className="pl-10 text-gray-900 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.username}</p>
          )}
        </div>

        <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-105' : ''}`}>
          <div className="absolute left-3 top-9 text-gray-500">
            <LockClosedIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) {
                setErrors(prev => ({ ...prev, password: undefined }));
              }
            }}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            error={errors.password}
            disabled={isLoading}
            required
            placeholder="Enter your password"
            className="pl-10 pr-10 text-gray-900 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none transform transition-transform duration-200 hover:scale-110"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
            ) : (
              <EyeIcon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group flex w-full justify-center items-center rounded-md bg-blue-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}