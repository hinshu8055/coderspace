import http from 'http';

async function send(lang, code) {
  const data = JSON.stringify({ language: lang, code });

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/run-code',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        console.log(`${lang} -> ${res.statusCode}: ${body}`);
        resolve();
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  await send('cpp', '#include <iostream>\nint main(){std::cout<<"cpp";return 0;}');
  await send('python', 'print("python")');
  await send('javascript', 'console.log("javascript")');
  await send('java', 'public class Main { public static void main(String[] a){ System.out.println("java"); }}');
})();
