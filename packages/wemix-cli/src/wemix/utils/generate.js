/*
 * @Description: Generate
 * @LastEditors: sanshao
 * @Date: 2019-02-20 16:12:35
 * @LastEditTime: 2019-02-20 16:20:35
 */

import path from 'path'
import Metalsmith from 'metalsmith'
import multimatch from 'multimatch'
import Handlebars from 'handlebars'
import consolidate from 'consolidate'
import chalk from 'chalk'
import async from 'async'
import getOptions from './options'
import ask from './ask'
import filter from './filter'
import * as logger from './logger'

const handlebars = consolidate.handlebars

Handlebars.registerHelper('if_eq', function (a, b, opts) {
  return a === b ? opts.fn(this) : opts.inverse(this)
})

Handlebars.registerHelper('unless_eq', function (a, b, opts) {
  return a === b ? opts.inverse(this) : opts.fn(this)
})

/**
 * @description: Create a middleware for asking questions.
 */
function askQuestions (prompts) {
  return (files, metalsmith, done) => {
    ask(prompts, metalsmith.metadata(), done)
  }
}

/**
 * @description: Create a middleware for filtering files.
 */
function filterFiles (filters) {
  return (files, metalsmith, done) => {
    filter(files, filters, metalsmith.metadata(), done)
  }
}

/**
 * @description: Template in place plugin.
 */
function renderTemplateFiles (skipInterpolation) {
  skipInterpolation =
    typeof skipInterpolation === 'string'
      ? [skipInterpolation]
      : skipInterpolation
  return (files, metalsmith, done) => {
    const keys = Object.keys(files)
    const metalsmithMetadata = metalsmith.metadata()
    async.each(
      keys,
      (file, next) => {
        // skipping files with skipInterpolation option
        if (
          skipInterpolation &&
          multimatch([file], skipInterpolation, { dot: true }).length
        ) {
          return next()
        }
        const str = files[file].contents.toString()
        // do not attempt to render files that do not have mustaches
        if (!/{{([^{}]+)}}/g.test(str)) {
          return next()
        }
        handlebars.render(str, metalsmithMetadata, (err, res) => {
          if (err) {
            err.message = `[${file}] ${err.message}`
            return next(err)
          }
          files[file].contents = new Buffer(res)
          next()
        })
      },
      done
    )
  }
}

/**
 * @description: Display template complete message.
 */
function logMessage (message, data) {
  if (!message) return
  handlebars.render(message, data, (err, res) => {
    if (err) {
      logger.fatal(
        'Error when rendering template complete message: ' + err.message.trim()
      )
    } else {
      logger.log(
        '  ' +
          res
            .split(/\r?\n/g)
            .map(line => '   ' + line)
            .join('\n')
      )
    }
  })
}

export default function generate (name, stemSrc, to, done) {
  const opts = getOptions(name, stemSrc)
  const metalsmith = Metalsmith(path.join(stemSrc, 'template'))
  const data = Object.assign(metalsmith.metadata(), {
    destDirName: name,
    inPlace: true,
    noEscape: true,
  })
  opts.helpers &&
    Object.keys(opts.helpers).map(key => {
      Handlebars.registerHelper(key, opts.helpers[key])
    })

  const helpers = { chalk, logger }

  if (opts.metalsmith && typeof opts.metalsmith.before === 'function') {
    opts.metalsmith.before(metalsmith, opts, helpers)
  }

  metalsmith
    .use(askQuestions(opts.prompts))
    .use(filterFiles(opts.filters))
    .use(renderTemplateFiles(opts.skipInterpolation))

  if (typeof opts.metalsmith === 'function') {
    opts.metalsmith(metalsmith, opts, helpers)
  } else if (opts.metalsmith && typeof opts.metalsmith.after === 'function') {
    opts.metalsmith.after(metalsmith, opts, helpers)
  }

  metalsmith
    .clean(false)
    .source('.') // start = require('emplate root instead of `./src` which is Metalsmith's default for `source);
    .destination(process.cwd())
    .build((err, files) => {
      done(err)
      if (typeof opts.complete === 'function') {
        const helpers = { chalk, logger, files }
        opts.complete(data, helpers)
      } else {
        logMessage(opts.completeMessage, data)
      }
    })
}
