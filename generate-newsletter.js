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
  background:#111214;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  color:white;
}

.wrapper{
  max-width:760px;
  margin:40px auto;
  padding:50px;
  background:#18191c;
  border-radius:20px;
  box-shadow:0 20px 60px rgba(0,0,0,.5);
}

/* HEADER */

.header{
  text-align:center;
  margin-bottom:50px;
}

.logo{
  width:170px;
  margin-bottom:26px;
}

.divider{
  width:70px;
  height:4px;
  background:#ffd000;
  margin:26px auto;
}

.title{
  font-size:34px;
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
  font-size:18px;
  letter-spacing:2px;
  margin-bottom:26px;
  color:#ffd000;
}

/* EVENT CARD */

.event{
  display:flex;
  gap:22px;
  margin-bottom:20px;
  padding:18px;
  border-radius:16px;
  background:#222327;
  box-shadow:0 6px 18px rgba(0,0,0,.35);
}

.event img{
  width:150px;
  height:100px;
  object-fit:cover;
  border-radius:10px;
}

.event-title{
  font-size:19px;
  font-weight:700;
  margin-bottom:6px;
}

.meta{
  color:#b7b7b7;
  font-size:14px;
}

/* EMPTY */

.empty{
  padding:60px 0;
  text-align:center;
  color:#888;
}

/* FOOTER */

.footer{
  margin-top:60px;
  padding-top:26px;
  border-top:1px solid rgba(255,255,255,.08);
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
