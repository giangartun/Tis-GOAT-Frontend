import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./Components/Layout";
import HomePage from "./pages/Home";
import MisProyectosPage from "./pages/MisProyectos";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { VerificarEmail } from "./pages/VerificarEmail";

import AnadirHabilidades from "./pages/AnadirHabilidades";
import AnadirEnlaces from "./pages/AnadirEnlaces";
import PerfilUsuario from "./pages/perfilusuario";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verificar-email/:token" element={<VerificarEmail />} />

        {/* Rutas con layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/mis-proyectos" element={<MisProyectosPage />} />
        </Route>

        {/* Rutas extra */}
        <Route path="/habilidades" element={<AnadirHabilidades />} />
        <Route path="/enlaces" element={<AnadirEnlaces />} />
        <Route path="/perfil" element={<PerfilUsuario />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;