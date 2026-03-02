import fs from "fs";
import puppeteer from "puppeteer";

const API="https://fienta.com/api/v1/public/events?organizer=27119";

const res=await fetch(API);
const json=await res.json();

const now=new Date();
const week=new Date();
week.setDate(now.getDate()+7);

const events=json.events
.filter(e=>{
  const d=new Date(e.starts_at);
  return d>=now && d<=week;
})
.sort((a,b)=>new Date(a.starts_at)-new Date(b.starts_at));

function formatDate(d){
  return new Date(d).toLocaleString(undefined,{
    weekday:"short",
    day:"numeric",
    month:"short",
    hour:"2-digit",
    minute:"2-digit"
  });
}

const html=`
<html>
<head>
<meta charset="UTF-8">
<style>

body{
  margin:0;
  background:#0f0f10;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
}

/* OUTER FRAME */

.frame{
  padding:60px 0;
}

/* MAIN CARD */

.container{
  max-width:760px;
  margin:auto;
  background:white;
  border-radius:22px;
  padding:50px;
  box-shadow:0 30px 80px rgba(0,0,0,.45);
}

/* HEADER */

.header{
  text-align:center;
  margin-bottom:40px;
}

.logo{
  width:140px;
  margin-bottom:18px;
}

.title{
  font-size:30px;
  font-weight:800;
  margin:0;
}

.range{
  margin-top:8px;
  color:#666;
  font-size:14px;
}

.accent{
  width:50px;
  height:4px;
  background:#ffd000;
  margin:20px auto;
  border-radius:4px;
}

/* SECTION */

.section-title{
  font-size:18px;
  font-weight:700;
  margin:40px 0 24px;
  color:#111;
}

/* EVENT */

.event{
  display:flex;
  gap:18px;
  margin-bottom:24px;
  padding-bottom:24px;
  border-bottom:1px solid #eee;
}

.event:last-child{
  border-bottom:none;
}

.event img{
  width:150px;
  height:100px;
  object-fit:cover;
  border-radius:12px;
}

.event-title{
  font-size:18px;
  font-weight:700;
  margin-bottom:6px;
  color:#111;
}

.meta{
  font-size:14px;
  color:#666;
}

.footer{
  margin-top:40px;
  text-align:center;
  font-size:13px;
  color:#888;
}

.empty{
  padding:50px 0;
  text-align:center;
  color:#777;
}

</style>
</head>

<body>

<div class="frame">

<div class="container">

<div class="header">
<img class="logo" src="https://raw.githubusercontent.com/deppykalra/events-widget/main/logo.jpeg">
<div class="accent"></div>
<div class="title">This Week at Impact</div>
<div class="range">
${now.toDateString()} — ${week.toDateString()}
</div>
</div>

${
events.length
? `
<div class="section-title">Lineup</div>

${events.map(e=>`
<div class="event">
<img src="${e.image_url}">
<div>
<div class="event-title">${e.title}</div>
<div class="meta">
${formatDate(e.starts_at)}
${e.venue ? " • "+e.venue : ""}
</div>
</div>
</div>
`).join("")}
`
:
`<div class="empty">No events scheduled this week</div>`
}

<div class="footer">
impactwarsaw.com
</div>

</div>
</div>

</body>
</html>
`;

fs.writeFileSync("newsletter.html",html);

const browser=await puppeteer.launch({
  args:["--no-sandbox","--disable-setuid-sandbox"]
});

const page=await browser.newPage();
await page.setContent(html,{waitUntil:"networkidle0"});

await page.pdf({
  path:"newsletter.pdf",
  format:"A4",
  printBackground:true,
  margin:{
    top:"20px",
    bottom:"20px",
    left:"20px",
    right:"20px"
  }
});

await browser.close();
console.log("PDF generated");
