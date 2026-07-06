const net = require('net');
const client = net.createConnection({ host: 'ais-dev-wpjwtgziryxh2xindyq5sy-500038229837.asia-northeast1.run.app', port: 80 }, () => {
  client.write('GET /[] HTTP/1.1\r\nHost: ais-dev-wpjwtgziryxh2xindyq5sy-500038229837.asia-northeast1.run.app\r\n\r\n');
});
client.on('data', (data) => {
  console.log(data.toString());
  client.end();
});
