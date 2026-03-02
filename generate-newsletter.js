import fs from "fs";
import puppeteer from "puppeteer";

const API="https://fienta.com/api/v1/public/events?organizer=27119";

const res=await fetch(API);
const json=await res.json();

const now=new Date();
const week=new Date();
week.setDate(now.getDate()+7);

const events=json.events.filter(e=>{
  const d=new Date(e.starts_at);
  return d>=now && d<=week;
});

events.sort((a,b)=>new Date(a.starts_at)-new Date(b.starts_at));

const html=`
<html>
<head>
<style>
body{font-family:sans-serif;padding:40px}
h1{margin-bottom:0}
.event{margin:20px 0;padding:16px;border:1px solid #ddd;border-radius:12px}
.date{color:#666;font-size:14px}
</style>
</head>
<body>

<h1>Impact Warsaw Weekly Events</h1>
<p>Here’s what’s happening this week:</p>

${events.map(e=>{
  const d=new Date(e.starts_at);
  return `
  <div class="event">
    <h2>${e.title}</h2>
    <div class="date">
      ${d.toLocaleString()}
      ${e.venue ? " — "+e.venue : ""}
    </div>
  </div>`;
}).join("")}

</body>
</html>
`;

fs.writeFileSync("newsletter.html",html);

const browser = await puppeteer.launch({
  executablePath: "/home/codespace/.cache/puppeteer/chrome/linux-145.0.7632.77/chrome-linux64/chrome",
  args: ["--no-sandbox","--disable-setuid-sandbox"]
});
const page=await browser.newPage();
await page.setContent(html,{waitUntil:"networkidle0"});

await page.pdf({
  path:"newsletter.pdf",
  format:"A4",
  printBackground:true
});

await browser.close();

console.log("PDF generated");
