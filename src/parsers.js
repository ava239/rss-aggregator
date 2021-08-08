import _ from 'lodash';

const parseRss = (rssData) => {
  const parser = new DOMParser();
  return parser.parseFromString(rssData, 'application/xml');
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
  if (!rss.querySelector('rss')) {
    throw Error('parse_error');
  }

  const title = rss.querySelector('channel > title').textContent;
  const description = rss.querySelector('channel > description').textContent.trim();
  const posts = Array.from(rss.querySelectorAll('channel > item')).map(buildItem);

  return { feed: { title, description, url }, posts };
};

export default buildFeed;
