import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../ui/Button';
import { Layers, LogOut, User } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#2a3347]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-400" />
          <span className="font-semibold gradient-text">RoleWeaver CV</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" className="text-xs">Dashboard</Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-[#8b949e]">
              <User className="w-4 h-4" />
              <span>{user.name}</span>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="text-xs">
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" className="text-xs">Login</Button></Link>
            <Link to="/register"><Button className="text-xs">Get Started</Button></Link>
          </div>
        )}
      </div>
    </nav>
  );
};
