(function () {
  // ── Replace with your actual values ──
  var ENDPOINT = "http://localhost:3000/track";
  var DOMAIN_ID = ""; // your domain's UUID from Supabase
  var USER_ID = "";   // the site owner's user_id from Supabase

  function getDeviceType() {
    var ua = navigator.userAgent;
    if (/Mobi|Android/i.test(ua)) return "Mobile";
    if (/Tablet|iPad/i.test(ua)) return "Tablet";
    return "Desktop";
  }

  function getBrowser() {
    var ua = navigator.userAgent;
    if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
    if (ua.includes("Edg")) return "Edge";
    return "Other";
  }

  function getOS() {
    var ua = navigator.userAgent;
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac")) return "macOS";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
    return "Unknown";
  }

  var data = {
    domain_id: DOMAIN_ID,
    user_id: USER_ID,
    url: window.location.href,
    title: document.title,
    referrer: document.referrer || "Direct",
    browser: getBrowser(),
    os: getOS(),
    device: getDeviceType(),
    screen: screen.width + "x" + screen.height,
    language: navigator.language,
  };

  fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    keepalive: true,
  }).catch(function () {});
})();
