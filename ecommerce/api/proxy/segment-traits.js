import https from 'https';

const DEFAULT_ANONYMOUS_ID = "23fpalo23d_test_11";
const AUTH = 'Basic OHZHSEl3WnBTZnhyYkdhMkhqZHV4bGFHZXZQVkNrV0M3SENkMkNBa2lpVEk1dUlPRy0ySHhqNzRnVlVlUWtpaVM0NVBxUVgySjlodHlidnJZRUx5RERhcUJfUld1MlROYUZwM3lsanB3V1F4U2ZtZjVjMU9CZ1loNzZyRGp1akhTQ0k1MzBVdEJLUzgydzdFcWgwSjlNZXRkcnpobXlkZFB0b2pmRGFqNkdLdE44d1BETDl4UnVyS1VrWVZWVmN2eXF3WVJnSW9mR082YnpZcFJZUjJiWmpDOENlUGx4c1g0SWZENVZteEFTWldVUWFoa2h4UEZfZjdGNkhINHBEVUF3SklVeko0aDZqZEQzSlJ2QmN0NEFIdUNPRT06';

export default function handler(req, res) {
  const { query, method } = req;
  const anonymousId = query.anonymous_id || DEFAULT_ANONYMOUS_ID;
  if (method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const targetUrl = `https://profiles.segment.com/v1/spaces/spa_7NoLrHoQfgv2NzMpNucoPs/collections/users/profiles/anonymous_id:${anonymousId}/traits?limit=200`;
  const headers = {
    'Authorization': AUTH,
    'Host': 'profiles.segment.com'
  };
  https.get(targetUrl, { headers }, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.status(200).send(data);
    });
  }).on('error', err => {
    res.status(500).json({ error: 'Failed to fetch from Segment', details: err.message });
  });
} 