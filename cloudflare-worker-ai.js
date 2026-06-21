export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(generateDailyReport(env));
  },
  async fetch(request, env) {
    const data = await generateDailyReport(env);
    return new Response(JSON.stringify(data), {headers:{'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*'}});
  }
};
async function generateDailyReport(env){
  const latitude=30.98, longitude=28.75, timezone='Africa/Cairo';
  const marine=`https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude}&hourly=wave_height,wave_direction,wave_period&timezone=${timezone}&forecast_days=1`;
  const forecast=`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=wind_speed_10m,wind_direction_10m,temperature_2m,uv_index,visibility&timezone=${timezone}&forecast_days=1`;
  const [m,f]=await Promise.all([fetch(marine).then(r=>r.json()),fetch(forecast).then(r=>r.json())]);
  const h='06';
  const idx=(arr)=>{const i=(arr||[]).findIndex(t=>String(t).includes('T'+h+':')); return i>=0?i:0};
  const mi=idx(m.hourly?.time), fi=idx(f.hourly?.time);
  const waveHeight=Number(m.hourly?.wave_height?.[mi]||0.6), windSpeed=Number(f.hourly?.wind_speed_10m?.[fi]||18), uvIndex=Number(f.hourly?.uv_index?.[fi]||6), visibility=Math.round(Number(f.hourly?.visibility?.[fi]||10000)/1000);
  let score=Math.min(100,Math.round((waveHeight/1.8)*45+(windSpeed/35)*28+(uvIndex/11)*10+(visibility<5?(5-visibility)*3:0)));
  let level='low', flag='green', status='البحر مفتوح';
  if(waveHeight>1.2||windSpeed>25||score>=65){level='high';flag='red';status='البحر خطر'}
  else if(waveHeight>=0.5||windSpeed>=15||score>=35){level='medium';flag='yellow';status='البحر مفتوح بحذر'}
  const data={updated:new Date().toISOString(),waveHeight,windSpeed,uvIndex,visibility,risk:score,level,flag,status,recommendations:[level==='high'?'رفع الراية الحمراء وزيادة التغطية ومنع السباحة مؤقتاً.':level==='medium'?'السباحة بحذر داخل المناطق المحددة وزيادة متابعة المارينا.':'توزيع طبيعي مع متابعة نقاط الحافة.','ممنوع النزول تحت أي مارينا نهائياً.']};
  if(env.BS_AI_KV) await env.BS_AI_KV.put('daily-report',JSON.stringify(data));
  return data;
}
