import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // MOCK USER
  const [user, setUser] = useState<any>({
    id: '123',
    email: 'user@example.com',
  });
  const [profile, setProfile] = useState<any>({
    role: 'admin',
    first_name: 'John',
    last_name: 'Doe',
  });

  const signOut = async () => {
    setUser(null);
    setProfile(null);
  };

  const signIn = async (email: string) => {
    setUser({ id: '123', email });
    setProfile({ role: 'admin', first_name: 'John', last_name: 'Doe' });
  };

  return (
    <AuthContext.Provider value={{ user, profile, signOut, signIn, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
