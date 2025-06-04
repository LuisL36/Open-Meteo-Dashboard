
function getVisitorTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}


function makeTempURL() {
  const tz = encodeURIComponent(getVisitorTimeZone());
  return `https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&hourly=temperature_2m&timezone=${tz}`;
}


function makePrecipURL() {
  const tz = encodeURIComponent(getVisitorTimeZone());
  return `https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&hourly=precipitation_probability&timezone=${tz}`;
}

const btnTemp   = document.getElementById('btn-temp');
const btnPrecip = document.getElementById('btn-precip');
const weatherEl = document.getElementById('weather');


async function fetchAndRender(url, renderFn) {
  weatherEl.innerHTML = '<p>Loading…</p>';
  try {
    const res  = await fetch(url);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    weatherEl.innerHTML = '';
    renderFn(data);
  } catch (err) {
    weatherEl.innerHTML = '<p>Sorry, data unavailable.</p>';
    console.error(err);
  }
}

function getCurrentIndex(times) {
  const now = new Date();
  const Y  = now.getFullYear().toString().padStart(4, '0');
  const M  = (now.getMonth() + 1).toString().padStart(2, '0');
  const D  = now.getDate().toString().padStart(2, '0');
  const H  = now.getHours().toString().padStart(2, '0');
  const localHourString = `${Y}-${M}-${D}T${H}:00`;
  const idx = times.indexOf(localHourString);
  return idx > -1 ? idx : 0;
}

// 6) Format "YYYY-MM-DDTHH:00" into "h:mm AM/PM"
function formatTo12Hour(timeString) {
  const date = new Date(timeString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// 7) Render next 5 hours of temperature
function renderTemperature(data) {
  const times = data.hourly.time;
  const temps = data.hourly.temperature_2m;
  const idx   = getCurrentIndex(times);

  let listItems = '';
  for (let i = idx; i < idx + 5 && i < times.length; i++) {
    const displayTime = formatTo12Hour(times[i]);
    const displayTemp = temps[i];
    listItems += `<li>${displayTime} — ${displayTemp}°C</li>`;
  }

  weatherEl.innerHTML = `
    <h2>🌡️ Temperature Forecast (Next 5 Hours)</h2>
    <div class="card">
      <ul>${listItems}</ul>
    </div>
  `;
}

// 8) Render next 5 hours of precipitation probability
function renderPrecipitation(data) {
  const times  = data.hourly.time;
  const precs  = data.hourly.precipitation_probability;
  const idx    = getCurrentIndex(times);

  let listItems = '';
  for (let i = idx; i < idx + 5 && i < times.length; i++) {
    const displayTime = formatTo12Hour(times[i]);
    const displayPct  = precs[i];
    listItems += `<li>${displayTime} — ${displayPct}%</li>`;
  }

  weatherEl.innerHTML = `
    <h2>🌧️ Precipitation Forecast (Next 5 Hours)</h2>
    <div class="card">
      <ul>${listItems}</ul>
    </div>
  `;
}

// 9) Button event handlers
btnTemp.addEventListener('click', () => {
  btnTemp.classList.add('active');
  btnPrecip.classList.remove('active');
  fetchAndRender(makeTempURL(), renderTemperature);
});

btnPrecip.addEventListener('click', () => {
  btnPrecip.classList.add('active');
  btnTemp.classList.remove('active');
  fetchAndRender(makePrecipURL(), renderPrecipitation);
});

// 10) Initial load: show temperature by default
fetchAndRender(makeTempURL(), renderTemperature);
