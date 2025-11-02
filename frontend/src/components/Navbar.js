import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { User, LogOut, Wallet, Home, Compass } from 'lucide-react';

const Navbar = () => {
  const { user, logout, connectWallet, walletAddress } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" data-testid="navbar">
      <div className="navbar-container">
        <div 
          className="navbar-logo" 
          onClick={() => navigate(user ? '/home' : '/')} 
          data-testid="navbar-logo"
          style={{ cursor: 'pointer' }}
        >
          3AM
        </div>
        
        <div className="navbar-menu">
          {user && (
            <>
              <button
                onClick={() => navigate('/home')}
                className="navbar-link"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: isActive('/home') ? '#5a67d8' : '#4a5568',
                  fontWeight: isActive('/home') ? '600' : '500'
                }}
                data-testid="nav-home"
              >
                <Home size={18} />
                Home
              </button>
            </>
          )}
          
          <button
            onClick={() => navigate('/explore')}
            className="navbar-link"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: isActive('/explore') ? '#5a67d8' : '#4a5568',
              fontWeight: isActive('/explore') ? '600' : '500'
            }}
            data-testid="nav-explore"
          >
            <Compass size={18} />
            Explore
          </button>
          
          {user ? (
            <>
              <button
                onClick={() => navigate('/profile')}
                className="navbar-link"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: isActive('/profile') ? '#5a67d8' : '#4a5568',
                  fontWeight: isActive('/profile') ? '600' : '500'
                }}
                data-testid="nav-profile"
              >
                <User size={18} />
                My Profile
              </button>
              
              {!walletAddress ? (
                <button className="btn-wallet" onClick={connectWallet} data-testid="nav-connect-wallet">
                  <Wallet size={18} /> Connect Wallet
                </button>
              ) : (
                <div className="welcome-badge" data-testid="nav-welcome-badge">
                  <Wallet size={16} />
                  Welcome, {user?.display_name || 'Creator'}
                </div>
              )}
              
              <button 
                className="btn-secondary" 
                onClick={logout}
                style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                data-testid="nav-logout"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => navigate('/')} data-testid="nav-signin">
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
