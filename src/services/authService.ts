const API_URL = 'http://localhost:3000';
const FRONTEND_URL =
  (typeof window !== 'undefined' && window.location && window.location.origin)
    ? window.location.origin
    : 'http://localhost:5173';

export interface LoginData {
  correo: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    rol: {
      nombreRol: string;
    };
    linea?: {
      nombreLinea: string;
    };
  };
}

export const authService = {
  async login(loginData: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      throw new Error('Error en login');
    }

    return response.json();
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.replace(`${FRONTEND_URL}/`);
  },

  redirectToApp() {
    window.location.replace(`${FRONTEND_URL}/#/app`);
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};