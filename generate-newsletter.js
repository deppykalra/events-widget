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
  background:#0f0f10;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  color:white;
}

.wrapper{
  max-width:760px;
  margin:auto;
  padding:60px 40px;
}

/* HEADER */

.header{
  text-align:center;
  margin-bottom:50px;
}

.logo{
  width:180px;
  margin-bottom:30px;
}

.divider{
  width:60px;
  height:4px;
  background:#ffd000;
  margin:25px auto;
}

.title{
  font-size:32px;
  font-weight:800;
  letter-spacing:1px;
}

.range{
  margin-top:10px;
  color:#aaa;
  font-size:15px;
}

/* SECTION TITLE */

.section-title{
  font-size:20px;
  text-transform:uppercase;
  letter-spacing:2px;
  margin-bottom:30px;
  color:#ffd000;
}

/* EVENT ROW */

.event{
  display:flex;
  gap:22px;
  margin-bottom:34px;
  padding-bottom:28px;
  border-bottom:1px solid rgba(255,255,255,.08);
}

.event img{
  width:160px;
  height:110px;
  object-fit:cover;
  border-radius:12px;
}

.event-title{
  font-size:20px;
  font-weight:700;
  margin-bottom:8px;
}

.meta{
  color:#bbb;
  font-size:14px;
}

/* EMPTY */

.empty{
  padding:60px 0;
  text-align:center;
  color:#777;
}

/* FOOTER */

.footer{
  margin-top:60px;
  padding-top:30px;
  border-top:1px solid rgba(255,255,255,.1);
  text-align:center;
  font-size:13px;
  color:#777;
}

</style>
</head>

<body>

<div class="wrapper">

<div class="header">

<img class="logo" src="https://raw.githubusercontent.com/deppykalra/events-widget/main/logo.jpeg">

<div class="divider"></div>

<div class="title">THIS WEEK AT IMPACT</div>

<div class="range">
${now.toDateString()} — ${week.toDateString()}
</div>

</div>

${
events.length ? `
<div class="section-title">Lineup</div>

${events.map(e=>`
<div class="event">

<img src="${e.image_url}">

<div>
<div class="event-title">${e.title}</div>
<div class="meta">
${new Date(e.starts_at).toLocaleString()}
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
