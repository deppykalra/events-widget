import fs from "fs";
import puppeteer from "puppeteer";

const API="https://fienta.com/api/v1/public/events?organizer=27119";

const res=await fetch(API);
const json=await res.json();

const now=new Date();
const week=new Date();
week.setDate(now.getDate()+7);

/* FILTER WEEK EVENTS */

const events=json.events
.filter(e=>{
  const d=new Date(e.starts_at);
  return d>=now && d<=week;
})
.sort((a,b)=>new Date(a.starts_at)-new Date(b.starts_at));

/* FEATURED LOGIC = FIRST COMEDY */

let featured = events.find(e =>
  e.title.toLowerCase().includes("comedy")
);

if(!featured && events.length){
  featured = events[0];
}

const rest = events.filter(e=>e!==featured);

/* DATE FORMAT */

function formatDate(d){
  return new Date(d).toLocaleString(undefined,{
    weekday:"short",
    day:"numeric",
    month:"short",
    hour:"2-digit",
    minute:"2-digit"
  });
}

/* TEMPLATE */

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
  margin:30px auto;
  padding:40px;
  background:#18191c;
  border-radius:18px;
  box-shadow:0 20px 60px rgba(0,0,0,.5);
}

/* HEADER */

.header{
  text-align:center;
  margin-bottom:36px;
}

.logo{
  width:150px;
  margin-bottom:18px;
}

.divider{
  width:60px;
  height:4px;
  background:#ffd000;
  margin:18px auto;
}

.title{
  font-size:28px;
  font-weight:800;
  letter-spacing:1px;
}

.range{
  margin-top:8px;
  color:#aaa;
  font-size:14px;
}

/* FEATURED */

.featured{
  margin:35px 0 45px;
  background:#222327;
  border-radius:16px;
  overflow:hidden;
  box-shadow:0 10px 40px rgba(0,0,0,.6);
}

.featured img{
  width:100%;
  display:block;
}

.featured-content{
  padding:24px;
}

.featured-title{
  font-size:24px;
  font-weight:800;
  margin-bottom:10px;
}

.meta{
  color:#bbb;
  font-size:14px;
}

/* SECTION */

.section-title{
  color:#ffd000;
  font-size:17px;
  letter-spacing:2px;
  margin-bottom:26px;
}

/* EVENT ROW */

.event{
  display:flex;
  gap:20px;
  padding:18px;
  margin-bottom:18px;
  border-radius:14px;
  background:#222327;
}

.event img{
  width:140px;
  height:95px;
  object-fit:cover;
  border-radius:10px;
}

.event-title{
  font-size:18px;
  font-weight:700;
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
  margin-top:60px;
  padding-top:24px;
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
featured ? `
<div class="featured">

<img src="${featured.image_url}">

<div class="featured-content">

<div class="featured-title">
${featured.title}
</div>

<div class="meta">
${formatDate(featured.starts_at)}
${featured.venue ? " • "+featured.venue : ""}
</div>

</div>
</div>
` : ""
}

${
rest.length ? `
<div class="section-title">LINEUP</div>

${rest.map(e=>`
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
