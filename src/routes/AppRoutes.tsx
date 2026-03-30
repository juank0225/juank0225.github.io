import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'

// Login
import Login from '@/pages/Login'
import Register from '@/pages/Register'

// Pages (lazy loading could be added later)
import TecnoparqueDashboard from '@/pages/Tecnoparque/Dashboard'
import TecnoparqueReportes from '@/pages/Tecnoparque/Reportes'

import TecnoacademiaDashboard from '@/pages/Tecnoacademia/Dashboard'
import TecnoacademiaProyectos from '@/pages/Tecnoacademia/Proyectos'

import LaboratorioDashboard from '@/pages/Laboratorio/Dashboard'

import InvestigacionDashboard from '@/pages/Investigacion/Dashboard'
import InvestigacionPublicaciones from '@/pages/Investigacion/Publicaciones'
import InvestigacionAnalisis from '@/pages/Investigacion/Analisis'

import PerfilUsuario from '@/pages/Perfil/PerfilUsuario'

import MainDashboard from '@/pages/MainDashboard'

export default function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        {/* 🔹 Ruta inicial: login */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔹 Resto de la app con layout */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<MainDashboard />} />

          <Route path="tecnoparque">
            <Route index element={<TecnoparqueDashboard />} />
            <Route path="reportes" element={<TecnoparqueReportes />} />
          </Route>

          <Route path="tecnoacademia">
            <Route index element={<TecnoacademiaDashboard />} />
            <Route path="proyectos" element={<TecnoacademiaProyectos />} />
          </Route>

          <Route path="laboratorio">
            <Route index element={<LaboratorioDashboard />} />
          </Route>

          <Route path="investigacion">
            <Route index element={<InvestigacionDashboard />} />
            <Route path="publicaciones" element={<InvestigacionPublicaciones />} />
            <Route path="analisis" element={<InvestigacionAnalisis />} />
          </Route>

          <Route path="perfil">
            <Route index element={<PerfilUsuario />} />
          </Route>
        </Route>

        {/* 🔹 Página no encontrada */}
        <Route path="*" element={<div className="container">Página no encontrada</div>} />
      </Routes>
    </HashRouter>
  )
}
