import { Link } from "react-router-dom";
import FotoTecnoparque from "../assets/FotoTecnoparque.jpg";
import "./MainDashboardCss.css"; // 🔹 Importa el CSS separado
import SenaLogo from "../assets/sena.png";

export default function MainDashboard() {
  return (
    <div className="main-wrapper">
      <div className="main-container">
        <div className="text-center">
          <h1 className="title">Indicadores Tecnoparque</h1>
          <h2 className="subtitle">Bienvenido/a, Nombre de usuario</h2>

          <div className="image-shadow-container">
            <div className="image-shadow-wrapper">
              <img
                src={FotoTecnoparque}
                alt="Foto del edificio Tecnoparque"
                className="tecno-image"
              />
            </div>
          </div>
        </div>

        {/* 🔹 Cards */}
        <nav className="cards-grid">
          {[
            {
              title: "Red Tecnoparque",
              desc: "Gestión y seguimiento de proyectos nacionales de innovación y desarrollo.",
              path: "/app/tecnoparque",
            },
            {
              title: "Red Tecnoacademia",
              desc: "Programas y actividades para fomentar el talento joven.",
              path: "/app/tecnoacademia",
            },
            {
              title: "Laboratorio",
              desc: "Espacio de experimentación y validación de tecnologías emergentes.",
              path: "/app/laboratorio",
            },
            {
              title: "Investigación",
              desc: "Impulso a la investigación aplicada e innovación tecnológica.",
              path: "/app/investigacion",
            },
          ].map((card, i) => (
            <Link key={i} to={card.path} className="card">
              <div className="card-top">
              <img src={SenaLogo} alt="Logo SENA" />
              </div>
              <div className="card-content">
                <h3>{card.title}</h3>
                <p className="location">Colombia</p>
                <p>{card.desc}</p>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
