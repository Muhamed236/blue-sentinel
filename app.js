(function(){
'use strict';

const LS='blueSentinelDataV8';
const AI_CHAT_URL='https://blue-sentinel-ai.moozasalah138.workers.dev/chat';
let DATA=normalizeData(loadData());
let syncTimer=null;
let isLoadingShared=false;
let sharedLoaded=false;
let carouselStarted=false;

function clone(o){return JSON.parse(JSON.stringify(o||{}));}
function defaultData(){return clone(window.BS_DEFAULT_DATA||{});}
function normalizeData(data){
  const base=defaultData();
  const d=Object.assign({}, base, data||{});
  d.weather=Object.assign({}, base.weather||{}, d.weather||{});
  d.aiReport=Object.assign({}, base.aiReport||{}, d.aiReport||{});
  d.supervisor=Object.assign({}, base.supervisor||{}, d.supervisor||{});
  d.publicNews=Array.isArray(d.publicNews)?d.publicNews:[];
  d.lifeguards=Array.isArray(d.lifeguards)?d.lifeguards:[];
  d.points=Array.isArray(d.points)?d.points:[];
  d.incidents=Array.isArray(d.incidents)?d.incidents:[];
  d.requests=Array.isArray(d.requests)?d.requests:[];
  d.suggestions=Array.isArray(d.suggestions)?d.suggestions:[];
  d.shift=d.shift||base.shift||'09:00 - 19:00';
  d.sheetsWebhook=d.sheetsWebhook||base.sheetsWebhook||'';
  return d;
}
function loadData(){
  try{
    const local=JSON.parse(localStorage.getItem(LS));
    return local || defaultData();
  }catch(e){
    return defaultData();
  }
}
function saveLocal(){localStorage.setItem(LS,JSON.stringify(DATA));}
function save(){saveLocal(); if(!isLoadingShared) scheduleSharedSave();}
function scheduleSharedSave(){
  if(!DATA.sheetsWebhook) return;
  clearTimeout(syncTimer);
  syncTimer=setTimeout(()=>saveSharedSystem(),700);
}
function $$(s,root=document){return [...root.querySelectorAll(s)];}
function $(s,root=document){return root.querySelector(s);}
function safeText(v){return String(v ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function statusClass(status){return status==='مقبول'||status==='تم الصرف'||status==='تم التنفيذ'?'safe':status==='مرفوض'?'danger':'caution';}
function guardName(id){return (DATA.lifeguards.find(g=>g.id===id)||{}).name||'غير محدد';}
function riskText(r){return r==='danger'?'خطر':r==='caution'?'حذر':'آمن';}
function riskClass(r){return r==='danger'?'danger':r==='caution'?'caution':'safe';}

async function loadSharedSystem(){
  if(!DATA.sheetsWebhook) return false;

  try{
    const res = await fetch(DATA.sheetsWebhook + '?action=system');
    const json = await res.json();

    if(json.status === 'success' && json.data && Object.keys(json.data).length){
      DATA = json.data;
      save();
      return true;
    }

    // أول مرة: لو الشيت فاضي، ارفع الداتا الحالية عليه
    await saveSharedSystem();
    return false;

  }catch(e){
    console.error('loadSharedSystem error', e);
    return false;
  }
}
async function saveSharedSystem(){
  if(!DATA.sheetsWebhook) return false;
  try{
    await fetch(DATA.sheetsWebhook,{
      method:'POST',
      mode:'no-cors',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({kind:'system',system:DATA})
    });
    return true;
  }catch(e){
    console.warn('saveSharedSystem failed',e);
    return false;
  }
}
async function sheetSubmit(row){
  if(!DATA.sheetsWebhook) return false;
  try{
    await fetch(DATA.sheetsWebhook,{
      method:'POST',
      mode:'no-cors',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(row)
    });
    return true;
  }catch(e){
    console.warn('sheetSubmit failed',e);
    return false;
  }
}

function menu(){
  const b=$('#menuBtn'),m=$('#menuPop');
  if(!b||!m)return;
  b.onclick=()=>m.classList.toggle('open');
  document.addEventListener('click',e=>{if(!m.contains(e.target)&&!b.contains(e.target))m.classList.remove('open');});
}
function pageNav(){
  $$('.tab').forEach(btn=>btn.onclick=()=>{
    $$('.tab').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    $$('.page').forEach(p=>p.classList.remove('active'));
    $('#'+btn.dataset.page)?.classList.add('active');
  });
}
function map(el,opts={}){
  if(!el)return;
  el.innerHTML='';
  el.classList.toggle('admin-map',!opts.public);
  el.classList.toggle('public-clean',!!opts.public);
  const center=document.createElement('div'); center.className='center-line'; el.appendChild(center);
  const shore=document.createElement('div'); shore.className='shore-line'; el.appendChild(shore);
  const zones=[{cls:'danger-zone pay',t:'خطر تحت المارينا',l:16.3,w:5.2,top:51},{cls:'danger-zone east',t:'خطر تحت المارينا',l:81.6,w:4.3,top:49.2}];
  zones.forEach(z=>{const d=document.createElement('div');d.className=z.cls;d.style.left=z.l+'%';d.style.width=z.w+'%';d.style.top=z.top+'%';d.textContent=z.t;el.appendChild(d);});
  const groups=[{t:'BAY WEST',l:7,top:53},{t:'BAY EAST',l:33,top:53},{t:'EAST',l:72,top:53},{t:'MARINA',l:17.5,top:45},{t:'MARINA',l:83,top:44}];
  groups.forEach(g=>{const d=document.createElement('div');d.className='map-group-label';d.style.left=g.l+'%';d.style.top=g.top+'%';d.textContent=g.t;el.appendChild(d);});
  DATA.points.forEach(p=>{
    const d=document.createElement('button');
    d.className='point '+riskClass(p.risk)+(p.marina?' marina':'');
    d.style.left=p.x+'%';
    d.style.top=p.y+'%';
    d.title=p.title+' - '+riskText(p.risk);
    d.innerHTML='<span>'+(!opts.public?p.no:'')+'</span>';
    d.onclick=(ev)=>selectPoint(p,opts,ev);
    el.appendChild(d);
  });
  const leg=document.createElement('div');
  leg.className='legend';
  leg.innerHTML='<span><i class="dot safe-bg"></i>آمن</span><span><i class="dot caution-bg"></i>حذر</span><span><i class="dot danger-bg"></i>خطر/مارينا</span><span><i class="dot blue-bg"></i>اضغط للتفاصيل</span>';
  el.appendChild(leg);
}
function selectPoint(p,opts={},ev){
  $$('.point').forEach(x=>x.classList.remove('selected'));
  if(ev?.currentTarget) ev.currentTarget.classList.add('selected');
  const panel=$('#pointDetails');
  if(!panel)return;
  panel.innerHTML=`
    <h3>${safeText(p.title)}</h3>
    <p><b>الحالة:</b> <span class="tag ${riskClass(p.risk)}">${riskText(p.risk)}</span></p>
    <p><b>المنقذ:</b> ${safeText(guardName(p.guard))}</p>
    <p><b>تعليمات:</b> ${safeText(p.instruction)}</p>
    ${p.requiredGuards?`<p><b>عدد المنقذين المطلوب:</b> ${safeText(p.requiredGuards)}</p>`:''}
    ${p.marina?`<p class="warn-text"><b>تنبيه:</b> ممنوع النزول تحت المارينا نهائياً.</p>`:''}
  `;
  panel.classList.remove('hidden');
}
function applyAIResult(pack,publish=false){
  DATA.weather.updated=pack.updated||DATA.weather.updated;
  DATA.weather.waveHeight=Number(pack.waveHeight||DATA.weather.waveHeight).toFixed(1).replace('.0','');
  DATA.weather.windSpeed=Math.round(Number(pack.windSpeed||DATA.weather.windSpeed));
  DATA.weather.risk=pack.risk?.score ?? pack.risk ?? DATA.weather.risk;
  DATA.weather.status=pack.risk?.status || pack.status || DATA.weather.status;
  DATA.weather.flag=pack.risk?.flag || pack.flag || DATA.weather.flag;
  DATA.aiReport={
    source:pack.source||'local',updated:pack.updated,waveHeight:pack.waveHeight,windSpeed:pack.windSpeed,
    waveDirection:pack.waveDirection,windDirection:pack.windDirection,temperature:pack.temperature,
    uvIndex:pack.uvIndex,visibility:pack.visibility,level:pack.risk?.level||pack.level,
    score:pack.risk?.score||pack.risk,recommendations:pack.rec||pack.recommendations||[]
  };
  if(publish && pack.publicNews) DATA.publicNews=pack.publicNews;
  save();
}
function aiHtml(){
  const a=DATA.aiReport||{};
  const rec=(a.recommendations||[]).map(x=>`<li>${safeText(x)}</li>`).join('')||'<li>اضغط تحديث حالة البحر الآن لتوليد التوصيات.</li>';
  const lvl=a.level==='high'?'خطر':a.level==='medium'?'متوسط':'منخفض';
  return `<div class="ai-box"><div class="ai-head"><b>AI Risk Engine</b><span class="tag ${a.level==='high'?'danger':a.level==='medium'?'caution':'safe'}">${lvl}</span></div><div class="ai-kpis"><span>الموج: ${safeText(a.waveHeight||DATA.weather.waveHeight)}م</span><span>الرياح: ${safeText(a.windSpeed||DATA.weather.windSpeed)} كم/س</span><span>UV: ${safeText(a.uvIndex??'-')}</span><span>الرؤية: ${safeText(a.visibility??'-')} كم</span></div><ul>${rec}</ul><p class="small">المصدر: ${safeText(a.source||'manual')} | آخر تحديث: ${safeText(a.updated||DATA.weather.updated)}</p></div>`;
}
async function runAI(publish=false){
  const box=$('#aiResult');
  if(box) box.innerHTML='<p class="small">جاري سحب بيانات البحر وتحليل المخاطر...</p>';
  try{
    const yesterday=DATA.incidents.filter(x=>String(x.time||'').includes('أمس')).length;
    const pack=await window.BS_AI.run(DATA.weather,DATA.points,{yesterdayIncidents:yesterday,expectedVisitors:1200,forceUpdate:publish});
    applyAIResult(pack,publish);
    if(box) box.innerHTML=aiHtml();
    renderTables();
    map($('#adminMap'),{});
    if(publish) alert('تم تحديث التقييم ونشر التحذيرات للعملاء.');
  }catch(e){
    console.error(e);
    if(box) box.innerHTML='<p class="small">تعذر تحديث حالة البحر الآن.</p>';
  }
}
const FORECAST_API =
  "https://blue-sentinel-ai.moozasalah138.workers.dev/report";

let WEEK_FORECAST = [];


function renderPublic() {
  menu();

  const shiftText = $("#shiftText");
  const wUpdate = $("#wUpdate");
  const wWind = $("#wWind");
  const wWave = $("#wWave");
  const wRisk = $("#wRisk");
  const statusPill = $("#statusPill");
  const statusCard = $("#statusCard");

  if (shiftText) {
    shiftText.textContent = "Shift " + DATA.shift;
  }

  if (wUpdate) {
    wUpdate.textContent = DATA.weather.updated;
  }

  if (wWind) {
    wWind.textContent = DATA.weather.windSpeed + " km/h";
  }

  if (wWave) {
    wWave.textContent = DATA.weather.waveHeight + " m";
  }

  if (wRisk) {
    wRisk.textContent = DATA.weather.risk + "%";
  }

  if (statusPill) {
    statusPill.textContent = DATA.weather.status;
  }

  if (statusCard) {
    statusCard.textContent = DATA.weather.status;
  }


  const newsContainer = $("#publicNews");

  if (newsContainer) {
    newsContainer.innerHTML = (DATA.publicNews || [])
      .map(item => {
        const warningClass = String(item.type || "").includes("تحذير")
          ? "warn"
          : "";

        return `
          <div class="news-item ${warningClass}">
            <b>${safeText(item.type)}</b>
            ${safeText(item.text)}
          </div>
        `;
      })
      .join("");
  }


  map($("#publicMap"), { public: true });

  const aiContainer = $("#aiPublic");

  if (aiContainer) {
    aiContainer.innerHTML = aiHtml();
  }


  bindGuestFeedback();
  startPublicHeroCarousel();
  startSponsorSlider();
  renderBeachFlag();
  loadWeeklyForecast();
}

async function loadWeeklyForecast() {
  const forecastContainer =
    document.getElementById("forecastCards");

  try {
    if (forecastContainer) {
      forecastContainer.innerHTML = `
        <div class="forecast-loading">
          جاري تحميل توقعات البحر...
        </div>
      `;
    }

    const response = await fetch(
      `${FORECAST_API}?t=${Date.now()}`,
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(
        `Forecast request failed: ${response.status}`
      );
    }

    const data = await response.json();

    WEEK_FORECAST = Array.isArray(data.forecast)
      ? data.forecast
      : [];

    renderForecast();

    const updatedElement =
      document.getElementById("forecastUpdated");

    if (updatedElement) {
      updatedElement.textContent =
        data.updated
          ? `آخر تحديث: ${data.updated}`
          : "";
    }

  } catch (error) {
    console.error(
      "Weekly forecast error:",
      error
    );

    if (forecastContainer) {
      forecastContainer.innerHTML = `
        <div class="forecast-error">
          تعذر تحميل توقعات البحر حاليًا.
        </div>
      `;
    }
  }
}
function renderForecast() {
  const container =
    document.getElementById("forecastCards");

  if (!container) return;

  if (!WEEK_FORECAST.length) {
    container.innerHTML = `
      <div class="forecast-empty">
        لا توجد توقعات متاحة حاليًا.
      </div>
    `;
    return;
  }

  container.innerHTML = WEEK_FORECAST.map(
    (item, index) => {
      const flagEmoji =
        item.flagEmoji ||
        (
          item.flag === "red"
            ? "🔴"
            : item.flag === "yellow"
              ? "🟡"
              : "🟢"
        );

      return `
        <button
          type="button"
          class="forecast-card forecast-${item.flag || "green"}"
          onclick="showForecast(${index})"
        >
          <div class="forecast-card-head">
            <span class="forecast-day">
              ${item.day || item.date}
            </span>

            <span class="forecast-flag">
              ${flagEmoji}
            </span>
          </div>

          <div class="forecast-status">
            ${item.status || "غير محدد"}
          </div>

          <div class="forecast-main-value">
            🌊 ${item.waveHeight ?? "--"} م
          </div>

          <div class="forecast-details">
            <span>
              💨 ${item.windSpeed ?? "--"} كم/س
            </span>

            <span>
              🌡️ ${item.temperature ?? "--"}°
            </span>
          </div>

          <div class="forecast-open">
            عرض التفاصيل
          </div>
        </button>
      `;
    }
  ).join("");
}

function showForecast(index) {
  const item = WEEK_FORECAST[index];

  if (!item) return;

  const modal =
    document.getElementById("forecastModal");

  const modalContent =
    document.getElementById("forecastModalContent");

  if (!modal || !modalContent) return;

  const flagEmoji =
    item.flagEmoji ||
    (
      item.flag === "red"
        ? "🔴"
        : item.flag === "yellow"
          ? "🟡"
          : "🟢"
    );

  modalContent.innerHTML = `
    <button
      type="button"
      class="forecast-modal-close"
      onclick="closeForecastModal()"
      aria-label="إغلاق"
    >
      ×
    </button>

    <div class="forecast-modal-flag">
      ${flagEmoji}
    </div>

    <h3>
      ${item.day || item.date}
    </h3>

    <div class="forecast-modal-status">
      حالة البحر: ${item.status || "غير محدد"}
    </div>

    <div class="forecast-modal-grid">
      <div>
        <span>ارتفاع الموج</span>
        <strong>
          ${item.waveHeight ?? "--"} متر
        </strong>
      </div>

      <div>
        <span>فترة الموج</span>
        <strong>
          ${item.wavePeriod ?? "--"} ثانية
        </strong>
      </div>

      <div>
        <span>سرعة الرياح</span>
        <strong>
          ${item.windSpeed ?? "--"} كم/س
        </strong>
      </div>

      <div>
        <span>درجة الحرارة</span>
        <strong>
          ${item.temperature ?? "--"}°
        </strong>
      </div>

      <div>
        <span>الأشعة فوق البنفسجية</span>
        <strong>
          ${item.uvIndex ?? "--"}
        </strong>
      </div>

      <div>
        <span>مدى الرؤية</span>
        <strong>
          ${item.visibility ?? "--"} كم
        </strong>
      </div>
    </div>

    <div class="forecast-recommendation">
      <strong>التوصية:</strong>

      <p>
        ${item.recommendation || "يرجى اتباع تعليمات فريق الإنقاذ."}
      </p>
    </div>

    <p class="forecast-disclaimer">
      التوقعات استرشادية وقد تتغير حسب حالة البحر
      وتعليمات فريق الإنقاذ.
    </p>
  `;

  modal.classList.add("show");
  document.body.classList.add("modal-open");
}
function getForecastRecommendation(status) {
  if (status === "خطر") {
    return `
      <strong>🚫 توصية السلامة</strong>
      <p>غير مناسب للسباحة، ويجب الالتزام بتعليمات فريق الإنقاذ.</p>
    `;
  }

  if (status === "حذر") {
    return `
      <strong>⚠️ توصية السلامة</strong>
      <p>السباحة بحذر مع مراقبة الأطفال والالتزام بالمناطق المحددة.</p>
    `;
  }

  return `
    <strong>✅ توصية السلامة</strong>
    <p>حالة البحر مناسبة مع الالتزام بتعليمات فريق الإنقاذ.</p>
  `;
}


function closeForecastModal() {
  const modal =
    document.getElementById("forecastModal");

  if (!modal) return;

  modal.classList.remove("show");
  document.body.classList.remove("modal-open");
}


function bindForecastModal() {
  const modal = document.getElementById("forecastModal");
  const closeButton = document.getElementById("forecastClose");

  if (!modal || modal.dataset.bound === "true") return;

  modal.dataset.bound = "true";

  if (closeButton) {
    closeButton.addEventListener("click", closeForecastModal);
  }

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeForecastModal();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeForecastModal();
    }
  });
}
  function startSponsorSlider() {
  const track = document.querySelector(".sponsor-track");

  if (!track) return;

  const slides = track.children;

  if (slides.length <= 1) return;

  let current = 0;

  setInterval(() => {
    current = (current + 1) % slides.length;

    track.style.transform =
      `translateX(${current * 100}%)`;
  }, 2000);
}
function renderAdmin(){
  menu(); pageNav();
  if(location.hash==='#login'||sessionStorage.getItem('bsAdmin')!=='1'){showLogin('admin');return;}
  $('#adminShell')?.classList.remove('hidden');
  $('#adminName')&&($('#adminName').textContent=DATA.supervisor.name);
  map($('#adminMap'),{});
  renderTables();
  bindForms();
  bindGeminiChat();
  const ai=$('#aiResult'); if(ai) ai.innerHTML=aiHtml();
  bindBeachFlagControls();
  renderBeachFlag();
}
function showLogin(type){
  const root=$('#loginRoot'); if(!root)return;
  root.classList.remove('hidden');
  $('#adminShell')?.classList.add('hidden');
  $('#lifeguardShell')?.classList.add('hidden');
  if(type==='admin'){
    root.innerHTML=`<div class="login-box card"><h2>دخول المشرف</h2><div class="field"><label>اسم المستخدم</label><input id="u" placeholder="اكتب اسم المستخدم" autocomplete="off"></div><div class="field"><label>كلمة المرور</label><input id="p" type="password" placeholder="اكتب كلمة المرور" autocomplete="off"></div><button class="btn" id="doLogin">دخول</button><p id="err" class="small"></p></div>`;
    $('#doLogin').onclick=()=>{
      if($('#u').value===DATA.supervisor.username&&$('#p').value===DATA.supervisor.password){sessionStorage.setItem('bsAdmin','1');location.href='admin.html';location.reload();}
      else $('#err').textContent='بيانات الدخول غير صحيحة';
    };
  }
}
function renderTables(){
  const roster=$('#roster');
  if(roster){roster.innerHTML=DATA.points.map(p=>`<tr><td>${safeText(p.no)}</td><td>${safeText(p.title)}</td><td><span class="tag ${riskClass(p.risk)}">${riskText(p.risk)}</span></td><td>${safeText(guardName(p.guard))}</td><td>${safeText(p.instruction)}</td></tr>`).join('');}
  const guards=$('#guardsTable');
  if(guards){
    guards.innerHTML=DATA.lifeguards.map(g=>`<tr><td><input data-k="name" data-id="${safeText(g.id)}" value="${safeText(g.name)}"></td><td><input data-k="phone" data-id="${safeText(g.id)}" value="${safeText(g.phone)}"></td><td><input data-k="salary" data-id="${safeText(g.id)}" value="${safeText(g.salary)}"></td></tr>`).join('');
    $$('input[data-id]',guards).forEach(i=>i.onchange=()=>{let g=DATA.lifeguards.find(x=>x.id===i.dataset.id); if(g){g[i.dataset.k]=i.value; save(); renderTables();}});
  }
  const pointEdit=$('#pointsEdit');
  if(pointEdit){
    pointEdit.innerHTML=DATA.points.map(p=>`<tr><td>${safeText(p.no)}</td><td><input data-p="title" data-id="${safeText(p.id)}" value="${safeText(p.title)}"></td><td><select data-p="risk" data-id="${safeText(p.id)}"><option value="safe" ${p.risk==='safe'?'selected':''}>آمن</option><option value="caution" ${p.risk==='caution'?'selected':''}>حذر</option><option value="danger" ${p.risk==='danger'?'selected':''}>خطر</option></select></td><td><select data-p="guard" data-id="${safeText(p.id)}"><option value="">غير محدد</option>${DATA.lifeguards.map(g=>`<option value="${safeText(g.id)}" ${p.guard===g.id?'selected':''}>${safeText(g.name)}</option>`).join('')}</select></td><td><input data-p="instruction" data-id="${safeText(p.id)}" value="${safeText(p.instruction)}"></td></tr>`).join('');
    $$('[data-p]',pointEdit).forEach(i=>i.onchange=()=>{let p=DATA.points.find(x=>x.id===i.dataset.id); if(p){p[i.dataset.p]=i.value; save(); map($('#adminMap'),{}); renderTables();}});
  }
  $('#incidentsTable')&&($('#incidentsTable').innerHTML=DATA.incidents.map(x=>`<tr><td>${safeText(x.time)}</td><td>${safeText(x.point)}</td><td>${safeText(x.type)}</td><td>${safeText(x.note)}</td><td>${safeText(x.by)}</td></tr>`).join(''));
  $('#requestsTable')&&($('#requestsTable').innerHTML=DATA.requests.map((x,i)=>`<tr><td>${safeText(x.time)}</td><td>${safeText(x.by)}</td><td>${safeText(x.type)}</td><td>${safeText(x.note)}</td><td><select class="status-select ${statusClass(x.status)}" data-req-status="${i}"><option value="مربوط" ${!x.status||x.status==='مربوط'?'selected':''}>مربوط</option><option value="قيد المراجعة" ${x.status==='قيد المراجعة'?'selected':''}>قيد المراجعة</option><option value="مقبول" ${x.status==='مقبول'?'selected':''}>مقبول</option><option value="مرفوض" ${x.status==='مرفوض'?'selected':''}>مرفوض</option><option value="تم الصرف" ${x.status==='تم الصرف'?'selected':''}>تم الصرف</option></select></td></tr>`).join(''));
  $('#suggestionsTable')&&($('#suggestionsTable').innerHTML=(DATA.suggestions||[]).map((x,i)=>`<tr><td>${safeText(x.time)}</td><td>${safeText(x.name)}</td><td>${safeText(x.phone)}</td><td>${safeText(x.type)}</td><td>${safeText(x.note)}</td><td><select class="status-select ${statusClass(x.status)}" data-suggestion-status="${i}"><option value="جديد" ${!x.status||x.status==='جديد'?'selected':''}>جديد</option><option value="جاري المراجعة" ${x.status==='جاري المراجعة'?'selected':''}>جاري المراجعة</option><option value="تم التنفيذ" ${x.status==='تم التنفيذ'?'selected':''}>تم التنفيذ</option><option value="مغلق" ${x.status==='مغلق'?'selected':''}>مغلق</option></select></td></tr>`).join(''));
  $$('[data-req-status]').forEach(sel=>sel.onchange=()=>{const i=Number(sel.dataset.reqStatus); if(DATA.requests[i]){DATA.requests[i].status=sel.value; save(); renderTables();}});
  $$('[data-suggestion-status]').forEach(sel=>sel.onchange=()=>{const i=Number(sel.dataset.suggestionStatus); if(DATA.suggestions[i]){DATA.suggestions[i].status=sel.value; save(); renderTables();}});
}
function bindForms(){
  $('#runAI')&&($('#runAI').onclick=()=>runAI(false));
  $('#runAIPublish')&&($('#runAIPublish').onclick=()=>runAI(true));
  $('#saveWeather')&&($('#saveWeather').onclick=()=>{DATA.weather.updated=$('#weatherTime').value||DATA.weather.updated;DATA.weather.waveHeight=+$('#waveHeight').value||DATA.weather.waveHeight;DATA.weather.windSpeed=+$('#windSpeed').value||DATA.weather.windSpeed;DATA.weather.risk=+$('#riskIndex').value||DATA.weather.risk;DATA.weather.status=$('#seaStatus').value||DATA.weather.status;save();alert('تم حفظ حالة البحر');});
  $('#exportData')&&($('#exportData').onclick=()=>download('blue-sentinel-data.json',JSON.stringify(DATA,null,2),'application/json'));
  $('#resetData')&&($('#resetData').onclick=()=>{if(confirm('رجوع للداتا الأساسية؟')){localStorage.removeItem(LS);DATA=normalizeData(defaultData());save();location.reload();}});
  $('#exportCsv')&&($('#exportCsv').onclick=()=>download('blue-sentinel-report.csv',csv(),'text/csv;charset=utf-8'));
  $('#sheetUrl')&&($('#sheetUrl').value=DATA.sheetsWebhook||'');
  $('#saveSheet')&&($('#saveSheet').onclick=()=>{DATA.sheetsWebhook=$('#sheetUrl').value.trim();save();alert('تم حفظ رابط Google Sheets');});
}
function csv(){
  const rows=[['type','time','by/name','point/phone','request_or_incident','note','status'],...DATA.incidents.map(x=>['incident',x.time,x.by,x.point,x.type,x.note,'']),...DATA.requests.map(x=>['request',x.time,x.by,'',x.type,x.note,x.status||'مربوط']),...(DATA.suggestions||[]).map(x=>['suggestion',x.time,x.name,x.phone,x.type,x.note,x.status||'جديد'])];
  return rows.map(r=>r.map(v=>'"'+String(v||'').replaceAll('"','""')+'"').join(',')).join('\n');
}
function download(name,content,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();}
function renderLifeguard(){
  menu();
  const logged=sessionStorage.getItem('bsGuard');
  if(!logged){showGuardLogin();return;}
  const g=DATA.lifeguards.find(x=>x.id===logged)||DATA.lifeguards[0];
  $('#lifeguardShell')?.classList.remove('hidden');
  $('#guardName')&&($('#guardName').textContent=g.name);
  const assigned=DATA.points.find(p=>p.guard===g.id)||DATA.points[0];
  $('#guardPoint')&&($('#guardPoint').textContent=assigned.title);
  $('#guardInstruction')&&($('#guardInstruction').textContent=assigned.instruction);
  $('#guardSea')&&($('#guardSea').textContent=DATA.weather.status+' | موج '+DATA.weather.waveHeight+'م');
  $('#incidentBtn')&&($('#incidentBtn').onclick=()=>{
    const row={time:new Date().toLocaleString('ar-EG'),by:g.name,point:assigned.title,type:$('#incType').value,note:$('#incNote').value};
    DATA.incidents.unshift(row);
    DATA.publicNews.unshift({type:'حدث جديد',text:`${row.type} في ${row.point} - ${row.note || 'تم تسجيل الحالة بواسطة فريق الإنقاذ.'}`});
    DATA.publicNews=DATA.publicNews.slice(0,6);
    save();
    sheetSubmit({kind:'incident',...row});
    alert('تم تسجيل الحالة وظهورها في أخبار الزوار');
    $('#incNote').value='';
  });
  $('#requestBtn')&&($('#requestBtn').onclick=()=>{
    const row={time:new Date().toLocaleString('ar-EG'),by:g.name,type:$('#reqType').value,note:$('#reqNote').value,status:'مربوط'};
    DATA.requests.unshift(row);
    save();
    sheetSubmit({kind:'request',...row});
    alert('تم إرسال الطلب');
    $('#reqNote').value='';
  });
}
function showGuardLogin(){
  const root=$('#loginRoot');
  if(!root)return;
  root.classList.remove('hidden');
  $('#lifeguardShell')?.classList.add('hidden');
  root.innerHTML=`<div class="login-box card"><h2>دخول المنقذ</h2><div class="field"><label>المنقذ</label><select id="gsel">${DATA.lifeguards.map(g=>`<option value="${safeText(g.id)}">${safeText(g.name)}</option>`).join('')}</select></div><div class="field"><label>كلمة المرور</label><input id="gpw" type="password" placeholder="اكتب كلمة المرور" autocomplete="off"></div><button class="btn" id="glogin">دخول</button><p id="gerr" class="small"></p></div>`;
  $('#glogin').onclick=()=>{if($('#gpw').value===DATA.lifeguardPassword){sessionStorage.setItem('bsGuard',$('#gsel').value);location.reload();}else $('#gerr').textContent='كلمة المرور غير صحيحة';};
}
function bindGeminiChat(){
  const askBtn=$('#askAI'),question=$('#aiQuestion'),answerBox=$('#aiAnswer');
  if(!askBtn||!question||!answerBox)return;
  askBtn.onclick=async()=>{
    const msg=question.value.trim();
    if(!msg){answerBox.innerHTML='اكتب سؤالك الأول.';return;}
    askBtn.disabled=true;
    const oldText=askBtn.textContent;
    askBtn.textContent='جاري...';
    answerBox.innerHTML='جاري التحليل...';
    try{
      const res=await fetch(AI_CHAT_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg,context:{weather:DATA.weather,aiReport:DATA.aiReport||{},points:DATA.points,incidents:DATA.incidents.slice(0,20),suggestions:(DATA.suggestions||[]).slice(0,20),requests:DATA.requests.slice(0,20)}})});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error||('HTTP '+res.status));
      answerBox.innerHTML=(data.answer||'مفيش رد من الذكاء الاصطناعي.').replace(/\n/g,'<br>');
    }catch(err){
      console.error('AI chat error:',err);
      answerBox.innerHTML='فشل الاتصال بالذكاء الاصطناعي.';
    }finally{
      askBtn.disabled=false;
      askBtn.textContent=oldText;
    }
  };
}
function bindGuestFeedback(){
  const btn=$('#guestSend');
  if(!btn)return;
  btn.onclick=async()=>{
    const row={time:new Date().toLocaleString('ar-EG'),name:$('#guestName')?.value.trim()||'',phone:$('#guestPhone')?.value.trim()||'',type:$('#guestType')?.value||'ملاحظة',note:$('#guestNote')?.value.trim()||'',status:'جديد'};
    if(!row.name||!row.phone||!row.note){alert('من فضلك اكتب الاسم ورقم الموبايل والملاحظة');return;}
    DATA.suggestions=DATA.suggestions||[];
    DATA.suggestions.unshift(row);
    save();
    sheetSubmit({kind:'suggestion',...row});
    alert('✅ تم إرسال الرسالة بنجاح، شكرًا لمشاركتك.');
    $('#guestName').value=''; $('#guestPhone').value=''; $('#guestNote').value='';
  };
}
function startPublicHeroCarousel(){
  if(carouselStarted)return;
  const slides=document.querySelectorAll('.public-hero-slide');
  if(!slides.length)return;
  carouselStarted=true;
  let index=0;
  setInterval(()=>{slides[index].classList.remove('active');index=(index+1)%slides.length;slides[index].classList.add('active');},1500);
}
async function boot(view){
  await loadSharedSystem();
  if(view==='public') renderPublic();
  if(view==='admin') renderAdmin();
  if(view==='lifeguard') renderLifeguard();
}
window.BS={
  renderPublic(){return boot('public');},
  renderAdmin(){return boot('admin');},
  renderLifeguard(){return boot('lifeguard');},
  runAI,
  logout(){sessionStorage.clear();location.reload();}
};
  function startSponsorSlider(){

    const track=document.querySelector(".sponsor-track");

    if(!track) return;

    const slides=track.querySelectorAll("img");

    if(!slides.length) return;

    let current=0;

    setInterval(()=>{

        current++;

        if(current>=slides.length){
            current=0;
        }

        track.style.transform=
            `translateX(-${current*100}%)`;

    },2000);

}
const BEACH_FLAG_DATA = {
    green: {
        title: "مسموح بالسباحة",
        description: "حالة البحر مناسبة مع الالتزام بتعليمات فريق الإنقاذ.",
        badge: "آمن",
        badgeColor: "#16a765"
    },

    yellow: {
        title: "السباحة بحذر",
        description: "يرجى توخي الحذر وعدم الابتعاد عن مناطق تواجد المنقذين.",
        badge: "حذر",
        badgeColor: "#d7a800"
    },

    red: {
        title: "ممنوع السباحة",
        description: "حالة البحر غير آمنة. يرجى عدم النزول إلى المياه.",
        badge: "خطر",
        badgeColor: "#d8323c"
    },

    black: {
        title: "الشاطئ مغلق",
        description: "خطر شديد. يمنع دخول المياه حتى إشعار آخر.",
        badge: "مغلق",
        badgeColor: "#171717"
    }
};


function getFlagData(flagValue) {
  const flags = {
    green: {
      value: "green",
      title: "مسموح بالسباحة",
      description: "حالة البحر مناسبة مع الالتزام بتعليمات فريق الإنقاذ.",
      badge: "آمن"
    },

    yellow: {
      value: "yellow",
      title: "السباحة بحذر",
      description: "يجب توخي الحذر ومراقبة الأطفال والالتزام بالمناطق المحددة.",
      badge: "حذر"
    },

    red: {
      value: "red",
      title: "السباحة غير آمنة",
      description: "حالة البحر خطرة ويجب الالتزام بتعليمات فريق الإنقاذ.",
      badge: "خطر"
    },

    black: {
      value: "black",
      title: "الشاطئ مغلق",
      description: "ممنوع النزول إلى البحر حتى صدور تعليمات جديدة.",
      badge: "مغلق"
    }
  };

  return flags[flagValue] || flags.green;
}


function renderBeachFlag() {
  const currentFlag =
    typeof DATA.flag === "string"
      ? DATA.flag
      : DATA.flag?.value || "green";

  const flagData = getFlagData(currentFlag);

  const seaFlag = document.getElementById("seaFlag");
  const flagTitle = document.getElementById("flagTitle");
  const flagDescription = document.getElementById("flagDescription");
  const publicFlagBadge = document.getElementById("publicFlagBadge");
  const adminFlagSelect = document.getElementById("adminFlagSelect");

  if (seaFlag) {
    seaFlag.classList.remove(
      "bs-flag-green",
      "bs-flag-yellow",
      "bs-flag-red",
      "bs-flag-black"
    );

    seaFlag.classList.add(`bs-flag-${flagData.value}`);
  }

  if (flagTitle) {
    flagTitle.textContent = flagData.title;
  }

  if (flagDescription) {
    flagDescription.textContent = flagData.description;
  }

  if (publicFlagBadge) {
    publicFlagBadge.textContent = flagData.badge;
    publicFlagBadge.className =
      `bs-flag-badge bs-flag-badge-${flagData.value}`;
  }

  if (adminFlagSelect) {
    adminFlagSelect.value = flagData.value;
  }
}


async function saveFlag() {
  const select = document.getElementById("adminFlagSelect");
  const button = document.getElementById("saveFlagBtn");
  const message = document.getElementById("flagSaveMessage");

  if (!select) {
    console.error("adminFlagSelect غير موجود");
    return;
  }

  const selectedFlag = select.value;
  const flagData = getFlagData(selectedFlag);

  DATA.flag = flagData.value;

  if (button) {
    button.disabled = true;
    button.textContent = "جارٍ الحفظ...";
  }

  if (message) {
    message.textContent = "";
  }

  try {
    if (typeof saveSharedSystem === "function") {
      await saveSharedSystem();
    } else {
      localStorage.setItem("blueSentinelData", JSON.stringify(DATA));
    }

    renderBeachFlag();

    if (message) {
      message.textContent = "✅ تم حفظ وتحديث حالة العلم بنجاح.";
    }

  } catch (error) {
    console.error("Flag save error:", error);

    if (message) {
      message.textContent = "❌ حدث خطأ أثناء حفظ حالة العلم.";
    }

  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "حفظ حالة العلم";
    }
  }
}


function bindBeachFlagControls() {
  const button = document.getElementById("saveFlagBtn");

  if (!button || button.dataset.bound === "true") {
    return;
  }

  button.dataset.bound = "true";

  button.addEventListener("click", function () {
    saveFlag();
  });
}
  setInterval(() => {
  if (
    document.getElementById("forecastCards")
  ) {
    loadWeeklyForecast();
  }
}, 60 * 60 * 1000);
}  
})();
