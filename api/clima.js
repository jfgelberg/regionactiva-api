export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { lat, lon, start, end } = req.query;

  const rapidApiHost = process.env.RAPID_API_HOST;
  const rapidApiKey = process.env.RAPID_API_KEY;

  if (!lat || !lon || !start || !end) {
    return res.status(400).json({ error: 'Faltan parámetros en la consulta' });
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

    // Transformar datos
    const adaptado = result.data.map((mes) => ({
      tavg: mes.tavg ?? null,
      tmin: mes.tmin ?? null,
      tmax: mes.tmax ?? null,
      prcp: mes.prcp ?? null,
      wspd: mes.wspd !== null && mes.wspd !== undefined
        ? Number((mes.wspd * 3.6).toFixed(1)) // convertir m/s a km/h
        : null,
    }));

    return res.status(200).json({ data: adaptado });
  } catch (error) {
    console.error('Error al consultar Meteostat:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
