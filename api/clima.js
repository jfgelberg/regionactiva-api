export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { lat, lon, start, end } = req.query;

  const rapidApiHost = process.env.RAPID_API_HOST;
  const rapidApiKey = process.env.RAPID_API_KEY;

  if (!lat || !lon || !start || !end || !rapidApiHost || !rapidApiKey) {
    return res.status(400).json({ error: 'Faltan parámetros o API key no configurada' });
  }

  const url = `https://${rapidApiHost}/point/monthly?lat=${lat}&lon=${lon}&start=${start}&end=${end}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': rapidApiHost,
        'x-rapidapi-key': rapidApiKey,
      },
    });

    const result = await response.json();

    // Validación y adaptación
    if (!result?.data || !Array.isArray(result.data)) {
      return res.status(500).json({ error: 'Respuesta inesperada de la API externa', detalle: result });
    }

    // Adaptar los campos necesarios
    const adaptado = result.data.map((mes) => ({
      date: mes.date ?? null,
      tavg: mes.tavg ?? null,
      tmin: mes.tmin ?? null,
      tmax: mes.tmax ?? null,
      prcp: mes.prcp ?? null,
      wspd: typeof mes.wspd === 'number' ? Number((mes.wspd * 3.6).toFixed(1)) : null, // m/s a km/h
    }));

    return res.status(200).json({ data: adaptado });
  } catch (error) {
    console.error('❌ Error al consultar RapidAPI Meteostat:', error);
    return res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
  }
}
