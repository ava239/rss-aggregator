/* eslint-disable no-param-reassign */
import i18next from 'i18next';
import { target } from 'on-change';

const handleFormState = (value) => {
  const input = document.getElementById('url-input');
  input.classList.remove('is-invalid');

  const submitBtn = document.querySelector('button[type="submit"]');
  submitBtn.textContent = i18next.t('add');

  switch (value) {
    case 'filling':
    case 'submitted':
      submitBtn.disabled = false;
      input.value = '';
      input.readOnly = false;
      break;
    case 'submitting':
      submitBtn.disabled = true;
      submitBtn.textContent = i18next.t('submitting');
      input.readOnly = true;
      break;
    case 'failed':
      submitBtn.disabled = false;
      input.readOnly = false;
      input.classList.add('is-invalid');
      break;
    default:
      throw Error(`Unknown state: ${value}`);
  }
};

const handleModal = ({ title, description, link }) => {
  const titleElement = document.querySelector('.modal .modal-title');
  titleElement.textContent = title;

  const bodyElement = document.querySelector('.modal .modal-body');
  bodyElement.textContent = description;

  const linkElement = document.querySelector('.modal .full-article');
  linkElement.href = link;
};

const renderMessage = ({ type, text }) => {
  const feedback = document.querySelector('.feedback');
  feedback.textContent = i18next.t(text);
  switch (type) {
    case 'success':
      feedback.classList.add('text-success');
      feedback.classList.remove('text-danger');
      break;
    case 'error':
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      break;
    default:
      throw Error(`Unknown message type: ${type}`);
  }
};

const buildFeedElement = ({ title, description }) => {
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'border-0', 'border-end-0');

  const feedTitle = document.createElement('h3');
  feedTitle.classList.add('h6', 'm-0');
  feedTitle.textContent = title;

  const feedBody = document.createElement('p');
  feedBody.classList.add('m-0', 'small', 'text-black-50');
  feedBody.textContent = description;

  li.append(feedTitle, feedBody);
  return li;
};

const buildPostElement = (post, state) => {
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

  const readPosts = target(state.readPosts);
  const isRead = readPosts.includes(post.id);
  const postLink = document.createElement('a');
  const linkClasses = isRead ? ['fw-normal', 'link-secondary'] : ['fw-bold'];

  postLink.classList.add(...linkClasses);
  postLink.textContent = post.title;
  postLink.dataset.id = post.id;
  postLink.target = '_blank';
  postLink.rel = 'noopener noreferrer';
  postLink.href = post.link;

  const btn = document.createElement('button');
  btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  btn.dataset.id = post.id;
  btn.dataset.bsToggle = 'modal';
  btn.dataset.bsTarget = '#modal';
  btn.textContent = i18next.t('view');

  btn.addEventListener('click', () => {
    state.readPosts = [...state.readPosts, post.id];
    const { link, title, description } = post;
    state.modal = { title, description, link };
  });

  li.append(postLink, btn);

  return li;
};

const buildCard = (title, content) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const blockTitle = document.createElement('h2');
  blockTitle.textContent = title;

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  ul.append(...content);

  cardBody.append(blockTitle);
  card.append(cardBody, ul);

  return card;
};

const renderFeeds = (feeds) => {
  if (feeds.length === 0) {
    return;
  }

  const feedsContainer = document.querySelector('.feeds');
  feedsContainer.innerHTML = '';

  const listElements = feeds.map(buildFeedElement);

  const card = buildCard(i18next.t('feeds'), listElements);
  feedsContainer.append(card);
};

const renderPosts = (posts, state) => {
  if (posts.length === 0) {
    return;
  }

  const postsContainer = document.querySelector('.posts');
  postsContainer.innerHTML = '';

  const listElements = posts.map((post) => buildPostElement(post, state));

  const card = buildCard(i18next.t('posts'), listElements);
  postsContainer.append(card);
};

const render = (state, path, value) => {
  switch (path) {
    case 'form.state':
      handleFormState(value);
      break;
    case 'form.message':
      renderMessage(value);
      break;
    case 'feeds':
      renderFeeds(value);
      break;
    case 'posts':
      renderPosts(value, state);
      break;
    case 'modal':
      handleModal(value);
      break;
    case 'readPosts':
      renderPosts(target(state.posts), state);
      break;
    default:
      break;
  }
};

export default render;
