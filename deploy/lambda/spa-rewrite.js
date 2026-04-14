function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // Check if the URI is a request for a static file by matching common file extensions.
  // We explicitly match known extensions rather than using a generic dot-check,
  // because orcabus IDs contain dots (e.g., wfr.xxx, fil.xxx, sqs.xxx, lib.xxx).
  if (
    /\.(js|css|html|json|map|ico|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|eot|txt|xml|webmanifest)$/i.test(
      uri
    )
  ) {
    return request;
  }

  if (uri === '/v2' || uri.startsWith('/v2/')) {
    request.uri = '/v2/index.html';
    return request;
  }

  request.uri = '/index.html';
  return request;
}
