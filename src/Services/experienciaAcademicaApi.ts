const API =
  (import.meta as any)?.env?.VITE_API_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function guardarExperienciaAcademicaConEvidencias(
  idPortafolio: string | number,
  data: {
    institucion: string;
    titulo: string;
    descripcion: string;
    fecha_ini: string;
    fecha_fin: string | null;
    archivos: File[];
  }
) {
  const respExperiencia = await fetch(`${API}/api/experiencia-academica`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_portafolio: idPortafolio,
      institucion: data.institucion,
      titulo: data.titulo,
      descripcion: data.descripcion,
      fecha_ini: data.fecha_ini,
      fecha_fin: data.fecha_fin,
      visible: true,
    }),
  });

  const jsonExperiencia = await respExperiencia.json();

  if (!respExperiencia.ok) {
    const mensaje =
      jsonExperiencia?.message ||
      (jsonExperiencia?.errors
        ? Object.values(jsonExperiencia.errors).flat().join(", ")
        : "No se pudo guardar la experiencia académica.");
    throw new Error(mensaje);
  }

  const experienciaCreada = jsonExperiencia.data;

  for (const archivo of data.archivos) {
    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("id_academica", experienciaCreada.id_experiencia_academica);

    const respArchivo = await fetch(`${API}/api/evidencias/subir`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    const jsonArchivo = await respArchivo.json();

    if (!respArchivo.ok) {
      const mensaje =
        jsonArchivo?.message ||
        (jsonArchivo?.errors
          ? Object.values(jsonArchivo.errors).flat().join(", ")
          : "La experiencia se guardó, pero falló la subida de un archivo.");
      throw new Error(mensaje);
    }
  }

  return experienciaCreada;
}