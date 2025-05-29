//*
const API_BASE = 'https://api.open-meteo.com/v1/forecast' +
  '?latitude=40.71&longitude=-74.01' +
  '&hourly=temperature_2m,precipitation_probability' +
  '&timezone=America%2FNew_York';

const btnTemp   = document.getElementById('btn-temp');
const btnPrecip = document.getElementById('btn-precip');
const weatherEl = document.getElementById('weather');

// generic fetch + clear
async function fetchAndRender(renderFn) {
  weatherEl.innerHTML = '<p>Loading…</p>';
  try {
    const res  = await fetch(API_BASE);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    weatherEl.innerHTML = '';              // clear loader
    renderFn(data);
  } catch (err) {
    weatherEl.innerHTML = '<p>Sorry, data unavailable.</p>';
    console.error(err);
  }
}

// pick out the current hour index
function getCurrentIndex(times) {
  const now = new Date();
  const hourString = now.toISOString().slice(0,13) + ':00';
  const idx = times.indexOf(hourString);
  return idx > -1 ? idx : 0;
}

// renderer for temperature
function renderTemperature(data) {
  const times = data.hourly.time;
  const idx   = getCurrentIndex(times);
  const temp  = data.hourly.temperature_2m[idx];
  weatherEl.innerHTML = `
    <h2>Temperature Right Now</h2>
    <div class="card">
      <p><strong>Time:</strong> ${times[idx].replace('T',' ')}</p>
      <p><strong>Temp:</strong> ${temp}°C</p>
    </div>
  `;
}

// renderer for precipitation
function renderPrecipitation(data) {
  const times  = data.hourly.time;
  const idx    = getCurrentIndex(times);
  const precip = data.hourly.precipitation_probability[idx];
  weatherEl.innerHTML = `
    <h2>Precipitation Right Now</h2>
    <div class="card">
      <p><strong>Time:</strong> ${times[idx].replace('T',' ')}</p>
      <p><strong>Chance:</strong> ${precip}%</p>
    </div>
  `;
}

// nav handlers
btnTemp.addEventListener('click', () => {
  btnTemp.classList.add('active');
  btnPrecip.classList.remove('active');
  fetchAndRender(renderTemperature);
});

btnPrecip.addEventListener('click', () => {
  btnPrecip.classList.add('active');
  btnTemp.classList.remove('active');
  fetchAndRender(renderPrecipitation);
});

// initial load
fetchAndRender(renderTemperature);

