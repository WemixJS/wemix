module.exports = {
  helpers: {
    if_or: function (v1, v2, options) {
      if (v1 || v2) {
        return options.fn(this)
      }

      return options.inverse(this)
    },
  },
  prompts: {
    name: {
      type: 'string',
      required: true,
      message: 'Project name',
    },
    description: {
      type: 'string',
      required: false,
      message: 'Project description',
      default: 'a wemix project',
    },
    author: {
      type: 'string',
      message: 'Author',
    },
    lint: {
      type: 'confirm',
      message: 'Use ESLint to lint your code?',
    },
  },
  filters: {
    '.eslintignore': 'lint',
    '.eslintrc': 'lint',
    '.stylelintignore': 'lint',
    '.stylelintrc': 'lint',
  },
}
