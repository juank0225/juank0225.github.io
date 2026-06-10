import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

interface ProtectedNodeRouteProps {
    children: ReactNode
    allowedRoles: string[]
    requiredNode?: string
}

export default function ProtectedNodeRoute({
    children,
    allowedRoles,
    requiredNode,
}: ProtectedNodeRouteProps) {
    const token = localStorage.getItem('token')
    const userRaw = localStorage.getItem('user')

    if (!token || !userRaw) {
        return <Navigate to="/" replace />
    }

    const user = JSON.parse(userRaw)
    const rol = user?.rol?.nombreRol
    const nodo = user?.linea?.nodo?.nombreNodo ?? null

    if (!allowedRoles.includes(rol)) {
        return <Navigate to="/" replace />
    }

    if (requiredNode && rol !== 'administrador' && nodo !== requiredNode) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}