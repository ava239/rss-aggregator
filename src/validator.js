import * as yup from 'yup';

yup.setLocale({
  string: {
    url: 'mustBeUrl',
  },
});
const validate = (url) => yup.string().url().required().validate(url);

export default validate;
