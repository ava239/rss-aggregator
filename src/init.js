/* eslint-disable no-param-reassign */
import i18next from 'i18next';
import onChange from 'on-change';
import axios from 'axios';
import _ from 'lodash';
import parseRss from './parser';
import render from './render';
import resources from './i18n';
import validate from './validator';

const proxy = 'https://hexlet-allorigins.herokuapp.com/get';
const axiosConfig = { disableCache: true };

const buildFeed = (rss, url) => {
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

  const title = rss.querySelector('channel > title').textContent;
  const description = rss.querySelector('channel > description').textContent.trim();
  const posts = Array.from(rss.querySelectorAll('channel > item')).map(buildItem);

  return { feed: { title, description, url }, posts };
};

const loadPosts = (state, feed) => {
  const { url } = feed;
  axios.get(proxy, { params: { url, ...axiosConfig } })
    .then((result) => {
      const feedData = parseRss(result.data.contents);
      const { posts } = buildFeed(feedData, url);
      const currentIds = state.posts.map((post) => post.link);
      const newPosts = posts.filter((post) => !currentIds.includes(post.link));

      if (newPosts.length === 0) {
        return;
      }

      state.posts = [...newPosts, ...state.posts];
    });
  setTimeout(() => loadPosts(state, feed), 5000);
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
      .then(() => axios.get(proxy, { params: { url, ...axiosConfig } }))
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
          text: 'successfully_loaded',
        };
        setTimeout(() => loadPosts(watchedState, feed), 5000);
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
