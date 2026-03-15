import { useAuth } from '../Auth/AuthProvider';
import { auth } from '../../services/firebase';
import { signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className="h-[56px] w-full bg-bg-surface border-b border-border-dim flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-bold text-text-primary tracking-tight">
          VisionTutor
        </Link>
        <div className="hidden sm:flex items-center gap-6">
          {currentUser && (
            <>
              <Link to="/tutor" className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors">
                Tutor
              </Link>
              <Link to="/dashboard" className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors">
                Dashboard
              </Link>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {currentUser ? (
          <button 
            onClick={handleLogout}
            className="btn-ghost"
          >
            Log out
          </button>
        ) : (
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors">Login</Link>
            <Link to="/signup" className="px-5 py-2 bg-accent-primary rounded-lg text-sm font-bold text-white hover:brightness-110 active:scale-95 transition-all">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
