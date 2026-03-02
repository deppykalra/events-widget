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
  font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;
  background:#111;
}

.container{
  max-width:720px;
  margin:auto;
  background:white;
}

/* HEADER */

.header{
  background:#000;
  color:white;
  padding:40px 30px;
}

.header h1{
  margin:0;
  font-size:36px;
}

.range{
  opacity:.7;
  margin-top:6px;
}

/* HERO */

.hero{
  position:relative;
}

.hero img{
  width:100%;
  display:block;
}

.hero-title{
  position:absolute;
  bottom:0;
  left:0;
  right:0;
  padding:30px;
  color:white;
  font-size:28px;
  font-weight:700;
  background:linear-gradient(to top, rgba(0,0,0,.85), transparent);
}

/* SECTION */

.section{
  padding:30px;
}

.section h2{
  margin:0 0 20px;
}

/* CARD */

.card{
  display:flex;
  gap:16px;
  margin-bottom:18px;
  padding:14px;
  border-radius:12px;
  background:#fafafa;
}

.card img{
  width:120px;
  height:80px;
  object-fit:cover;
  border-radius:8px;
}

.title{
  font-weight:700;
  margin-bottom:6px;
}

.meta{
  color:#666;
  font-size:14px;
}

/* FOOTER */

.footer{
  text-align:center;
  padding:26px;
  font-size:13px;
  color:#999;
}

</style>
</head>

<body>

<div class="container">

<div class="header">
<h1>Impact Warsaw</h1>
<div class="range">
Weekly Events — ${now.toDateString()} → ${week.toDateString()}
</div>
</div>

${
events[0] ? `
<div class="hero">
<img src="${events[0].image_url}">
<div class="hero-title">${events[0].title}</div>
</div>
` : ""
}

<div class="section">

<h2>This Week</h2>

${events.map(e=>`
<div class="card">
<img src="${e.image_url}">
<div>
<div class="title">${e.title}</div>
<div class="meta">
${new Date(e.starts_at).toLocaleString()}
${e.venue ? " • "+e.venue : ""}
</div>
</div>
</div>
`).join("")}

</div>

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
