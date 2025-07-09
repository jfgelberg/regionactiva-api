export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { lat, lon, start, end } = req.query;

  const apiKey = process.env.RAPID_API_KEY;
  const apiHost = process.env.RAPID_API_HOST || 'meteostat.p.rapidapi.com';

  if (!lat || !lon || !start || !end || !apiKey) {
    return res.status(400).json({
      error: 'Faltan parámetros o clave de RapidAPI no configurada',
    });
  }

  const url = `https://${apiHost}/point/monthly?lat=${lat}&lon=${lon}&start=${start}&end=${end}`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-host': apiHost,
        'x-rapidapi-key': apiKey,
      },
    });

    const result = await response.json();

    if (!result?.data || !Array.isArray(result.data)) {
      return res
        .status(500)
        .json({ error: 'Respuesta inválida de Meteostat (RapidAPI)' });
    }

    // Adaptar los datos
    const adaptado = result.data.map((mes) => ({
      date: mes.date ?? null,
      tavg: mes.tavg ?? null,
      tmin: mes.tmin ?? null,
      tmax: mes.tmax ?? null,
      prcp: mes.prcp ?? null,
      wspd:
        mes.wspd !== null && mes.wspd !== undefined
          ? Number((mes.wspd * 3.6).toFixed(1)) // m/s → km/h
          : null,
      pres: mes.pres ?? null,
      tsun: mes.tsun ?? null,
    }));

    return res.status(200).json({ data: adaptado });
  } catch (error) {
    console.error('❌ Error al consultar Meteostat via RapidAPI:', error);
    return res
      .status(500)
      .json({ error: 'Error al consultar Meteostat via RapidAPI' });
  }
}
