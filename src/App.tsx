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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verificar-email/:token" element={<VerificarEmail />} />

        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/mis-proyectos" element={<MisProyectosPage />} />
          <Route path="/perfil" element={<PerfilUsuario />} />
          <Route path="/portafolio" element={<Portafolio />} />
          <Route
            path="/personalizacion-portafolio"
            element={<PersonalizacionPortafolio />}
          />
        </Route>

        <Route path="/habilidades" element={<AnadirHabilidades />} />
        <Route path="/enlaces" element={<AnadirEnlaces />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;