import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Lock } from 'lucide-react';
import logo from '@/assets/logo.jpg';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(password)) {
      navigate('/admin');
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-card rounded-xl border border-border p-8 shadow-card w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <img src={logo} alt="" className="w-12 h-12 mx-auto rounded-xl" />
          <h1 className="text-xl font-bold heading-display text-card-foreground">Admin Access</h1>
          <p className="text-sm text-muted-foreground">Enter password to access the dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          {error && <p className="text-xs text-destructive">Invalid password. Try: admin123</p>}
          <button type="submit" className="w-full py-3 gradient-brand text-primary-foreground rounded-lg font-semibold text-sm">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
