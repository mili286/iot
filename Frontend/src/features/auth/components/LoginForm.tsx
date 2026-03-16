import React, { useState } from 'react';
import { useLoginMutation } from '../api/authApi';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password }).unwrap();
    } catch (err) {
      console.error('Failed to login', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
};
