import _ from 'lodash';

const parseRss = (rssData) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(rssData, 'application/xml');

  if (!dom.querySelector('rss')) {
    throw new Error('parse_error');
  }
  return dom;
};

const buildFeed = (rssData, url) => {
  const buildItem = (item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    const guid = item.querySelector('guid');
    const id = _.uniqueId();

    return {
      title, description, link, guid, id,
    };
  };

  const rss = parseRss(rssData);

  const title = rss.querySelector('channel > title').textContent;
  const description = rss.querySelector('channel > description').textContent.trim();
  const posts = Array.from(rss.querySelectorAll('channel > item')).map(buildItem);

  return { feed: { title, description, url }, posts };
};

export default buildFeed;
