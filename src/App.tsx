import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Components/Layout";
import HomePage from "./Pages/Home";
import MisProyectosPage from "./Pages/MisProyectos";
import PersonalizacionPortafolio from "./Pages/PersonalizacionPortafolio";
import Portafolio from "./Pages/Portafolio";
import { Login } from "./Pages/Login";
import { Register } from "./Pages/Register";
import { VerificarEmail } from "./Pages/VerificarEmail";
import AnadirHabilidades from "./Pages/AnadirHabilidades";
import AnadirEnlaces from "./Pages/AnadirEnlaces";
import PerfilUsuario from "./Pages/perfilusuario";
import PrivacidadPortafolio from "./Pages/PrivacidadPortafolio";
import PerfilPublico from "./Pages/PerfilPublico";
import { ResetPassword } from "./Pages/RestablecerContraseña";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas sin layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verificar-email/:token" element={<VerificarEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Rutas con layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/mis-proyectos" element={<MisProyectosPage />} />
          <Route path="/perfil" element={<PerfilUsuario />} />
          <Route path="/privacidad" element={<PrivacidadPortafolio />} />
          <Route path="/perfil-publico/:id" element={<PerfilPublico />} />
          <Route path="/portafolio" element={<Portafolio />} />
          <Route
            path="/personalizacion-portafolio"
            element={<PersonalizacionPortafolio />}
          />
        </Route>

        {/* Rutas extra sin layout */}
        <Route path="/habilidades" element={<AnadirHabilidades />} />
        <Route path="/enlaces" element={<AnadirEnlaces />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;