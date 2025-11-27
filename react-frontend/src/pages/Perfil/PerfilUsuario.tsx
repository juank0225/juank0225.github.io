import { useState, useEffect } from "react";
import userDefault from "@/assets/user-default.svg";
import { authService } from "../../services/authService"; // Ajusta la ruta según tu estructura

interface User {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  celular?: string;
  tipoDoc: string;
  numDoc: string;
  estado: string;
  ubicacion?: string;
  rol: {
    nombreRol: string;
  };
  linea?: {
    nombreLinea: string;
  };
}

export default function PerfilUsuario() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  const handleEditProfile = () => {
    // Aquí puedes redirigir a una pantalla de edición o mostrar modal
    console.log("Editar perfil");
  };

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '16px', 
      fontFamily: 'Inter, sans-serif', 
      backgroundColor: '#f9fafb', 
      minHeight: '100vh' 
    }}>
      {/* Título principal */}
      <h1 style={{ 
        fontSize: 'clamp(24px, 5vw, 32px)', 
        fontWeight: '700', 
        marginBottom: '24px',
        color: '#39a900',
        margin: '0 0 24px 0',
        textAlign: 'center'
      }}>
        Tu perfil y Datos Personales
      </h1>

      {/* Contenedor principal */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '24px', 
        alignItems: 'stretch', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        
        {/* Tarjeta de perfil */}
        <div style={{
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          {/* Avatar circular */}
          <div style={{
            width: 'clamp(120px, 30vw, 160px)',
            height: 'clamp(120px, 30vw, 160px)',
            borderRadius: '50%',
            overflow: 'hidden',
            marginBottom: '20px',
            backgroundColor: '#e5e7eb'
          }}>
            <img
              src={userDefault}
              alt={user.nombre}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>

          {/* Información del perfil */}
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: 'clamp(16px, 4vw, 18px)', 
            fontWeight: '600',
            color: '#1f2937',
            textAlign: 'center'
          }}>
            {user.nombre} {user.apellido}
          </h3>
          
          <p style={{ 
            margin: '0 0 8px 0', 
            fontSize: 'clamp(13px, 3vw, 14px)', 
            color: '#6b7280',
            textAlign: 'center',
            wordBreak: 'break-word'
          }}>
            {user.correo}
          </p>
          
          <p style={{ 
            margin: '0 0 8px 0', 
            fontSize: 'clamp(13px, 3vw, 14px)',
            color: '#1f2937',
            textAlign: 'center'
          }}>
            {user.rol.nombreRol}
          </p>
          
          <p style={{ 
            margin: '0 0 24px 0', 
            fontSize: 'clamp(13px, 3vw, 14px)', 
            color: '#6b7280',
            textAlign: 'center'
          }}>
            {user.linea?.nombreLinea || 'Sin línea asignada'}
          </p>

          {/* Botones */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%',
            maxWidth: '280px'
          }}>
            <button 
              onClick={handleEditProfile}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: '8px',
                backgroundColor: '#39a900',
                color: '#ffffff',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Editar perfil
            </button>

            <button 
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: '8px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Datos Personales */}
        <div style={{
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: 'clamp(20px, 5vw, 32px)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ 
            fontSize: 'clamp(18px, 4vw, 20px)', 
            fontWeight: '600', 
            color: '#1f2937',
            margin: '0 0 24px 0'
          }}>
            Datos Personales
          </h2>

          {/* Grid de datos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'clamp(20px, 4vw, 32px)',
          }}>
            {/* Nombre */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ 
                color: '#39a900', 
                fontWeight: '600', 
                fontSize: 'clamp(14px, 3vw, 17px)',
              }}>
                Nombre:
              </span>
              <span style={{ 
                color: '#1f2937', 
                fontSize: 'clamp(14px, 3vw, 17px)',
                wordBreak: 'break-word'
              }}>
                {user.nombre}
              </span>
            </div>

            {/* Correo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ 
                color: '#39a900', 
                fontWeight: '600', 
                fontSize: 'clamp(14px, 3vw, 17px)',
              }}>
                Correo:
              </span>
              <span style={{ 
                color: '#1f2937', 
                fontSize: 'clamp(14px, 3vw, 17px)',
                wordBreak: 'break-word'
              }}>
                {user.correo}
              </span>
            </div>

            {/* Apellido */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ 
                color: '#39a900', 
                fontWeight: '600', 
                fontSize: 'clamp(14px, 3vw, 17px)',
              }}>
                Apellido:
              </span>
              <span style={{ 
                color: '#1f2937', 
                fontSize: 'clamp(14px, 3vw, 17px)',
                wordBreak: 'break-word'
              }}>
                {user.apellido}
              </span>
            </div>

            {/* Celular */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ 
                color: '#39a900', 
                fontWeight: '600', 
                fontSize: 'clamp(14px, 3vw, 17px)',
              }}>
                Celular:
              </span>
              <span style={{ 
                color: '#1f2937', 
                fontSize: 'clamp(14px, 3vw, 17px)',
                wordBreak: 'break-word'
              }}>
                {user.celular || 'No especificado'}
              </span>
            </div>

            {/* Tipo doc */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ 
                color: '#39a900', 
                fontWeight: '600', 
                fontSize: 'clamp(14px, 3vw, 17px)',
              }}>
                Tipo documento:
              </span>
              <span style={{ 
                color: '#1f2937', 
                fontSize: 'clamp(14px, 3vw, 17px)',
                wordBreak: 'break-word'
              }}>
                {user.tipoDoc}
              </span>
            </div>

            {/* Estado */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ 
                color: '#39a900', 
                fontWeight: '600', 
                fontSize: 'clamp(14px, 3vw, 17px)',
              }}>
                Estado:
              </span>
              <span style={{ 
                color: '#1f2937', 
                fontSize: 'clamp(14px, 3vw, 17px)',
                wordBreak: 'break-word'
              }}>
                {user.estado}
              </span>
            </div>

            {/* N° doc */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ 
                color: '#39a900', 
                fontWeight: '600', 
                fontSize: 'clamp(14px, 3vw, 17px)',
              }}>
                N° documento:
              </span>
              <span style={{ 
                color: '#1f2937', 
                fontSize: 'clamp(14px, 3vw, 17px)',
                wordBreak: 'break-word'
              }}>
                {user.numDoc}
              </span>
            </div>

            {/* Ubicación */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ 
                color: '#39a900', 
                fontWeight: '600', 
                fontSize: 'clamp(14px, 3vw, 17px)',
              }}>
                Ubicación:
              </span>
              <span style={{ 
                color: '#1f2937', 
                fontSize: 'clamp(14px, 3vw, 17px)',
                wordBreak: 'break-word'
              }}>
                {user.ubicacion || 'No especificada'}
              </span>
            </div>

            {/* Línea asignada */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ 
                color: '#39a900', 
                fontWeight: '600', 
                fontSize: 'clamp(14px, 3vw, 17px)',
              }}>
                Línea asignada:
              </span>
              <span style={{ 
                color: '#1f2937', 
                fontSize: 'clamp(14px, 3vw, 17px)',
                wordBreak: 'break-word'
              }}>
                {user.linea?.nombreLinea || 'Sin línea asignada'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}