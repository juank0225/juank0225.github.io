// investigacion.service.ts
const API_URL = 'http://localhost:3000';

export interface IndicadorInvestigacion {
  id: number;
  fecha: string;
  proyectos: number;
  publicaciones: number;
  prototipos: number;
  colaboraciones: number;
  investigadores: number;
  financiamiento: number;
  patentes: number;
  tipoRegistro: string;
  unidad: string | null;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EstadisticasInvestigacion {
  totalProyectos: number;
  totalPublicaciones: number;
  totalPrototipos: number;
  totalFinanciamiento: number;
  totalPatentes: number;
  cantidadRegistros: number;
}

export const investigacionService = {
  // Cambio clave: obtenerIndicadores en lugar de obtenerDetalles
  async obtenerIndicadores(periodo: string = 'semana'): Promise<IndicadorInvestigacion[]> {
    const response = await fetch(
      `${API_URL}/indicadores/investigacion?periodo=${periodo}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener indicadores: ${response.statusText}`);
    }

    return response.json();
  },

  async obtenerEstadisticas(periodo: string = 'semana'): Promise<EstadisticasInvestigacion> {
    const response = await fetch(
      `${API_URL}/indicadores/investigacion/estadisticas?periodo=${periodo}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener estadísticas: ${response.statusText}`);
    }

    const data = await response.json();
    data.totalFinanciamiento = Number(data.totalFinanciamiento);

    return data;
  },
};