export default (rssData) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(rssData, 'application/xml');

  if (!dom.querySelector('rss')) {
    throw new Error('parse_error');
  }
  return dom;
};
