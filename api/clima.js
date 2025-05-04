// api/clima.js

export default async function handler(req, res) {
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

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error al consultar Meteostat:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
