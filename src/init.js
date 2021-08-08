/* eslint-disable no-param-reassign */
import axios from 'axios';
import 'bootstrap';
import i18next from 'i18next';
import onChange from 'on-change';
import buildFeed from './parsers';
import render from './render';
import resources from './i18n';
import validate from './validator';

const proxy = 'https://hexlet-allorigins.herokuapp.com/get';
const axiosConfig = { disableCache: true };

const loadPosts = (state, feed) => {
  const { url } = feed;
  axios.get(proxy, { params: { url, ...axiosConfig } })
    .then((result) => {
      const { posts } = buildFeed(result.data.contents, url);
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
      state: '',
    },
    modal: {
      title: '',
      body: '',
      link: '',
    },
    feeds: [],
    posts: [],
    readPosts: [],
  };
  const watchedState = onChange(state, (path, value) => render(watchedState, path, value));
  watchedState.form.state = 'filling';

  const form = document.querySelector('form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.state = 'submitting';

    const formData = new FormData(e.target);
    const url = formData.get('url');
    validate(formData.get('url'))
      .catch(({ errors }) => {
        const [validationMessage] = errors;
        throw Error(validationMessage);
      })
      .then(() => {
        const alreadyExists = state.feeds.find((feed) => feed.url === url);
        if (alreadyExists) {
          throw Error('already_exists');
        }
      })
      .then(() => axios.get(proxy, { params: { url, ...axiosConfig } }))
      .catch((err) => {
        if (err.isAxiosError) {
          throw Error('network_error');
        }
        throw err;
      })
      .then((result) => {
        const { feed, posts } = buildFeed(result.data.contents, url);
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
      });
  });

  render(watchedState);
});
