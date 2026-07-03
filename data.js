window.BS_DEFAULT_DATA = {
  projectName:'Blue Sentinel',
  subtitle:'Beach Safety System',
  shift:'09:00 - 19:00',
  location:'KM 170 Alexandria - Marsa Matrouh Rd, Al Dabaa',
  supervisor:{username:'admin', password:'1234', name:'مشرف عام'},
  lifeguardPassword:'1234',
  weather:{updated:'09:00', waveHeight:0.6, windSpeed:18, risk:38, status:'البحر مفتوح بحذر', flag:'yellow'},
  aiReport:{source:'initial',updated:'09:00',waveHeight:0.6,windSpeed:18,uvIndex:6,visibility:10,level:'medium',score:38,recommendations:['السباحة داخل المناطق المحددة فقط.','زيادة متابعة المارينا ومنع النزول تحتها نهائياً.','توزيع طبيعي مع مراقبة نقاط الحافة.']},
  publicNews:[
    {type:'توصية', text:'السباحة داخل المناطق المحددة فقط وتحت متابعة المنقذين.'},
    {type:'تحذير', text:'ممنوع النزول تحت أي مارينا نهائياً - خطر درجة أولى.'},
    {type:'تشغيل', text:'الشيفت الرسمي من 9 صباحاً حتى 7 مساءً.'}
  ],
  lifeguards:[
    {id:'lg0', name:'غير محدد', phone:'', salary:0, role:'منقذ'},
    {id:'lg1', name:'محمد صلاح', phone:'', salary:0, role:'منقذ'},
    {id:'lg2', name:'أحمد علاء', phone:'', salary:0, role:'منقذ'},
    {id:'lg3', name:'محمد النوبي', phone:'', salary:0, role:'منقذ'},
    {id:'lg4', name:'اسلام عمر', phone:'', salary:0, role:'منقذ'},
    {id:'lg5', name:'سامح احمد', phone:'', salary:0, role:'منقذ'},
    {id:'lg6', name:'بلال ابراهيم', phone:'', salary:0, role:'منقذ'},
    {id:'lg7', name:'اسلام خلف', phone:'', salary:0, role:'منقذ'},
    {id:'lg8', name:'رضي خلف', phone:'', salary:0, role:'منقذ'},
    {id:'lg9', name:'اسلام محمود', phone:'', salary:0, role:'منقذ'},
    {id:'lg10', name:'عبدالرحمن صديق', phone:'', salary:0, role:'منقذ'},
    {id:'lg11', name:'عبدالله منتصر', phone:'', salary:0, role:'منقذ'},
    {id:'lg12', name:'اسلام ابوالحجاج', phone:'', salary:0, role:'منقذ'},
    {id:'lg13', name:'محمد ناجح', phone:'', salary:0, role:'منقذ'}
  ],
  points:[
    // PAY WEST shore points
    {id:'payw1', no:'PW1', zone:'PAY WEST', title:'PAY-WEST-1', x:4.8, y:63.8, risk:'safe', guard:'lg1', instruction:'متابعة نزول العملاء في بداية قطاع PAY WEST.'},
    {id:'payw2', no:'PW2', zone:'PAY WEST', title:'PAY-WEST-2', x:7.9, y:63.8, risk:'safe', guard:'lg2', instruction:'متابعة الأطفال ومنع الخروج خارج منطقة السباحة.'},
    {id:'payw3', no:'PW3', zone:'PAY WEST', title:'PAY-WEST-3', x:11.6, y:63.8, risk:'safe', guard:'lg3', instruction:'متابعة حركة الموج القريبة من الشاطئ.'},
    {id:'payw4', no:'PW4', zone:'PAY WEST', title:'PAY-WEST-4', x:15.5, y:63.8, risk:'safe', guard:'lg4', instruction:'نقطة متابعة عامة في PAY WEST.'},
    {id:'payw5', no:'PW5', zone:'PAY WEST', title:'PAY-WEST-5', x:20.0, y:63.8, risk:'safe', guard:'lg5', instruction:'نقطة ما قبل مارينا PAY، متابعة حركة العملاء.'},

    // PAY marina - 2 lifeguards
    {id:'paym1', no:'PM1', zone:'PAY MARINA', title:'PAY-MARINA-1', x:17.9, y:56.8, risk:'danger', guard:'lg6', requiredGuards:2, marina:true, instruction:'مارينا PAY: مسموح القفز فقط عند الراية الخضراء. ممنوع النزول تحت المارينا نهائياً.'},
    {id:'paym2', no:'PM2', zone:'PAY MARINA', title:'PAY-MARINA-2', x:18.9, y:51.8, risk:'danger', guard:'', requiredGuards:2, marina:true, instruction:'المنقذ الثاني على مارينا PAY. التركيز على منع أي عميل من النزول تحت المارينا.'},

    // PAY EAST shore points
    {id:'paye1', no:'PE1', zone:'PAY EAST', title:'PAY-EAST-1', x:25.6, y:63.8, risk:'safe', guard:'', instruction:'بداية قطاع PAY EAST.'},
    {id:'paye2', no:'PE2', zone:'PAY EAST', title:'PAY-EAST-2', x:31.0, y:63.5, risk:'safe', guard:'', instruction:'نقطة متابعة عامة.'},
    {id:'paye3', no:'PE3', zone:'PAY EAST', title:'PAY-EAST-3', x:35.6, y:63.4, risk:'safe', guard:'', instruction:'نقطة متابعة عامة.'},
    {id:'paye4', no:'PE4', zone:'PAY EAST', title:'PAY-EAST-4', x:41.3, y:63.2, risk:'safe', guard:'', instruction:'نقطة متابعة عامة.'},
    {id:'paye5', no:'PE5', zone:'PAY EAST', title:'PAY-EAST-5', x:46.0, y:63.2, risk:'safe', guard:'', instruction:'نقطة متابعة عامة.'},
    {id:'paye6', no:'PE6', zone:'PAY EAST', title:'PAY-EAST-6', x:51.2, y:63.1, risk:'safe', guard:'', instruction:'نقطة نهاية قطاع PAY قبل الفاصل.'},

    // EAST shore points
    {id:'east1', no:'E1', zone:'EAST', title:'EAST-1', x:59.5, y:62.0, risk:'safe', guard:'', instruction:'بداية قطاع EAST.'},
    {id:'east2', no:'E2', zone:'EAST', title:'EAST-2', x:61.3, y:62.0, risk:'safe', guard:'', instruction:'نقطة متابعة عامة.'},
    {id:'east3', no:'E3', zone:'EAST', title:'EAST-3', x:64.6, y:62.0, risk:'safe', guard:'', instruction:'نقطة متابعة عامة.'},
    {id:'east4', no:'E4', zone:'EAST', title:'EAST-4', x:66.4, y:62.0, risk:'safe', guard:'', instruction:'نقطة متابعة عامة.'},
    {id:'east5', no:'E5', zone:'EAST', title:'EAST-5', x:69.8, y:61.4, risk:'safe', guard:'', instruction:'نقطة متابعة عامة.'},
    {id:'east6', no:'E6', zone:'EAST', title:'EAST-6', x:71.8, y:61.4, risk:'safe', guard:'', instruction:'نقطة متابعة عامة.'},
    {id:'east7', no:'E7', zone:'EAST', title:'EAST-7', x:74.5, y:61.0, risk:'safe', guard:'', instruction:'نقطة متابعة عامة.'},
    {id:'east8', no:'E8', zone:'EAST', title:'EAST-8', x:76.4, y:61.0, risk:'safe', guard:'', instruction:'نقطة متابعة عامة.'},
    {id:'east9', no:'E9', zone:'EAST', title:'EAST-9', x:79.0, y:61.4, risk:'safe', guard:'', instruction:'نقطة متابعة عامة.'},
    {id:'east10', no:'E10', zone:'EAST', title:'EAST-10', x:81.0, y:61.6, risk:'safe', guard:'', instruction:'نقطة ما قبل مارينا EAST.'},

    // EAST marina - 2 lifeguards
    {id:'eastm1', no:'EM1', zone:'EAST MARINA', title:'EAST-MARINA-1', x:83.2, y:55.0, risk:'danger', guard:'', requiredGuards:2, marina:true, instruction:'مارينا EAST: عدد 2 منقذين. ممنوع النزول تحت المارينا نهائياً.'},
    {id:'eastm2', no:'EM2', zone:'EAST MARINA', title:'EAST-MARINA-2', x:84.0, y:50.8, risk:'danger', guard:'', requiredGuards:2, marina:true, instruction:'المنقذ الثاني على مارينا EAST. التركيز على منع القفز أو النزول إلا حسب تعليمات الراية.'}
  ],
  incidents:[],
  requests:[],
  sheetsWebhook:'https://script.google.com/macros/s/AKfycbz93ASAgtrbsY7Vo5GmHFJE8pRRlGvm8DXn39DRKzrTDIUyhb2x14hMz8ARpQJSCcxAfg/exec'
};
