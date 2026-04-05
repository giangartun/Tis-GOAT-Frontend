import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Components/Layout";
import HomePage from "./Pages/Home";
import MisProyectosPage from "./Pages/MisProyectos";
import { Login } from "./Pages/Login";
import { Register } from "./Pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/mis-proyectos" element={<MisProyectosPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;