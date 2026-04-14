function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // Check if the URI ends with a static file extension (1-10 char extension).
  // This avoids false positives from orcabus IDs containing dots
  // (e.g., wfr.0123456ABC where the part after '.' is 26 chars).
  if (/\.[a-zA-Z0-9]{1,10}$/.test(uri)) {
    return request;
  }

  if (uri === '/v2' || uri.startsWith('/v2/')) {
    request.uri = '/v2/index.html';
    return request;
  }

  request.uri = '/index.html';
  return request;
}
