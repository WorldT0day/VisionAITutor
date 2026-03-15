import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        createdAt: new Date().toISOString(),
      });
      
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
          <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">Create account</h2>
          <p className="text-sm text-text-muted">Join VisionTutor to start your AI-powered learning journey</p>
        </div>

        {error && (
          <div className="p-4 bg-accent-danger/10 border border-accent-danger/20 rounded-2xl text-xs font-bold text-accent-danger uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Full name</label>
            <input 
              type="text" 
              required 
              placeholder="Your name"
              className="w-full p-4 bg-bg-elevated border border-border-dim rounded-2xl text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none transition-all placeholder:text-text-muted/30" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </div>
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
              placeholder="Create a password"
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
            {loading ? 'Creating account...' : 'Start Learning'}
          </button>
        </form>

        <p className="text-sm text-center text-text-muted">
          Already have an account? <Link to="/login" className="text-accent-primary font-bold hover:brightness-110 ml-1">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
