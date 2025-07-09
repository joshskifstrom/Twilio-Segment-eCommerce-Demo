const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3001;
const DEFAULT_ANONYMOUS_ID = "23fpalo23d_test_11"; // fallback anonymous id
const AUTH = 'Basic OHZHSEl3WnBTZnhyYkdhMkhqZHV4bGFHZXZQVkNrV0M3SENkMkNBa2lpVEk1dUlPRy0ySHhqNzRnVlVlUWtpaVM0NVBxUVgySjlodHlidnJZRUx5RERhcUJfUld1MlROYUZwM3lsanB3V1F4U2ZtZjVjMU9CZ1loNzZyRGp1akhTQ0k1MzBVdEJLUzgydzdFcWgwSjlNZXRkcnpobXlkZFB0b2pmRGFqNkdLdE44d1BETDl4UnVyS1VrWVZWVmN2eXF3WVJnSW9mR082YnpZcFJZUjJiWmpDOENlUGx4c1g0SWZENVZteEFTWldVUWFoa2h4UEZfZjdGNkhINHBEVUF3SklVeko0aDZqZEQzSlJ2QmN0NEFIdUNPRT06';

function getSegmentUrls(anonymousId) {
  const anonId = anonymousId || DEFAULT_ANONYMOUS_ID;
  return {
    traits: `https://profiles.segment.com/v1/spaces/spa_7NoLrHoQfgv2NzMpNucoPs/collections/users/profiles/anonymous_id:${anonId}/traits?limit=200`,
    events: `https://profiles.segment.com/v1/spaces/spa_7NoLrHoQfgv2NzMpNucoPs/collections/users/profiles/anonymous_id:${anonId}/events?verbose=true`,
    identifiers: `https://profiles.segment.com/v1/spaces/spa_7NoLrHoQfgv2NzMpNucoPs/collections/users/profiles/anonymous_id:${anonId}/external_ids?limit=25`
  };
}

function proxyGET(res, url) {
  const headers = {
    'Authorization': AUTH,
    'Host': 'profiles.segment.com'
  };
  const apiReq = https.request(url, { headers }, apiRes => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      });
      res.end(data);
    });
  });
  apiReq.on('error', err => {
    res.writeHead(500, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    });
    res.end(JSON.stringify({ error: 'Failed to fetch from Segment', details: err.message }));
  });
  apiReq.end();
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const anonymousId = parsedUrl.query.anonymous_id || DEFAULT_ANONYMOUS_ID;
  const segmentUrls = getSegmentUrls(anonymousId);

  if (req.method === 'GET' && parsedUrl.pathname === '/segment-traits') {
    proxyGET(res, segmentUrls.traits);
  } else if (req.method === 'GET' && parsedUrl.pathname === '/segment-events') {
    proxyGET(res, segmentUrls.events);
  } else if (req.method === 'GET' && parsedUrl.pathname === '/segment-identifiers') {
    proxyGET(res, segmentUrls.identifiers);
  } else {
    res.writeHead(404, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Simple proxy server running on http://localhost:${PORT}`);
  console.log(`Using anonymous ID: ${DEFAULT_ANONYMOUS_ID}`);
});