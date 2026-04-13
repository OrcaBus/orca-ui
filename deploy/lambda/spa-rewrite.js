function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.includes('.')) {
    return request;
  }

  if (uri === '/v2' || uri.startsWith('/v2/')) {
    request.uri = '/v2/index.html';
    return request;
  }

  request.uri = '/index.html';
  return request;
}
