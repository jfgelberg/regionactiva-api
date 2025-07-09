export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { lat, lon, start, end } = req.query;
  const apiKey = process.env.METEOSTAT_API_KEY;

  console.log('🔐 API Key:', apiKey);
  console.log('🌐 URL:', `https://api.meteostat.net/v2/point/monthly?lat=${lat}&lon=${lon}&start=${start}&end=${end}`);

  if (!lat || !lon || !start || !end || !apiKey) {
    return res.status(400).json({ error: 'Faltan parámetros o API key no configurada' });
  }

  const url = `https://api.meteostat.net/v2/point/monthly?lat=${lat}&lon=${lon}&start=${start}&end=${end}`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-api-key': apiKey,
      },
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const html = await response.text();
      console.error('❌ Respuesta inesperada:', html.slice(0, 100));
      return res.status(500).json({ error: 'Respuesta inesperada de la API externa' });
    }

    const result = await response.json();

    const adaptado = result.data.map((mes) => ({
      tavg: mes.tavg ?? null,
      tmin: mes.tmin ?? null,
      tmax: mes.tmax ?? null,
      prcp: mes.prcp ?? null,
      wspd: mes.wspd !== null && mes.wspd !== undefined
        ? Number((mes.wspd * 3.6).toFixed(1)) // m/s a km/h
        : null,
    }));

    return res.status(200).json({ data: adaptado });
  } catch (error) {
    console.error('❌ Error al consultar Meteostat oficial:', error);
    return res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
  }
}
