import React, { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import CreatorPage from './pages/CreatorPage';
import ExplorePage from './pages/ExplorePage';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthContext = React.createContext(null);

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    }
  }, [token]);

  useEffect(() => {
    initializeWallet();
  }, []);

  const initializeWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);
        
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const web3Signer = await web3Provider.getSigner();
          setSigner(web3Signer);
          setWalletAddress(accounts[0]);
        }

        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          } else {
            setWalletAddress(null);
            setSigner(null);
          }
        });
      } catch (error) {
        console.error('Wallet initialization error:', error);
      }
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const connectWallet = async () => {
    try {
      if (!provider) {
        toast.error('Please install MetaMask or another Web3 wallet');
        return;
      }

      const web3Signer = await provider.getSigner();
      const address = await web3Signer.getAddress();
      setSigner(web3Signer);
      setWalletAddress(address);

      // Sign message for authentication
      const message = `Sign in to 3AM\nAddress: ${address}\nTimestamp: ${Date.now()}`;
      const signature = await web3Signer.signMessage(message);

      const response = await axios.post(`${API}/auth/wallet`, {
        wallet_address: address,
        signature,
        message
      });

      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      toast.success('Signed in successfully!');
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const login = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const authValue = {
    user,
    token,
    provider,
    signer,
    walletAddress,
    connectWallet,
    login,
    logout,
    API
  };

  return (
    <AuthContext.Provider value={authValue}>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/" />} />
            <Route path="/:username" element={<CreatorPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </div>
    </AuthContext.Provider>
  );
}

export default App;
