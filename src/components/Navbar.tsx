import { NavLink, Link } from 'react-router-dom'
import { useState } from 'react'
import './components.css'
import IndicaSena from '../assets/IndicaSena.jpg'

const NavItem = ({
  to,
  children,
  onClick
}: {
  to: string
  children: React.ReactNode
  onClick?: () => void
}) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `min-h-[0px] flex items-center px-8 text-lg font-medium text-white ${isActive
        ? 'bg-[#ffffff] text-[#39A900]'
        : 'hover:bg-[#ffffff] hover:text-[#39A900]'
      }`
    }
  >
    {children}
  </NavLink>
)

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  const userRaw = localStorage.getItem('user')
  const user = userRaw ? JSON.parse(userRaw) : null

  const rol = user?.rol?.nombreRol
  const nodo = user?.linea?.nodo?.nombreNodo

  const isAdmin = rol === 'administrador'
  const isTecnoparqueExpert = rol === 'experto' && nodo === 'Tecnoparque'

  return (
    <header
      className="components-navbar bg-[#39A900] w-full min-h-[55px] shadow-lg relative"
      style={{ height: '55px' }}
    >
      <div className="w-full h-full flex items-stretch justify-between">
        <div className="flex items-stretch h-full">
          <Link
            to={isAdmin ? '/app' : '/app/tecnoparque'}
            className="flex items-center gap-4 px-4 lg:px-8 min-h-[55px]"
          >
            <img
              src={IndicaSena}
              alt="SIRT"
              className="logo-sirt"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </Link>

          <nav className="hidden lg:flex items-stretch h-full gap-6">
            {isAdmin && <NavItem to="/app">Panel</NavItem>}

            {(isAdmin || isTecnoparqueExpert) && (
              <NavItem to="/app/tecnoparque">Tecnoparque</NavItem>
            )}

            {isAdmin && <NavItem to="/app/tecnoacademia">Tecnoacademia</NavItem>}
            {isAdmin && <NavItem to="/app/laboratorio">Laboratorio</NavItem>}
            {isAdmin && <NavItem to="/app/investigacion">Investigación</NavItem>}
          </nav>
        </div>

        <div className="hidden lg:flex items-center px-8 desktop-profile-container">
          <Link to="/app/perfil" className="profile-btn">
            Perfil
          </Link>
        </div>

        <button
          onClick={toggleMenu}
          aria-label="Toggle menu"
          className="lg:hidden flex items-center px-6"
          style={{
            background: 'transparent',
            border: 'none',
            padding: '0.5rem 1.5rem',
            cursor: 'pointer'
          }}
        >
          <svg
            style={{
              width: '28px',
              height: '28px',
              stroke: '#ffffff',
              strokeWidth: '2.5px',
              fill: 'none'
            }}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <nav className="mobile-nav lg:hidden">
          {isAdmin && (
            <NavItem to="/app" onClick={closeMenu}>
              Panel
            </NavItem>
          )}

          {(isAdmin || isTecnoparqueExpert) && (
            <NavItem to="/app/tecnoparque" onClick={closeMenu}>
              Tecnoparque
            </NavItem>
          )}

          {isAdmin && (
            <NavItem to="/app/tecnoacademia" onClick={closeMenu}>
              Tecnoacademia
            </NavItem>
          )}

          {isAdmin && (
            <NavItem to="/app/laboratorio" onClick={closeMenu}>
              Laboratorio
            </NavItem>
          )}

          {isAdmin && (
            <NavItem to="/app/investigacion" onClick={closeMenu}>
              Investigación
            </NavItem>
          )}

          <div className="mobile-profile-container">
            <Link
              to="/app/perfil"
              className="profile-btn mobile-profile-btn"
              onClick={closeMenu}
            >
              Perfil
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}