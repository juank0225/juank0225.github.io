import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import './components.css' // <-- importar estilos compartidos

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mt-[0px]">
        <div className="container py-4 px-8">
          {children ?? <Outlet />}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Layout