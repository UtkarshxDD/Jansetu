// src/layouts/MainLayout.tsx
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default MainLayout;