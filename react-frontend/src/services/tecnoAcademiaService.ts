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