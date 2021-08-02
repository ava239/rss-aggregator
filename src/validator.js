import * as yup from 'yup';

yup.setLocale({
  string: {
    url: 'mustBeUrl',
  },
});
const validate = (url) => {
  const schema = yup.string().url().required();
  return schema.validate(url);
};

export default validate;
