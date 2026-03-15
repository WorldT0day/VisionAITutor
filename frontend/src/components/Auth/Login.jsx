import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/tutor');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-56px)] bg-bg-base px-6">
      <div className="w-full max-w-md card p-10 flex flex-col gap-8 shadow-2xl">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">Welcome back</h2>
          <p className="text-sm text-text-muted">Sign in to continue your learning journey</p>
        </div>

        {error && (
          <div className="p-4 bg-accent-danger/10 border border-accent-danger/20 rounded-2xl text-xs font-bold text-accent-danger uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Email address</label>
            <input 
              type="email" 
              required 
              placeholder="name@example.com"
              className="w-full p-4 bg-bg-elevated border border-border-dim rounded-2xl text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none transition-all placeholder:text-text-muted/30" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Password</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              className="w-full p-4 bg-bg-elevated border border-border-dim rounded-2xl text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none transition-all placeholder:text-text-muted/30" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-4 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-center text-text-muted">
          New to VisionTutor? <Link to="/signup" className="text-accent-primary font-bold hover:brightness-110 ml-1">Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
