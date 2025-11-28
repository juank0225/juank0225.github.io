import { authService } from './authService';

const API_URL = 'http://localhost:3000';

export interface IndicadorTecnoParque {
  id: number;
  fecha: string;
  proyectos: number;
  articulaciones: number;
  visitas: number;
  giras: number;
  asesorias: number;
  tipoRegistro: string;
  observaciones?: string;
}

export interface EstadisticasTecnoParque {
  totalProyectos: number;
  totalArticulaciones: number;
  totalVisitas: number;
  totalGiras: number;
  totalAsesorias: number;
  cantidadRegistros: number;
}

export const tecnoParqueService = {
  async obtenerIndicadores(periodo: string = 'semana'): Promise<IndicadorTecnoParque[]> {
    const token = authService.getToken();
    
    const response = await fetch(`${API_URL}/indicadores/tecnoparque?periodo=${periodo}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener indicadores');
    }

    return response.json();
  },

  async obtenerEstadisticas(periodo: string = 'semana'): Promise<EstadisticasTecnoParque> {
    const token = authService.getToken();
    
    const response = await fetch(`${API_URL}/indicadores/tecnoparque/estadisticas?periodo=${periodo}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener estadísticas');
    }

    return response.json();
  },
};