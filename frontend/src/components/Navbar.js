import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { User, LogOut, Wallet } from 'lucide-react';

const Navbar = () => {
  const { user, logout, connectWallet, walletAddress } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <nav className="navbar" data-testid="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigate('/')} data-testid="navbar-logo">
          3AM
        </div>
        
        <div className="navbar-menu">
          <a href="/explore" className="navbar-link" data-testid="nav-explore">Explore</a>
          
          {user ? (
            <>
              <a href="/profile" className="navbar-link" data-testid="nav-profile">
                <User size={18} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                My Profile
              </a>
              {!walletAddress && (
                <button className="btn-wallet" onClick={connectWallet} data-testid="nav-connect-wallet">
                  <Wallet size={18} /> Connect Wallet
                </button>
              )}
              {walletAddress && (
                <span style={{ 
                  background: 'rgba(67, 233, 123, 0.2)', 
                  padding: '8px 16px', 
                  borderRadius: '8px',
                  fontSize: '14px',
                  border: '1px solid rgba(67, 233, 123, 0.3)'
                }} data-testid="nav-wallet-address">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
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
