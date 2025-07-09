export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { lat, lon, start, end } = req.query;
  const apiKey = process.env.METEOSTAT_API_KEY;

  console.log('🔐 API Key:', apiKey);
  console.log('📍 Lat/Lon:', lat, lon);
  console.log('📅 Fechas:', start, end);

  if (!lat || !lon || !start || !end || !apiKey) {
    return res.status(400).json({ error: 'Faltan parámetros o API key no configurada' });
  }

  const url = `https://api.meteostat.net/v2/point/monthly?lat=${lat}&lon=${lon}&start=${start}&end=${end}`;
  console.log('🌐 URL:', url);

  try {
    const response = await fetch(url, {
      headers: {
        'x-api-key': apiKey,
      },
    });

    const result = await response.json();
    console.log('📦 Respuesta Meteostat:', result);

    if (!result?.data || !Array.isArray(result.data)) {
      return res.status(500).json({ error: 'Respuesta inválida de Meteostat' });
    }

    const adaptado = result.data.map((mes) => ({
      tavg: mes.tavg ?? null,
      tmin: mes.tmin ?? null,
      tmax: mes.tmax ?? null,
      prcp: mes.prcp ?? null,
      wspd: mes.wspd !== null && mes.wspd !== undefined
        ? Number((mes.wspd * 3.6).toFixed(1))
        : null,
    }));

    return res.status(200).json({ data: adaptado });
  } catch (error) {
    console.error('❌ Error al consultar Meteostat oficial:', error);
    return res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
  }
}
