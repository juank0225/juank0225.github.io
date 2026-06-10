import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'

// Login
import Login from '@/pages/Login'
import Register from '@/pages/Register'

// Pages
import TecnoparqueDashboard from '@/pages/Tecnoparque/Dashboard'
import TecnoparqueReportes from '@/pages/Tecnoparque/Reportes'
import RegistrarIndicador from '@/pages/Tecnoparque/RegistrarIndicador'

import TecnoacademiaDashboard from '@/pages/Tecnoacademia/Dashboard'
import TecnoacademiaProyectos from '@/pages/Tecnoacademia/Proyectos'

import LaboratorioDashboard from '@/pages/Laboratorio/Dashboard'

import InvestigacionDashboard from '@/pages/Investigacion/Dashboard'
import InvestigacionPublicaciones from '@/pages/Investigacion/Publicaciones'
import InvestigacionAnalisis from '@/pages/Investigacion/Analisis'

import PerfilUsuario from '@/pages/Perfil/PerfilUsuario'
import MainDashboard from '@/pages/MainDashboard'

import ProtectedRoute from './ProtectedRoute'
import ProtectedNodeRoute from './ProtectedNodeRoute'

export default function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <ProtectedNodeRoute allowedRoles={['administrador']}>
                <MainDashboard />
              </ProtectedNodeRoute>
            }
          />

          <Route
            path="tecnoparque"
            element={
              <ProtectedNodeRoute
                allowedRoles={['administrador', 'experto']}
                requiredNode="Tecnoparque"
              >
                <TecnoparqueDashboard />
              </ProtectedNodeRoute>
            }
          />

          <Route
            path="tecnoparque/reportes"
            element={
              <ProtectedNodeRoute
                allowedRoles={['administrador', 'experto']}
                requiredNode="Tecnoparque"
              >
                <TecnoparqueReportes />
              </ProtectedNodeRoute>
            }
          />

          <Route
            path="tecnoparque/registrar-indicador"
            element={
              <ProtectedNodeRoute
                allowedRoles={['administrador', 'experto']}
                requiredNode="Tecnoparque"
              >
                <RegistrarIndicador />
              </ProtectedNodeRoute>
            }
          />

          <Route
            path="tecnoacademia"
            element={
              <ProtectedNodeRoute allowedRoles={['administrador']}>
                <TecnoacademiaDashboard />
              </ProtectedNodeRoute>
            }
          />

          <Route
            path="tecnoacademia/proyectos"
            element={
              <ProtectedNodeRoute allowedRoles={['administrador']}>
                <TecnoacademiaProyectos />
              </ProtectedNodeRoute>
            }
          />

          <Route
            path="laboratorio"
            element={
              <ProtectedNodeRoute allowedRoles={['administrador']}>
                <LaboratorioDashboard />
              </ProtectedNodeRoute>
            }
          />

          <Route
            path="investigacion"
            element={
              <ProtectedNodeRoute allowedRoles={['administrador']}>
                <InvestigacionDashboard />
              </ProtectedNodeRoute>
            }
          />

          <Route
            path="investigacion/publicaciones"
            element={
              <ProtectedNodeRoute allowedRoles={['administrador']}>
                <InvestigacionPublicaciones />
              </ProtectedNodeRoute>
            }
          />

          <Route
            path="investigacion/analisis"
            element={
              <ProtectedNodeRoute allowedRoles={['administrador']}>
                <InvestigacionAnalisis />
              </ProtectedNodeRoute>
            }
          />

          <Route
            path="perfil"
            element={
              <ProtectedRoute>
                <PerfilUsuario />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<div className="container">Página no encontrada</div>} />
      </Routes>
    </HashRouter>
  )
}