import React, { createContext, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { AppShell, Header, MantineProvider, Navbar } from '@mantine/core';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CredentialsPage from './pages/Credentials.page';
import { AWSCredentials } from './types/credentials.types';

export const UserContext = createContext<any>(null);

function App() {
  const [userCredentials, setUserCredentials] = useState<AWSCredentials | null>();

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <UserContext.Provider value={{ userCredentials, setUserCredentials }}>
        <BrowserRouter>
          <AppShell
            padding="md"
            navbar={<Navbar bg="gray" width={{ base: 300 }} height="100%" p="xs">{/* Navbar content */}</Navbar>}
            header={
              <Header bg="dark" height={60} p="xs">{/* Header content */}</Header>
            }
            styles={(theme) => ({
              main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
            })}
          >
            <Routes>
              <Route path="/" element={<CredentialsPage />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </UserContext.Provider>
    </MantineProvider>
  );
}

export default App;
