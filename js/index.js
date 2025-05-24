fetch(
  'https://api.open-meteo.com/v1/forecast' +
  '?latitude=40.71&longitude=-74.01' +
  '&hourly=temperature_2m,precipitation_probability' +
  '&timezone=America%2FNew_York'
)
  .then(res => {
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  })
  .then(data => {
    
    const now = new Date();
    const hourString = now.toISOString().slice(0,13) + ':00'; 
      

    
    const times = data.hourly.time;
    let idx = times.indexOf(hourString);
    if (idx === -1) idx = 0;  

    // data points
    const temp = data.hourly.temperature_2m[idx];
    const precip = data.hourly.precipitation_probability[idx];

    // Render in page
    const weatherDiv = document.getElementById('weather');
    weatherDiv.innerHTML = `
      <h2>Current Weather</h2>
      <p><strong>Temperature:</strong> ${temp}°C</p>
      <p><strong>Precipitation Probability:</strong> ${precip}%</p>
    `;
  })
  .catch(err => {
    console.error('Fetch error:', err);
    document.getElementById('weather').innerText =
      'Sorry, weather data unavailable.';
  });
