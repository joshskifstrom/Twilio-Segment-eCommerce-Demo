import https from 'https';

const DEFAULT_ANONYMOUS_ID = "23fpalo23d_test_11";
const AUTH = 'Basic OHZHSEl3WnBTZnhyYkdhMkhqZHV4bGFHZXZQVkNrV0M3SENkMkNBa2lpVEk1dUlPRy0ySHhqNzRnVlVlUWtpaVM0NVBxUVgySjlodHlidnJZRUx5RERhcUJfUld1MlROYUZwM3lsanB3V1F4U2ZtZjVjMU9CZ1loNzZyRGp1akhTQ0k1MzBVdEJLUzgydzdFcWgwSjlNZXRkcnpobXlkZFB0b2pmRGFqNkdLdE44d1BETDl4UnVyS1VrWVZWVmN2eXF3WVJnSW9mR082YnpZcFJZUjJiWmpDOENlUGx4c1g0SWZENVZteEFTWldVUWFoa2h4UEZfZjdGNkhINHBEVUF3SklVeko0aDZqZEQzSlJ2QmN0NEFIdUNPRT06';

function getSegmentUrls(anonymousId) {
  const anonId = anonymousId || DEFAULT_ANONYMOUS_ID;
  return {
    traits: `https://profiles.segment.com/v1/spaces/spa_7NoLrHoQfgv2NzMpNucoPs/collections/users/profiles/anonymous_id:${anonId}/traits?limit=200`,
    events: `https://profiles.segment.com/v1/spaces/spa_7NoLrHoQfgv2NzMpNucoPs/collections/users/profiles/anonymous_id:${anonId}/events?verbose=true`,
    identifiers: `https://profiles.segment.com/v1/spaces/spa_7NoLrHoQfgv2NzMpNucoPs/collections/users/profiles/anonymous_id:${anonId}/external_ids?limit=25`
  };
}

export default function handler(req, res) {
  const { query, method, url: reqUrl } = req;
  const anonymousId = query.anonymous_id || DEFAULT_ANONYMOUS_ID;
  const segmentUrls = getSegmentUrls(anonymousId);

  let targetUrl;
  if (method === 'GET' && reqUrl.includes('/api/proxy/segment-traits')) {
    targetUrl = segmentUrls.traits;
  } else if (method === 'GET' && reqUrl.includes('/api/proxy/segment-events')) {
    targetUrl = segmentUrls.events;
  } else if (method === 'GET' && reqUrl.includes('/api/proxy/segment-identifiers')) {
    targetUrl = segmentUrls.identifiers;
  } else {
    res.status(404).json({ error: 'Not found' });
    return;
  }

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