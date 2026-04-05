import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

import AnadirHabilidades from "./pages/AnadirHabilidades";
import AnadirEnlaces from "./pages/AnadirEnlaces";
import PerfilUsuario from "./pages/PerfilUsuario";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal */}
        <Route path="/" element={<Login />} />

        {/* Rutas básicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Tus rutas */}
        <Route path="/habilidades" element={<AnadirHabilidades />} />
        <Route path="/enlaces" element={<AnadirEnlaces />} />
        <Route path="/perfil" element={<PerfilUsuario />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;