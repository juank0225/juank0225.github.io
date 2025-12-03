import { authService } from './authService';

const API_URL = 'http://localhost:3000';

export interface IndicadorTecnoAcademia {
  id: number;
  fecha: string;
  numInstituciones: number;
  instArticuladas: number;
  numEstudiantesMatriculados: number;
  aprendicesCertificados: number;
  proyectosInvestigacion: number;
  aprendicesCadenaFormativa: number;
  edts: number;
  proyectosTecnologicosAbp: number;
  estudiantesDestacados: number;
  mentorias: number;
  participacionFerias: number;
  visitasCentrosFormacion: number;
  actividadesInnovacion: number;
  numTalleres: number;
  proyectosIntegrados: number;
  tipoRegistro: string;
  observaciones?: string;
}

export interface EstadisticasTecnoAcademia {
  totalInstituciones: number;
  totalEstudiantes: number;
  totalCertificados: number;
  totalProyectosInvestigacion: number;
  totalTalleres: number;
  cantidadRegistros: number;
}

export const ALL_INDICATORS: { key: keyof IndicadorTecnoAcademia; label: string; color: string }[] = [
  { key: 'numInstituciones', label: "Número de Instituciones Educativas", color: "#39a900" },
  { key: 'instArticuladas', label: "Instituciones Articuladas", color: "#5bc41a" },
  { key: 'numEstudiantesMatriculados', label: "Estudiantes Matriculados", color: "#7ed957" },
  { key: 'aprendicesCertificados', label: "Aprendices Certificados", color: "#9c30f0" },
  { key: 'proyectosInvestigacion', label: "Proyectos de Investigación", color: "#c10000" },
  { key: 'aprendicesCadenaFormativa', label: "Aprendices Cadena Formativa", color: "#e36c09" },
  { key: 'edts', label: "EDTS", color: "#e3b309" },
  { key: 'proyectosTecnologicosAbp', label: "Proyectos Tecnológicos ABP", color: "#39a900" },
  { key: 'estudiantesDestacados', label: "Estudiantes Destacados", color: "#5bc41a" },
  { key: 'mentorias', label: "Mentorías", color: "#7ed957" },
  { key: 'participacionFerias', label: "Participación en Ferias", color: "#9c30f0" },
  { key: 'visitasCentrosFormacion', label: "Visitas a Centros de Formación", color: "#c10000" },
  { key: 'actividadesInnovacion', label: "Actividades de Innovación", color: "#e36c09" },
  { key: 'numTalleres', label: "Número de Talleres", color: "#e3b309" },
  { key: 'proyectosIntegrados', label: "Proyectos Integrados", color: "#39a900" },
];

export const tecnoAcademiaService = {
  async obtenerIndicadores(periodo: string = 'semana'): Promise<IndicadorTecnoAcademia[]> {
    const token = authService.getToken();
    
    const response = await fetch(`${API_URL}/indicadores/tecnoacademia?periodo=${periodo}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener indicadores de TecnoAcademia');
    }

    return response.json();
  },

  async obtenerEstadisticas(periodo: string = 'semana'): Promise<EstadisticasTecnoAcademia> {
    const token = authService.getToken();
    
    const response = await fetch(`${API_URL}/indicadores/tecnoacademia/estadisticas?periodo=${periodo}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener estadísticas de TecnoAcademia');
    }

    return response.json();
  },
};