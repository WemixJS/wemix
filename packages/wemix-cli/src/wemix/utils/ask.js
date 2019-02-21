/*
 * @Description: Ask question
 * @LastEditors: sanshao
 * @Date: 2019-02-20 16:14:58
 * @LastEditTime: 2019-02-20 16:15:16
 */

import async from 'async'
import inquirer from 'inquirer'
import evaluate from './eval'

// Support types from prompt-for which was used before
const promptMapping = {
  string: 'input',
  boolean: 'confirm',
}

/**
 * @description: Inquirer prompt wrapper.
 */
function prompt (data, key, prompt, done) {
  // skip prompts whose when condition is not met
  if (prompt.when && !evaluate(prompt.when, data)) {
    return done()
  }

  let promptDefault = prompt.default
  if (typeof prompt.default === 'function') {
    promptDefault = function () {
      return prompt.default.bind(this)(data)
    }
  }

  inquirer
    .prompt([
      {
        type: promptMapping[prompt.type] || prompt.type,
        name: key,
        message: prompt.message || prompt.label || key,
        default: promptDefault,
        choices: prompt.choices || [],
        validate: prompt.validate || (() => true),
      },
    ])
    .then(answers => {
      if (Array.isArray(answers[key])) {
        data[key] = {}
        answers[key].forEach(multiChoiceAnswer => {
          data[key][multiChoiceAnswer] = true
        })
      } else if (typeof answers[key] === 'string') {
        data[key] = answers[key].replace(/"/g, '\\"')
      } else {
        data[key] = answers[key]
      }
      done()
    })
    .catch(done)
}

export default function ask (prompts, data, done) {
  async.eachSeries(
    Object.keys(prompts),
    (key, next) => {
      prompt(data, key, prompts[key], next)
    },
    done
  )
}
