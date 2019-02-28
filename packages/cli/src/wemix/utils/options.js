/*
 * @Description: Options
 * @LastEditors: sanshao
 * @Date: 2019-02-20 16:18:47
 * @LastEditTime: 2019-02-26 17:02:17
 */

import npath from 'path'
import validateName from 'validate-npm-package-name'
import getGitUser from './gitUser'

/**
 * @description: 设置校验方法
 */
function setValidateName (opts) {
  const name = opts.prompts.name
  const customValidate = name.validate
  name.validate = name => {
    const its = validateName(name)
    if (!its.validForNewPackages) {
      const errors = (its.errors || []).concat(its.warnings || [])
      return 'Sorry, ' + errors.join(' and ') + '.'
    }
    if (typeof customValidate === 'function') return customValidate(name)
    return true
  }
}

/**
 * @description: 设置name
 */
function setDefault (opts, key, val) {
  if (opts.schema) {
    opts.prompts = opts.schema
    delete opts.schema
  }
  const prompts = opts.prompts || (opts.prompts = {})
  if (!prompts[key] || typeof prompts[key] !== 'object') {
    prompts[key] = {
      type: 'string',
      default: val,
    }
  } else {
    prompts[key]['default'] = val
  }
}

/**
 * @description: 读取meta
 */
function getMetadata (tempMeta) {
  const opts = require(tempMeta)
  return opts
}

export default function getOptions (name, tempSrc) {
  const opts = getMetadata(npath.join(tempSrc, 'meta.js'))
  setDefault(opts, 'name', name)
  setValidateName(opts)

  const author = getGitUser()
  if (author) {
    setDefault(opts, 'author', author)
  }

  return opts
}
