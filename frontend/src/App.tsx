import React, { createContext, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { AppShell, createStyles, Group, Header, MantineProvider, Navbar, NavLink as Nav } from '@mantine/core';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import CredentialsPage from './pages/Credentials.page';
import { AWSCredentials } from './types/credentials.types';
import DashboardPage from './pages/Dashboard.page';
import ManagementPage from './pages/Management.page';
import AppHeader from './components/AppHeader';

export const UserContext = createContext<any>(null);

function App() {
  const { classes } = useStyles();
  const [userCredentials, setUserCredentials] = useState<AWSCredentials | null>();

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS
      theme={{ 
        primaryColor: 'orange'
      }}
    >
      <UserContext.Provider value={{ userCredentials, setUserCredentials }}>
        <BrowserRouter>
          <AppHeader
            links={[
              { link: '/dashboard', label: 'Dashboard' },
              { link: '/manage', label: 'Manage' },
            ]}
          />
          <Routes>
            <Route path="/" element={<CredentialsPage />} />
            <Route path="/manage" element={<ManagementPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </BrowserRouter>
      </UserContext.Provider>
    </MantineProvider>
  );
}

const useStyles = createStyles((theme) => ({
  navButton: {
    padding: '10px',
    color: theme['white'][0],
  },
}));

export default App;
