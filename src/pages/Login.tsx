import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import FotoTecnoparque from "../assets/FotoTecnoparque.jpg"

import { authService, type LoginData } from "../services/authService"

export default function Login() {
  const navigate = useNavigate()

  const [hover, setHover] = useState(false)
  const [visible, setVisible] = useState(false)
  const [focusButton, setFocusButton] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<LoginData>({
    correo: "",
    password: ""
  })

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  const handleInputChange = (field: keyof LoginData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleLogin = async () => {
    if (!formData.correo || !formData.password) {
      setError("Correo y contraseña son requeridos")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await authService.login(formData)

      localStorage.setItem("token", response.access_token)
      localStorage.setItem("user", JSON.stringify(response.user))

      const rol = response.user?.rol?.nombreRol
      const nodo = response.user?.linea?.nodo?.nombreNodo

      if (rol === "administrador") {
        navigate("/app")
        return
      }

      if (rol === "experto") {
        if (nodo === "Tecnoparque") {
          navigate("/app/tecnoparque")
          return
        }

        setError("Tu usuario no tiene un dashboard asignado")
        return
      }

      setError("No se pudo determinar el acceso del usuario")
    } catch (err) {
      setError("Correo o contraseña incorrectos")
      console.error("Login error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  return (
    <div
      style={{
        backgroundImage: `url(${FotoTecnoparque})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(1.5px)",
          zIndex: 0,
        }}
      />

      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-30px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
          backdropFilter: "blur(20px)",
          background: "rgba(255, 255, 255, 0.35)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "20px",
          padding: "50px 60px",
          width: "350px",
          boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "Poppins, sans-serif",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            color: "#39A900",
            marginBottom: "25px",
            fontWeight: 700,
            fontSize: "1.8rem",
            textShadow: "0 1px 2px rgba(0,0,0,0.15)",
            transform: visible ? "scale(1)" : "scale(0.8)",
            transition: "transform 0.6s ease",
          }}
        >
          Bienvenido 👋
        </h1>

        {error && (
          <div
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "rgba(255,0,0,0.1)",
              border: "1px solid rgba(255,0,0,0.3)",
              borderRadius: "8px",
              color: "#d00",
              fontSize: "0.9rem",
              marginBottom: "15px",
              textAlign: "center"
            }}
          >
            {error}
          </div>
        )}

        <div style={{ width: "100%", marginBottom: "20px" }}>
          <label
            style={{
              color: "#222",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            Correo electrónico
          </label>
          <input
            type="email"
            placeholder="Ingresa tu correo"
            value={formData.correo}
            onChange={(e) => handleInputChange("correo", e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              width: "100%",
              padding: "12px 15px",
              marginTop: "6px",
              borderRadius: "10px",
              border: "2px solid rgba(57,169,0,0.3)",
              backgroundColor: "rgba(255,255,255,0.6)",
              outline: "none",
              fontSize: "1rem",
              color: "#000",
              transition: "all 0.3s ease",
            }}
            onFocus={(e) => (e.target.style.border = "2px solid #39A900")}
            onBlur={(e) =>
              (e.target.style.border = "2px solid rgba(57,169,0,0.3)")
            }
          />
        </div>

        <div style={{ width: "100%", marginBottom: "30px" }}>
          <label
            style={{
              color: "#222",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            Contraseña
          </label>
          <input
            type="password"
            placeholder="Ingresa tu contraseña"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              width: "100%",
              padding: "12px 15px",
              marginTop: "6px",
              borderRadius: "10px",
              border: "2px solid rgba(57,169,0,0.3)",
              backgroundColor: "rgba(255,255,255,0.6)",
              outline: "none",
              fontSize: "1rem",
              color: "#000",
              transition: "all 0.3s ease",
            }}
            onFocus={(e) => (e.target.style.border = "2px solid #39A900")}
            onBlur={(e) =>
              (e.target.style.border = "2px solid rgba(57,169,0,0.3)")
            }
          />
        </div>

        <button
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onFocus={() => setFocusButton(true)}
          onBlur={() => setFocusButton(false)}
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: loading ? "#ccc" : (hover ? "#2e8500" : "#39A900"),
            color: "white",
            fontWeight: 600,
            fontSize: "1rem",
            border: "none",
            borderRadius: "10px",
            padding: "12px",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: hover && !loading
              ? "0 5px 15px rgba(57,169,0,0.4)"
              : "0 4px 10px rgba(57,169,0,0.25)",
            outline: focusButton ? "3px solid #D7FFD9" : "none",
            outlineOffset: "2px",
            transition: "all 0.3s ease",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>

        <p
          style={{
            marginTop: "25px",
            fontSize: "0.9rem",
            color: "#222",
          }}
        >
          ¿No tienes cuenta?{" "}
          <span
            onClick={() => navigate("/register")}
            style={{
              color: "#39A900",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Regístrate
          </span>
        </p>
      </div>
    </div>
  )
}