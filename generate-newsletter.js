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
  font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;
  background:#eef1f4;
}

.wrapper{
  max-width:720px;
  margin:auto;
  background:white;
  padding:40px;
}

/* HEADER */

.header{
  text-align:center;
  border-bottom:4px solid #ffd000;
  padding-bottom:18px;
}

.title{
  font-size:34px;
  margin:0;
  font-weight:800;
}

.range{
  color:#666;
  margin-top:6px;
}

/* HERO */

.hero{
  margin:30px 0;
  border-radius:18px;
  overflow:hidden;
  box-shadow:0 12px 40px rgba(0,0,0,.12);
}

.hero img{
  width:100%;
  display:block;
}

.hero-content{
  padding:22px;
}

.hero-title{
  font-size:24px;
  margin:0 0 8px;
}

.meta{
  color:#666;
  font-size:14px;
}

/* LIST */

.section-title{
  font-size:22px;
  margin:40px 0 14px;
}

.card{
  display:flex;
  gap:16px;
  padding:16px;
  border-radius:14px;
  border:1px solid #eee;
  margin-bottom:16px;
}

.card img{
  width:130px;
  height:90px;
  object-fit:cover;
  border-radius:10px;
}

.card h3{
  margin:0 0 6px;
  font-size:18px;
}

/* EMPTY */

.empty{
  padding:40px;
  text-align:center;
  color:#777;
}

/* FOOTER */

.footer{
  margin-top:50px;
  text-align:center;
  font-size:13px;
  color:#777;
}

</style>
</head>

<body>

<div class="wrapper">

<div class="header">
<div class="title">Impact Warsaw Events</div>
<div class="range">
${now.toDateString()} — ${week.toDateString()}
</div>
</div>

${
events.length
? `
<div class="hero">
<img src="${events[0].image_url || ""}">
<div class="hero-content">
<div class="hero-title">${events[0].title}</div>
<div class="meta">
${formatDate(events[0].starts_at)}
${events[0].venue ? " • "+events[0].venue : ""}
</div>
</div>
</div>

<div class="section-title">Upcoming This Week</div>

${events.slice(1).map(e=>`
<div class="card">
<img src="${e.image_url || ""}">
<div>
<h3>${e.title}</h3>
<div class="meta">
${formatDate(e.starts_at)}
${e.venue ? " • "+e.venue : ""}
</div>
</div>
</div>
`).join("")}
`
: `
<div class="empty">
No events scheduled this week.
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
