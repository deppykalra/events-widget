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
  background:#f4f4f2;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  color:#111;
}

.page{
  max-width:780px;
  margin:60px auto;
  background:white;
  padding:60px;
  border:1px solid #e6e6e6;
}

/* HEADER */

.header{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  margin-bottom:50px;
}

.logo{
  width:120px;
}

.header-right{
  text-align:right;
}

.title{
  font-size:28px;
  font-weight:800;
  margin:0;
}

.range{
  margin-top:6px;
  font-size:14px;
  color:#666;
}

/* SECTION */

.section-title{
  font-size:16px;
  font-weight:700;
  letter-spacing:1px;
  margin-bottom:30px;
  border-bottom:2px solid #ffd000;
  display:inline-block;
  padding-bottom:6px;
}

/* EVENT CARD */

.event{
  display:flex;
  gap:20px;
  padding:22px;
  margin-bottom:22px;
  border:1px solid #e8e8e8;
  border-radius:12px;
}

.event img{
  width:150px;
  height:100px;
  object-fit:cover;
  border-radius:8px;
}

.event-title{
  font-size:18px;
  font-weight:700;
  margin-bottom:6px;
}

.meta{
  font-size:14px;
  color:#666;
}

.footer{
  margin-top:60px;
  text-align:center;
  font-size:13px;
  color:#999;
}

.empty{
  padding:60px 0;
  text-align:center;
  color:#777;
}

</style>
</head>

<body>

<div class="page">

<div class="header">

<img class="logo" src="https://raw.githubusercontent.com/deppykalra/events-widget/main/logo.jpeg">

<div class="header-right">
<div class="title">This Week at Impact</div>
<div class="range">
${now.toDateString()} — ${week.toDateString()}
</div>
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
    top:"0px",
    bottom:"30px",
    left:"30px",
    right:"30px"
  }
});

await browser.close();
console.log("PDF generated");
