(function () {
  const WORKER_BASE = 'https://blue-sentinel-ai.moozasalah138.workers.dev';

  function fallbackWeather(current = {}) {
    return {
      updated: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      waveHeight: Number(current.waveHeight || 0.6),
      waveDirection: 0,
      wavePeriod: 0,
      windSpeed: Number(current.windSpeed || 18),
      windDirection: 0,
      temperature: 28,
      uvIndex: 6,
      visibility: 10,
      risk: {
        score: Number(current.risk || 35),
        level: 'medium',
        status: current.status || 'البحر مفتوح بحذر',
        flag: 'yellow'
      },
      recommendations: [
        'السباحة مسموحة بحذر داخل المناطق المحددة فقط.',
        'ممنوع النزول تحت أي مارينا نهائياً - خطر درجة أولى.'
      ],
      publicNews: [
        { type: 'تنبيه', text: 'البحر مفتوح بحذر. يرجى الالتزام بتعليمات فريق الإنقاذ.' },
        { type: 'تحذير ثابت', text: 'ممنوع النزول تحت أي مارينا نهائياً.' }
      ],
      source: 'fallback'
    };
  }

  async function getReport(mode = 'latest') {
    const endpoint = mode === 'report' ? '/report' : '/latest';
    const res = await fetch(WORKER_BASE + endpoint, { method: 'GET' });

    if (!res.ok) {
      throw new Error('Worker Error: ' + res.status);
    }

    return await res.json();
  }

  async function run(currentWeather, points, options = {}) {
    try {
      const mode = options.forceUpdate ? 'report' : 'latest';
      const report = await getReport(mode);

      return {
        updated: report.updated,
        waveHeight: report.waveHeight,
        waveDirection: report.waveDirection,
        wavePeriod: report.wavePeriod,
        windSpeed: report.windSpeed,
        windDirection: report.windDirection,
        temperature: report.temperature,
        uvIndex: report.uvIndex,
        visibility: report.visibility,
        risk: report.risk,
        rec: report.recommendations || report.rec || [],
        recommendations: report.recommendations || report.rec || [],
        publicNews: report.publicNews || [],
        source: report.source || 'cloudflare-worker'
      };
    } catch (err) {
      console.error('Blue Sentinel AI Error:', err);
      return fallbackWeather(currentWeather);
    }
  }

  window.BS_AI = {
    run,
    getReport
  };
})();
