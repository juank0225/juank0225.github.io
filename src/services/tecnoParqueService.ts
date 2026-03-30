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

const obtenerHeaders = () => {
  const token = authService.getToken();

  if (!token) {
    throw new Error('No se encontró token de autenticación.');
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

const manejarRespuesta = async (response: Response) => {
  if (!response.ok) {
    let mensaje = `Error HTTP ${response.status}`;

    try {
      const errorBody = await response.json();
      mensaje = errorBody?.message || mensaje;
    } catch {
      try {
        const errorText = await response.text();
        if (errorText) mensaje = errorText;
      } catch {
        // no hacer nada
      }
    }

    throw new Error(mensaje);
  }

  return response.json();
};

export const tecnoParqueService = {
  async obtenerIndicadores(periodo: string = 'semana'): Promise<IndicadorTecnoParque[]> {
    const response = await fetch(
      `${API_URL}/indicadores/tecnoparque?periodo=${encodeURIComponent(periodo)}`,
      {
        method: 'GET',
        headers: obtenerHeaders(),
      }
    );

    return manejarRespuesta(response);
  },

  async obtenerEstadisticas(periodo: string = 'semana'): Promise<EstadisticasTecnoParque> {
    const response = await fetch(
      `${API_URL}/indicadores/tecnoparque/estadisticas?periodo=${encodeURIComponent(periodo)}`,
      {
        method: 'GET',
        headers: obtenerHeaders(),
      }
    );

    return manejarRespuesta(response);
  },
};