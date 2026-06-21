(function(){
  const LOCATION = { latitude: 30.98, longitude: 28.75, timezone: 'Africa/Cairo' };
  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function num(v,fallback=0){const n=Number(v); return Number.isFinite(n)?n:fallback;}
  function calcRisk(input){
    const wave=num(input.waveHeight), wind=num(input.windSpeed), uv=num(input.uvIndex), vis=num(input.visibility,10), incidents=num(input.yesterdayIncidents,0);
    let score=0;
    score += clamp((wave/1.8)*45,0,45);
    score += clamp((wind/35)*28,0,28);
    score += clamp((uv/11)*10,0,10);
    score += vis && vis<5 ? clamp((5-vis)*3,0,8) : 0;
    score += clamp(incidents*4,0,16);
    let level='low', flag='green', status='البحر مفتوح';
    if(wave>1.2 || wind>25 || score>=65){level='high'; flag='red'; status='البحر خطر';}
    else if(wave>=0.5 || wind>=15 || score>=35){level='medium'; flag='yellow'; status='البحر مفتوح بحذر';}
    return {score:Math.round(clamp(score,0,100)), level, flag, status};
  }
  function sectorLoad(points, risk){
    const zones={};
    (points||[]).forEach(p=>{zones[p.zone]=(zones[p.zone]||0)+1});
    const base = risk.level==='high'?2:risk.level==='medium'?1:0;
    return Object.keys(zones).map(z=>({zone:z, extra:(z.includes('MARINA')?1:0)+base})).filter(x=>x.extra>0);
  }
  function recommendations(input, points){
    const risk=calcRisk(input); const rec=[]; const pub=[];
    if(risk.level==='high'){
      rec.push('رفع الراية الحمراء وإيقاف السباحة في المناطق المفتوحة لحين مراجعة المشرف.');
      rec.push('زيادة التغطية على نقاط الحافة والمارينا ومنع الاقتراب من أسفل أي مارينا.');
      rec.push('تشغيل وسيلة إنقاذ سريعة إن وجدت وتجهيز الإسعاف بجانب أعلى قطاع خطورة.');
      pub.push({type:'تحذير عاجل',text:'البحر غير مناسب للسباحة حالياً. يرجى الالتزام بتعليمات فريق الإنقاذ.'});
    } else if(risk.level==='medium'){
      rec.push('السباحة مسموحة بحذر داخل المناطق المحددة فقط.');
      rec.push('زيادة مراقبة المارينا ونقاط PAY EAST / EAST القريبة من مناطق الموج.');
      rec.push('منع الأطفال من النزول بدون مرافق داخل المياه.');
      pub.push({type:'تنبيه',text:'البحر مفتوح بحذر. السباحة داخل المناطق المحددة فقط.'});
    } else {
      rec.push('توزيع طبيعي مع الالتزام بمراقبة المارينا ونقاط الحافة.');
      pub.push({type:'حالة البحر',text:'البحر مناسب للسباحة مع الالتزام بتعليمات المنقذين.'});
    }
    pub.push({type:'تحذير ثابت',text:'ممنوع النزول تحت أي مارينا نهائياً - خطر درجة أولى.'});
    pub.push({type:'توصية',text:'اتبع الرايات وتعليمات المنقذين طوال وقت الشيفت.'});
    const loads=sectorLoad(points,risk);
    if(loads.length){ rec.push('اقتراح توزيع إضافي: '+loads.map(x=>`${x.zone}: +${x.extra}`).join(' / ')); }
    return {risk, rec, publicNews:pub};
  }
  async function fetchWeather(){
    const {latitude,longitude,timezone}=LOCATION;
    const marine=`https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude}&hourly=wave_height,wave_direction,wave_period&timezone=${timezone}&forecast_days=1`;
    const forecast=`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=wind_speed_10m,wind_direction_10m,temperature_2m,uv_index,visibility&timezone=${timezone}&forecast_days=1`;
    const [m,f]=await Promise.all([fetch(marine).then(r=>r.json()),fetch(forecast).then(r=>r.json())]);
    const now=new Date(); const hour=String(now.getHours()).padStart(2,'0');
    const idx=(arr)=>{const i=(arr||[]).findIndex(t=>String(t).includes('T'+hour+':')); return i>=0?i:0};
    const mi=idx(m.hourly?.time), fi=idx(f.hourly?.time);
    return {
      updated: now.toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'}),
      waveHeight: num(m.hourly?.wave_height?.[mi],0.6),
      waveDirection: num(m.hourly?.wave_direction?.[mi],0),
      wavePeriod: num(m.hourly?.wave_period?.[mi],0),
      windSpeed: num(f.hourly?.wind_speed_10m?.[fi],18),
      windDirection: num(f.hourly?.wind_direction_10m?.[fi],0),
      temperature: num(f.hourly?.temperature_2m?.[fi],28),
      uvIndex: num(f.hourly?.uv_index?.[fi],6),
      visibility: Math.round(num(f.hourly?.visibility?.[fi],10000)/1000)
    };
  }
  function fallbackWeather(current={}){
    return {updated:new Date().toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'}),waveHeight:num(current.waveHeight,0.6),waveDirection:0,wavePeriod:0,windSpeed:num(current.windSpeed,18),windDirection:0,temperature:28,uvIndex:6,visibility:10};
  }
  async function run(currentWeather, points, options={}){
    let weather; let source='manual';
    try{ weather = options.skipFetch ? fallbackWeather(currentWeather) : await fetchWeather(); source='open-meteo'; }
    catch(e){ weather = fallbackWeather(currentWeather); source='fallback'; }
    const pack=recommendations({...weather,yesterdayIncidents:options.yesterdayIncidents||0,expectedVisitors:options.expectedVisitors||0},points);
    return {...weather, ...pack, source};
  }
  window.BS_AI={calcRisk,recommendations,fetchWeather,run};
})();
