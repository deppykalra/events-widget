import fs from "fs";
import puppeteer from "puppeteer";

const API="https://fienta.com/api/v1/public/events?organizer=27119";

const res=await fetch(API);
const json=await res.json();

const now=new Date();
const week=new Date();
week.setDate(now.getDate()+7);

/* FILTER UPCOMING WEEK EVENTS */

const events=json.events
.filter(e=>{
  const d=new Date(e.starts_at);
  return d>=now && d<=week;
})
.sort((a,b)=>new Date(a.starts_at)-new Date(b.starts_at));

/* FORMATTERS */

function formatDate(date){
  return new Date(date).toLocaleString(undefined,{
    weekday:"short",
    day:"numeric",
    month:"short",
    hour:"2-digit",
    minute:"2-digit"
  });
}

/* HTML TEMPLATE */

const html=`
<html>
<head>
<meta charset="UTF-8">
<style>

body{
  margin:0;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  background:#f5f7f9;
  color:#111;
}

.container{
  max-width:720px;
  margin:auto;
  background:white;
  padding:50px;
  box-shadow:0 8px 40px rgba(0,0,0,.08);
}

/* HEADER */

.header{
  text-align:center;
  margin-bottom:40px;
}

.logo{
  width:160px;
  margin-bottom:20px;
}

.title{
  font-size:34px;
  font-weight:800;
  margin:0;
}

.range{
  margin-top:8px;
  color:#777;
  font-size:15px;
}

/* HERO */

.hero{
  margin:40px 0;
  border-radius:18px;
  overflow:hidden;
  box-shadow:0 10px 30px rgba(0,0,0,.12);
}

.hero img{
  width:100%;
  display:block;
}

.hero-content{
  padding:26px;
}

.hero-title{
  font-size:24px;
  font-weight:700;
  margin-bottom:8px;
}

.meta{
  color:#666;
  font-size:14px;
}

/* SECTION TITLE */

.section-title{
  font-size:22px;
  margin:40px 0 18px;
  font-weight:700;
}

/* EVENT CARD */

.card{
  display:flex;
  gap:18px;
  padding:18px;
  margin-bottom:18px;
  border-radius:16px;
  background:#fafafa;
  transition:.2s;
}

.card img{
  width:140px;
  height:95px;
  object-fit:cover;
  border-radius:12px;
}

.card-title{
  font-weight:700;
  font-size:17px;
  margin-bottom:6px;
}

/* EMPTY */

.empty{
  text-align:center;
  padding:60px 0;
  color:#777;
}

/* FOOTER */

.footer{
  text-align:center;
  margin-top:50px;
  padding-top:20px;
  border-top:1px solid #eee;
  font-size:13px;
  color:#999;
}

</style>
</head>

<body>

<div class="container">

<div class="header">

<img class="logo" src="https://raw.githubusercontent.com/deppykalra/events-widget/main/logo.jpeg">

<div class="title">Weekly Events</div>

<div class="range">
${now.toDateString()} — ${week.toDateString()}
</div>

</div>

${
events.length ? `
<div class="hero">
<img src="${events[0].image_url}">
<div class="hero-content">
<div class="hero-title">${events[0].title}</div>
<div class="meta">
${new Date(events[0].starts_at).toLocaleString()}
${events[0].venue ? " • "+events[0].venue : ""}
</div>
</div>
</div>

<div class="section-title">Upcoming This Week</div>

${events.slice(1).map(e=>`
<div class="card">
<img src="${e.image_url}">
<div>
<div class="card-title">${e.title}</div>
<div class="meta">
${new Date(e.starts_at).toLocaleString()}
${e.venue ? " • "+e.venue : ""}
</div>
</div>
</div>
`).join("")}
` : `
<div class="empty">
No events scheduled this week
</div>
`
}

<div class="footer">
impactwarsaw.com
</div>

</div>

</body>
</html>
`;
/* SAVE HTML */

fs.writeFileSync("newsletter.html",html);

/* GENERATE PDF */

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
