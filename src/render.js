import i18next from 'i18next';

const handleForm = (stateValue) => {
  const input = document.getElementById('url-input');
  const submit = document.querySelector('button[type="submit"]');
  input.classList.remove('is-invalid');
  submit.textContent = i18next.t('add');

  switch (stateValue) {
    case 'filling':
    case 'submitted':
      submit.disabled = false;
      input.value = '';
      input.readOnly = false;
      break;
    case 'submitting':
      submit.disabled = true;
      input.readOnly = true;
      break;
    case 'failed':
      submit.disabled = false;
      input.readOnly = false;
      input.classList.add('is-invalid');
      break;
    default:
      throw Error(`Unknown state: ${stateValue}`);
  }
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

const render = (state, path, value) => {
  const submit = document.querySelector('button[type="submit"]');
  submit.textContent = i18next.t('add');

  switch (path) {
    case 'form.state':
      handleForm(value);
      break;
    case 'form.message':
      renderMessage(value);
      break;
    default:
      break;
  }
};

export default render;
