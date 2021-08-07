import * as yup from 'yup';

yup.setLocale({
  string: {
    url: 'must_be_url',
  },
});
const validate = (url) => yup.string().url().required().validate(url);

export default validate;
