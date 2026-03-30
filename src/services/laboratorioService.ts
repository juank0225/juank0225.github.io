// src/services/laboratorioService.ts (O donde almacenes tus servicios)
import { authService } from './authService'; // Asumiendo que usas authService

const API_URL = 'http://localhost:3000'; // Asegúrate de que esta URL sea correcta

// 1. Interfaces de Datos
// -----------------------

export interface IndicadorLaboratorio {
  id: number;
  fecha: string; // Tipo date de la entidad se recibe como string ISO en el front
  plazosCumplidos: number;
  satisfaccionCliente: number; // Decimal (se recibirá como number o string)
  capacitacionPersonal: number;
  competenciasPersonal: number;
  mantenimientoEquipos: number;
  confidencialidadImparcialidad: number;
  atencionAprendices: number;
  practicasAprendices: number;
  usuariosExternos: number;
  apoyoEmprendedores: number;
  proyectosMejora: number;
  ventasCostos: number; // Decimal (se recibirá como number o string)
  tipoRegistro: string;
  observaciones?: string;
  // created/updatedAt no son estrictamente necesarios para el dashboard
}

export interface EstadisticasLaboratorio {
  promedioSatisfaccion: number;
  totalPlazosCumplidos: number;
  totalCapacitacion: number;
  totalAprendices: number;
  totalProyectosMejora: number;
  cantidadRegistros: number;
}


// 2. Lista de Indicadores (Clave para el Dashboard)
// --------------------------------------------------

export const ALL_LABORATORIO_INDICATORS: { 
    key: keyof IndicadorLaboratorio; 
    label: string; 
    color: string 
}[] = [
  { key: 'plazosCumplidos', label: "Plazos de Ensayos Cumplidos", color: "#007bff" },
  { key: 'satisfaccionCliente', label: "Satisfacción del Cliente (Promedio)", color: "#28a745" },
  { key: 'capacitacionPersonal', label: "Capacitación de Personal", color: "#ffc107" },
  { key: 'competenciasPersonal', label: "Competencias del Personal", color: "#dc3545" },
  { key: 'mantenimientoEquipos', label: "Mantenimiento de Equipos", color: "#6f42c1" },
  { key: 'confidencialidadImparcialidad', label: "Confidencialidad e Imparcialidad", color: "#17a2b8" },
  { key: 'atencionAprendices', label: "Atención a Aprendices", color: "#e83e8c" },
  { key: 'practicasAprendices', label: "Prácticas de Aprendices", color: "#fd7e14" },
  { key: 'usuariosExternos', label: "Usuarios Externos Atendidos", color: "#20c997" },
  { key: 'apoyoEmprendedores', label: "Apoyo a Emprendedores", color: "#6c757d" },
  { key: 'proyectosMejora', label: "Proyectos de Mejora Implementados", color: "#00bfa5" },
  { key: 'ventasCostos', label: "Ventas / Costos (Ingresos Operacionales)", color: "#99cc00" },
];


// 3. Service del Frontend
// -------------------------

export const laboratorioService = {
  async obtenerIndicadores(periodo: string = 'semana'): Promise<IndicadorLaboratorio[]> {
    const token = authService.getToken();
    
    const response = await fetch(`${API_URL}/indicadores/laboratorio?periodo=${periodo}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener indicadores de Laboratorio');
    }

    // Asegurarse de parsear correctamente los campos Decimal
    const data = await response.json();
    return data.map((item: any) => ({
      ...item,
      satisfaccionCliente: parseFloat(item.satisfaccionCliente),
      ventasCostos: parseFloat(item.ventasCostos),
    })) as IndicadorLaboratorio[];
  },

  async obtenerEstadisticas(periodo: string = 'semana'): Promise<EstadisticasLaboratorio> {
    const token = authService.getToken();
    
    const response = await fetch(`${API_URL}/indicadores/laboratorio/estadisticas?periodo=${periodo}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener estadísticas de Laboratorio');
    }

    const stats = await response.json();
    // Asegurarse de parsear el promedio de satisfacción si viene como string
    return {
      ...stats,
      promedioSatisfaccion: parseFloat(stats.promedioSatisfaccion),
    };
  },
};