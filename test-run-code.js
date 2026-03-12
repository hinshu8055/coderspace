import http from "http";

const data = JSON.stringify({
  language: "cpp",
  code: '#include <iostream>\nint main(){std::cout<<"hello";return 0;}'
});

const req = http.request({
  hostname: "localhost",
  port: 5000,
  path: "/run-code",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data)
  }
}, (res) => {
  let body = "";
  res.on("data", chunk => body += chunk);
  res.on("end", () => {
    console.log("status", res.statusCode);
    console.log("body", body);
  });
});

req.on("error", err => console.error("req error", err));
req.write(data);
req.end();
