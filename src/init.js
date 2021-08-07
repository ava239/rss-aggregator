import i18next from 'i18next';
import onChange from 'on-change';
import axios from 'axios';
import lodash from 'lodash';
import parseRss from './parser';
import render from './render';
import resources from './i18n';
import validate from './validator';

const proxy = 'https://hexlet-allorigins.herokuapp.com/get';

const buildFeed = (rss, url) => {
  const buildItem = (item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    const guid = item.querySelector('guid');
    const id = lodash.uniqueId();

    return {
      title, description, link, guid, id,
    };
  };

  const title = rss.querySelector('channel > title').textContent;
  const description = rss.querySelector('channel > description').textContent.trim();
  const posts = Array.from(rss.querySelectorAll('channel > item')).map(buildItem);

  return { feed: { title, description, url }, posts };
};

export default () => i18next.init({
  lng: 'ru',
  debug: false,
  resources,
}).then(() => {
  const state = {
    form: {
      message: {
        type: null,
        text: '',
      },
      state: 'filling',
    },
    feeds: [],
    posts: [],
  };
  const watchedState = onChange(state, (path, value) => render(watchedState, path, value));
  const form = document.querySelector('form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.state = 'submitting';

    const formData = new FormData(e.target);
    const url = formData.get('url');
    validate(formData.get('url'))
      .catch(({ errors }) => {
        const [validationMessage] = errors;
        throw new Error(validationMessage);
      })
      .then(() => {
        const alreadyExists = state.feeds.find((feed) => feed.url === url);
        if (alreadyExists) {
          throw new Error('already_exists');
        }
      })
      .then(() => axios.get(proxy, { params: { url, disableCache: 'true' } }))
      .catch((err) => {
        if (err.isAxiosError) {
          throw new Error('network_error');
        }
        throw err;
      })
      .then((result) => {
        const feedData = parseRss(result.data.contents);
        const { feed, posts } = buildFeed(feedData, url);
        watchedState.feeds = [feed, ...watchedState.feeds];
        watchedState.posts = [...posts, ...watchedState.posts];
        watchedState.form.state = 'submitted';
        watchedState.form.message = {
          type: 'success',
          text: 'success_load',
        };
      })
      .catch((error) => {
        watchedState.form.state = 'failed';
        watchedState.form.message = {
          type: 'error',
          text: error.message,
        };
        throw error;
      });
  });

  render(watchedState);
});
