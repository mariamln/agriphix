import { format } from 'date-fns';

export const UGANDA_LOCATIONS = [
  { name: 'Kampala', latitude: 0.3476, longitude: 32.5825 },
  { name: 'Mbale', latitude: 1.0821, longitude: 34.1750 },
  { name: 'Gulu', latitude: 2.7746, longitude: 32.2980 },
  { name: 'Mbarara', latitude: -0.6069, longitude: 30.6545 },
  { name: 'Jinja', latitude: 0.4244, longitude: 33.2041 },
  { name: 'Kasese', latitude: 0.1833, longitude: 30.0833 },
  { name: 'Lira', latitude: 2.2499, longitude: 32.8998 },
  { name: 'Masaka', latitude: -0.3333, longitude: 31.7333 },
];

function weatherCodeToCondition(code) {
  if (code === 0) return 'sunny';
  if (code <= 3) return 'cloudy';
  if (code <= 48) return 'cloudy';
  if (code <= 67) return 'rainy';
  if (code <= 77) return 'rainy';
  if (code <= 82) return 'rainy';
  if (code <= 86) return 'rainy';
  return 'stormy';
}

function computeRiskLevel(rainfall, tempHigh) {
  if (rainfall >= 20 || tempHigh >= 36) return 'high';
  if (rainfall >= 8 || tempHigh >= 33) return 'medium';
  return 'low';
}

export function generateFarmingAdvisory({ conditions, rainfall, tempHigh, tempLow }) {
  if (conditions === 'stormy' || rainfall >= 20) {
    return 'Heavy rain expected — delay spraying and harvesting. Check drainage in low-lying fields and secure stored produce.';
  }
  if (conditions === 'rainy' || rainfall >= 5) {
    return 'Rain likely — good for planting if soil is well-drained. Avoid heavy machinery on wet fields to prevent compaction.';
  }
  if (rainfall < 1 && tempHigh >= 32) {
    return 'Hot and dry — irrigate early morning or evening. Mulch crops to retain soil moisture and protect seedlings.';
  }
  if (conditions === 'cloudy') {
    return 'Overcast conditions — suitable for transplanting and light field work. Monitor for fungal diseases in humid canopy.';
  }
  if (tempLow <= 15) {
    return 'Cool overnight temperatures — protect sensitive crops and delay cold-sensitive planting until conditions warm.';
  }
  return 'Favourable conditions for general field activities — ideal for weeding, fertilising, and routine crop monitoring.';
}

async function fetchLocationForecast(location) {
  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,weather_code',
    timezone: 'Africa/Kampala',
    forecast_days: '7',
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw new Error(`Weather fetch failed for ${location.name}`);

  const data = await response.json();
  const today = new Date();

  return data.daily.time.map((dateStr, index) => {
    const rainfall = data.daily.precipitation_sum[index] ?? 0;
    const tempHigh = Math.round(data.daily.temperature_2m_max[index]);
    const tempLow = Math.round(data.daily.temperature_2m_min[index]);
    const humidity = Math.round(data.daily.relative_humidity_2m_mean[index] ?? 0);
    const conditions = weatherCodeToCondition(data.daily.weather_code[index]);
    const riskLevel = computeRiskLevel(rainfall, tempHigh);

    return {
      id: `${location.name}-${dateStr}`,
      location: location.name,
      forecast_date: dateStr,
      day_offset: index,
      temperature_high: tempHigh,
      temperature_low: tempLow,
      rainfall_mm: Math.round(rainfall * 10) / 10,
      humidity_percent: humidity,
      conditions,
      risk_level: riskLevel,
      farming_advisory: generateFarmingAdvisory({ conditions, rainfall, tempHigh, tempLow }),
      source: 'open-meteo',
      fetched_at: format(today, 'yyyy-MM-dd'),
    };
  });
}

export async function fetchUgandaForecasts() {
  const results = await Promise.all(UGANDA_LOCATIONS.map(fetchLocationForecast));
  return results.flat().sort((a, b) => {
    const dateCompare = a.forecast_date.localeCompare(b.forecast_date);
    return dateCompare !== 0 ? dateCompare : a.location.localeCompare(b.location);
  });
}

export async function fetchLocationForecasts(locationName) {
  const location = UGANDA_LOCATIONS.find((l) => l.name === locationName);
  if (!location) return [];
  return fetchLocationForecast(location);
}

export function getForecastDateLabel(dateStr) {
  return format(new Date(dateStr), 'EEEE, MMMM d, yyyy');
}
