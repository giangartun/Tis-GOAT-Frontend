import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import "./locales/i18n"; // 🔥 IMPORTANTE: INICIALIZAR I18N ANTES DE RENDERIZAR LA APP

/*
Tienen que controlar como arreglar o evitar que se ponga el stric mode en produccion
ya que para validacion de email, suele sallir un bug especial de que hace dos peticiones
al mismo endpoint
*/


createRoot(document.getElementById('root')!).render(
  //<StrictMode>
    <App />
  //</StrictMode>,
)