import i18next from 'i18next';
import onChange from 'on-change';
import render from './render';
import resources from './i18n';
import validate from './validator';

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
  };
  const watchedState = onChange(state, (path, value) => render(watchedState, path, value));
  const form = document.querySelector('form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.state = 'submitting';

    const formData = new FormData(e.target);
    const url = formData.get('url');
    validate(formData.get('url')).catch(({ errors }) => {
      const [validationMessage] = errors;
      watchedState.form.state = 'failed';
      watchedState.form.message = {
        type: 'error',
        text: validationMessage,
      };
      throw new Error('validation fail');
    }).then(() => {
      const alreadyExists = state.feeds.find((feed) => feed.url === url);

      if (alreadyExists) {
        watchedState.form.state = 'failed';
        watchedState.form.message = {
          type: 'error',
          text: 'exists',
        };
        throw new Error('already exists');
      }
    }).then(() => {
      const feed = { url };

      watchedState.feeds = [feed, ...watchedState.feeds];

      watchedState.form.state = 'submitted';
      watchedState.form.message = {
        type: 'success',
        text: 'successLoad',
      };
    });
  });

  render(watchedState);
});
