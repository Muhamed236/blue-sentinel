(function(){
const LS='blueSentinelDataV4';
const AI_CHAT_URL='https://blue-sentinel-ai.moozasalah138.workers.dev/chat';
let DATA=loadData();
function clone(o){return JSON.parse(JSON.stringify(o))}
function loadData(){try{return JSON.parse(localStorage.getItem(LS))||clone(window.BS_DEFAULT_DATA)}catch(e){return clone(window.BS_DEFAULT_DATA)}}
function save(){localStorage.setItem(LS,JSON.stringify(DATA));}
function $$(s,root=document){return [...root.querySelectorAll(s)]}
function $(s,root=document){return root.querySelector(s)}
function safeText(v){return String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function statusClass(status){return status==='مقبول'?'safe':status==='مرفوض'?'danger':status==='تم الصرف'?'safe':'caution'}
function guardName(id){return (DATA.lifeguards.find(g=>g.id===id)||{}).name||'غير محدد'}
function riskText(r){return r==='danger'?'خطر':r==='caution'?'حذر':'آمن'}
function riskClass(r){return r==='danger'?'danger':r==='caution'?'caution':'safe'}
function menu(){const b=$('#menuBtn'),m=$('#menuPop'); if(!b||!m)return; b.onclick=()=>m.classList.toggle('open'); document.addEventListener('click',e=>{if(!m.contains(e.target)&&!b.contains(e.target))m.classList.remove('open')})}
function pageNav(){ $$('.tab').forEach(btn=>btn.onclick=()=>{ $$('.tab').forEach(x=>x.classList.remove('active')); btn.classList.add('active'); $$('.page').forEach(p=>p.classList.remove('active')); $('#'+btn.dataset.page)?.classList.add('active') }) }
function map(el,opts={}){ if(!el)return; el.innerHTML=''; el.classList.toggle('admin-map',!opts.public); el.classList.toggle('public-clean',!!opts.public);
 const center=document.createElement('div'); center.className='center-line'; el.appendChild(center);
 const shore=document.createElement('div'); shore.className='shore-line'; el.appendChild(shore);
 const zones=[{cls:'danger-zone pay',t:'خطر تحت المارينا',l:16.3,w:5.2,top:51},{cls:'danger-zone east',t:'خطر تحت المارينا',l:81.6,w:4.3,top:49.2}];
 zones.forEach(z=>{const d=document.createElement('div');d.className=z.cls;d.style.left=z.l+'%';d.style.width=z.w+'%';d.style.top=z.top+'%';d.textContent=z.t;el.appendChild(d)});
 const groups=[{t:'PAY WEST',l:7,top:53},{t:'PAY EAST',l:33,top:53},{t:'EAST',l:72,top:53},{t:'MARINA',l:17.5,top:45},{t:'MARINA',l:83,top:44}];
 groups.forEach(g=>{const d=document.createElement('div');d.className='map-group-label';d.style.left=g.l+'%';d.style.top=g.top+'%';d.textContent=g.t;el.appendChild(d)});
 DATA.points.forEach(p=>{const d=document.createElement('button');d.className='point '+riskClass(p.risk)+(p.marina?' marina':'');d.style.left=p.x+'%';d.style.top=p.y+'%';d.title=p.title+' - '+riskText(p.risk);d.innerHTML='<span>'+(!opts.public?p.no:'')+'</span>'; d.onclick=()=>{selectPoint(p,opts)};el.appendChild(d)});
 const leg=document.createElement('div');leg.className='legend';leg.innerHTML='<span><i class="dot safe-bg"></i>آمن</span><span><i class="dot caution-bg"></i>حذر</span><span><i class="dot danger-bg"></i>خطر/مارينا</span><span><i class="dot blue-bg"></i>اضغط للتفاصيل</span>';el.appendChild(leg);
}
function selectPoint(p,opts){ $$('.point').forEach(x=>x.classList.remove('selected')); if(event?.currentTarget) event.currentTarget.classList.add('selected'); const panel=$('#pointDetails'); if(panel){ panel.innerHTML=`<h3>${p.title}</h3><p><b>الحالة:</b> <span class="tag ${riskClass(p.risk)}">${riskText(p.risk)}</span></p><p><b>المنقذ:</b> ${opts.public?'غير ظاهر للزوار':guardName(p.guard)}</p><p><b>تعليمات:</b> ${p.instruction}</p>${p.requiredGuards?`<p><b>عدد المنقذين المطلوب:</b> ${p.requiredGuards}</p>`:''}${p.marina?`<p class="warn-text"><b>تنبيه:</b> ممنوع النزول تحت المارينا نهائياً.</p>`:''}`; panel.classList.remove('hidden'); }}

function applyAIResult(pack, publish=false){
  DATA.weather.updated=pack.updated||DATA.weather.updated;
  DATA.weather.waveHeight=Number(pack.waveHeight||DATA.weather.waveHeight).toFixed(1).replace('.0','');
  DATA.weather.windSpeed=Math.round(Number(pack.windSpeed||DATA.weather.windSpeed));
  DATA.weather.risk=pack.risk?.score ?? pack.risk ?? DATA.weather.risk;
  DATA.weather.status=pack.risk?.status || pack.status || DATA.weather.status;
  DATA.weather.flag=pack.risk?.flag || pack.flag || DATA.weather.flag;
  DATA.aiReport={
    source:pack.source||'local',
    updated:pack.updated,
    waveHeight:pack.waveHeight,
    windSpeed:pack.windSpeed,
    waveDirection:pack.waveDirection,
    windDirection:pack.windDirection,
    temperature:pack.temperature,
    uvIndex:pack.uvIndex,
    visibility:pack.visibility,
    level:pack.risk?.level||pack.level,
    score:pack.risk?.score||pack.risk,
    recommendations:pack.rec||pack.recommendations||[]
  };
  if(publish && pack.publicNews) DATA.publicNews=pack.publicNews;
  save();
}
function aiHtml(){
  const a=DATA.aiReport||{};
  const rec=(a.recommendations||[]).map(x=>`<li>${x}</li>`).join('')||'<li>اضغط تحديث حالة البحر الآن لتوليد التوصيات.</li>';
  const lvl=a.level==='high'?'خطر':a.level==='medium'?'متوسط':'منخفض';
  return `<div class="ai-box"><div class="ai-head"><b>AI Risk Engine</b><span class="tag ${a.level==='high'?'danger':a.level==='medium'?'caution':'safe'}">${lvl}</span></div><div class="ai-kpis"><span>الموج: ${a.waveHeight||DATA.weather.waveHeight}م</span><span>الرياح: ${a.windSpeed||DATA.weather.windSpeed} كم/س</span><span>UV: ${a.uvIndex??'-'}</span><span>الرؤية: ${a.visibility??'-'} كم</span></div><ul>${rec}</ul><p class="small">المصدر: ${a.source||'manual'} | آخر تحديث: ${a.updated||DATA.weather.updated}</p></div>`;
}
async function runAI(publish=false){
  const box=$('#aiResult'); if(box) box.innerHTML='<p class="small">جاري سحب بيانات البحر وتحليل المخاطر...</p>';
  const yesterday=DATA.incidents.filter(x=>String(x.time||'').includes('أمس')).length;
  const pack=await window.BS_AI.run(DATA.weather, DATA.points, {yesterdayIncidents:yesterday, expectedVisitors:1200, forceUpdate:publish});
  applyAIResult(pack,publish);
  if(box) box.innerHTML=aiHtml();
  renderTables(); map($('#adminMap'),{});
  if(publish) alert('تم تحديث التقييم ونشر التحذيرات للعملاء على هذا الجهاز. للنشر العام ارفع data.js أو استخدم Worker/Google Sheets لاحقاً.');
}

function renderPublic(){menu(); $('#shiftText')&&( $('#shiftText').textContent='Shift '+DATA.shift); $('#wUpdate')&&($('#wUpdate').textContent=DATA.weather.updated); $('#wWind')&&($('#wWind').textContent='km/h '+DATA.weather.windSpeed); $('#wWave')&&($('#wWave').textContent='m '+DATA.weather.waveHeight); $('#wRisk')&&($('#wRisk').textContent=DATA.weather.risk+'%'); $('#statusPill')&&($('#statusPill').textContent=DATA.weather.status); const n=$('#publicNews'); if(n){n.innerHTML=DATA.publicNews.map(x=>`<div class="news-item ${x.type.includes('تحذير')?'warn':''}"><b>${x.type}</b>${x.text}</div>`).join('')} map($('#publicMap'),{public:true}); const ai=$('#aiPublic'); if(ai) ai.innerHTML=aiHtml();}
function requireAdmin(){ if(sessionStorage.getItem('bsAdmin')==='1') return true; location.href='admin.html#login'; return false;}
function renderAdmin(){menu(); pageNav(); if(location.hash==='#login'||sessionStorage.getItem('bsAdmin')!=='1'){showLogin('admin'); return} $('#adminShell')?.classList.remove('hidden'); $('#adminName')&&( $('#adminName').textContent=DATA.supervisor.name); map($('#adminMap'),{}); renderTables(); bindForms(); bindGeminiChat(); const ai=$('#aiResult'); if(ai) ai.innerHTML=aiHtml();}
function showLogin(type){ const root=$('#loginRoot'); if(!root)return; root.classList.remove('hidden'); $('#adminShell')?.classList.add('hidden'); $('#lifeguardShell')?.classList.add('hidden'); if(type==='admin'){root.innerHTML=`<div class="login-box card"><h2>دخول المشرف</h2><p class="small">الحساب التجريبي: admin / 1234</p><div class="field"><label>اسم المستخدم</label><input id="u" value="admin"></div><div class="field"><label>كلمة المرور</label><input id="p" type="password" value="1234"></div><button class="btn" id="doLogin">دخول</button><p id="err" class="small"></p></div>`; $('#doLogin').onclick=()=>{if($('#u').value===DATA.supervisor.username&&$('#p').value===DATA.supervisor.password){sessionStorage.setItem('bsAdmin','1');location.href='admin.html';location.reload()}else $('#err').textContent='بيانات الدخول غير صحيحة'} } }
function renderTables(){ const roster=$('#roster'); if(roster){roster.innerHTML=DATA.points.map(p=>`<tr><td>${p.no}</td><td>${p.title}</td><td><span class="tag ${riskClass(p.risk)}">${riskText(p.risk)}</span></td><td>${guardName(p.guard)}</td><td>${p.instruction}</td></tr>`).join('')}
 const guards=$('#guardsTable'); if(guards){guards.innerHTML=DATA.lifeguards.map(g=>`<tr><td><input data-k="name" data-id="${g.id}" value="${g.name}"></td><td><input data-k="phone" data-id="${g.id}" value="${g.phone}"></td><td><input data-k="salary" data-id="${g.id}" value="${g.salary}"></td></tr>`).join(''); $$('input[data-id]',guards).forEach(i=>i.onchange=()=>{let g=DATA.lifeguards.find(x=>x.id===i.dataset.id); g[i.dataset.k]=i.value; save(); renderTables();})}
 const pointEdit=$('#pointsEdit'); if(pointEdit){pointEdit.innerHTML=DATA.points.map(p=>`<tr><td>${p.no}</td><td><input data-p="title" data-id="${p.id}" value="${p.title}"></td><td><select data-p="risk" data-id="${p.id}"><option value="safe" ${p.risk==='safe'?'selected':''}>آمن</option><option value="caution" ${p.risk==='caution'?'selected':''}>حذر</option><option value="danger" ${p.risk==='danger'?'selected':''}>خطر</option></select></td><td><select data-p="guard" data-id="${p.id}"><option value="">غير محدد</option>${DATA.lifeguards.map(g=>`<option value="${g.id}" ${p.guard===g.id?'selected':''}>${g.name}</option>`).join('')}</select></td><td><input data-p="instruction" data-id="${p.id}" value="${p.instruction}"></td></tr>`).join(''); $$('[data-p]',pointEdit).forEach(i=>i.onchange=()=>{let p=DATA.points.find(x=>x.id===i.dataset.id); p[i.dataset.p]=i.value; save(); map($('#adminMap'),{}); renderTables();})}
 $('#incidentsTable')&&($('#incidentsTable').innerHTML=DATA.incidents.map(x=>`<tr><td>${x.time}</td><td>${x.point}</td><td>${x.type}</td><td>${x.note}</td><td>${x.by}</td></tr>`).join(''));
 $('#requestsTable')&&($('#requestsTable').innerHTML=DATA.requests.map((x,i)=>`<tr><td>${safeText(x.time)}</td><td>${safeText(x.by)}</td><td>${safeText(x.type)}</td><td>${safeText(x.note)}</td><td><select class="status-select" data-req-status="${i}"><option ${!x.status||x.status==='جديد'?'selected':''}>جديد</option><option ${x.status==='قيد المراجعة'?'selected':''}>قيد المراجعة</option><option ${x.status==='مقبول'?'selected':''}>مقبول</option><option ${x.status==='مرفوض'?'selected':''}>مرفوض</option><option ${x.status==='تم الصرف'?'selected':''}>تم الصرف</option></select></td></tr>`).join(''));
 $$('[data-req-status]').forEach(sel=>sel.onchange=()=>{const i=Number(sel.dataset.reqStatus); if(DATA.requests[i]){DATA.requests[i].status=sel.value; save(); renderTables();}});
}
function bindForms(){ $('#runAI')&&($('#runAI').onclick=()=>runAI(false)); $('#runAIPublish')&&($('#runAIPublish').onclick=()=>runAI(true));
 $('#saveWeather')&&($('#saveWeather').onclick=()=>{DATA.weather.updated=$('#weatherTime').value||DATA.weather.updated; DATA.weather.waveHeight=+$('#waveHeight').value||DATA.weather.waveHeight; DATA.weather.windSpeed=+$('#windSpeed').value||DATA.weather.windSpeed; DATA.weather.risk=+$('#riskIndex').value||DATA.weather.risk; DATA.weather.status=$('#seaStatus').value||DATA.weather.status; save(); alert('تم حفظ حالة البحر')});
 $('#exportData')&&($('#exportData').onclick=()=>download('blue-sentinel-data.json',JSON.stringify(DATA,null,2),'application/json'));
 $('#resetData')&&($('#resetData').onclick=()=>{if(confirm('رجوع للداتا الأساسية؟')){localStorage.removeItem(LS);DATA=loadData();location.reload()}});
 $('#exportCsv')&&($('#exportCsv').onclick=()=>download('blue-sentinel-report.csv',csv(),'text/csv;charset=utf-8'));
 $('#sheetUrl')&&($('#sheetUrl').value=DATA.sheetsWebhook||''); $('#saveSheet')&&($('#saveSheet').onclick=()=>{DATA.sheetsWebhook=$('#sheetUrl').value.trim();save();alert('تم حفظ رابط Google Sheets')});
}
function csv(){const rows=[['type','time','by','point','request_or_incident','note','status'],...DATA.incidents.map(x=>['incident',x.time,x.by,x.point,x.type,x.note,'']),...DATA.requests.map(x=>['request',x.time,x.by,'',x.type,x.note,x.status||'جديد'])];return rows.map(r=>r.map(v=>'"'+String(v||'').replaceAll('"','""')+'"').join(',')).join('\n')}
function download(name,content,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click()}
async function sheetSubmit(row){ if(!DATA.sheetsWebhook)return; try{await fetch(DATA.sheetsWebhook,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(row)})}catch(e){} }
function renderLifeguard(){menu(); const logged=sessionStorage.getItem('bsGuard'); if(!logged){showGuardLogin();return} const g=DATA.lifeguards.find(x=>x.id===logged)||DATA.lifeguards[0]; $('#lifeguardShell')?.classList.remove('hidden'); $('#guardName')&&( $('#guardName').textContent=g.name); const assigned=DATA.points.find(p=>p.guard===g.id)||DATA.points[0]; $('#guardPoint')&&( $('#guardPoint').textContent=assigned.title); $('#guardInstruction')&&( $('#guardInstruction').textContent=assigned.instruction); $('#guardSea')&&( $('#guardSea').textContent=DATA.weather.status+' | موج '+DATA.weather.waveHeight+'م'); $('#incidentBtn')&&($('#incidentBtn').onclick=()=>{const row={time:new Date().toLocaleString('ar-EG'),by:g.name,point:assigned.title,type:$('#incType').value,note:$('#incNote').value}; DATA.incidents.unshift(row); save(); sheetSubmit({kind:'incident',...row}); alert('تم تسجيل الحالة'); $('#incNote').value=''}); $('#requestBtn')&&($('#requestBtn').onclick=()=>{const row={time:new Date().toLocaleString('ar-EG'),by:g.name,type:$('#reqType').value,note:$('#reqNote').value,status:'جديد'}; DATA.requests.unshift(row); save(); sheetSubmit({kind:'request',...row}); alert('تم إرسال الطلب'); $('#reqNote').value=''})}
function showGuardLogin(){const root=$('#loginRoot'); root.classList.remove('hidden'); $('#lifeguardShell')?.classList.add('hidden'); root.innerHTML=`<div class="login-box card"><h2>دخول المنقذ</h2><p class="small">اختار اسمك وكلمة المرور التجريبية 1234</p><div class="field"><label>المنقذ</label><select id="gsel">${DATA.lifeguards.map(g=>`<option value="${g.id}">${g.name}</option>`).join('')}</select></div><div class="field"><label>كلمة المرور</label><input id="gpw" type="password" value="1234"></div><button class="btn" id="glogin">دخول</button><p id="gerr" class="small"></p></div>`; $('#glogin').onclick=()=>{if($('#gpw').value===DATA.lifeguardPassword){sessionStorage.setItem('bsGuard',$('#gsel').value);location.reload()}else $('#gerr').textContent='كلمة المرور غير صحيحة'}}

function bindGeminiChat(){
  const askBtn=$('#askAI');
  const question=$('#aiQuestion');
  const answerBox=$('#aiAnswer');
  if(!askBtn || !question || !answerBox) return;

  askBtn.onclick=async()=>{
    const msg=question.value.trim();
    if(!msg){answerBox.innerHTML='اكتب سؤالك الأول.'; return;}

    askBtn.disabled=true;
    const oldText=askBtn.textContent;
    askBtn.textContent='جاري...';
    answerBox.innerHTML='جاري التحليل...';

    try{
      const res=await fetch(AI_CHAT_URL,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          message:msg,
          context:{
            weather:DATA.weather,
            aiReport:DATA.aiReport||{},
            points:DATA.points,
            incidents:DATA.incidents.slice(0,20),
            requests:DATA.requests.slice(0,20)
          }
        })
      });
      const data=await res.json();
      if(!res.ok) throw new Error(data.error || ('HTTP '+res.status));
      answerBox.innerHTML=(data.answer||'مفيش رد من الذكاء الاصطناعي.').replace(/\n/g,'<br>');
    }catch(err){
      console.error('Gemini chat error:',err);
      answerBox.innerHTML='فشل الاتصال بـ Gemini. تأكد إن Endpoint /chat موجود في Worker وإن GEMINI_API_KEY مضاف كـ Secret.';
    }finally{
      askBtn.disabled=false;
      askBtn.textContent=oldText;
    }
  };
}

window.BS={renderPublic,renderAdmin,renderLifeguard,runAI,logout(){sessionStorage.clear();location.reload()}};
})();
