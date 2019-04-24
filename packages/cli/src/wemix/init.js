/*
 * @Description: 初始化项目
 * @LastEditors: sanshao
 * @Date: 2019-02-20 15:44:27
 * @LastEditTime: 2019-04-24 11:51:59
 */

import fs from 'fs-extra'
import npath from 'path'
import inquirer from 'inquirer'
import logger from '../utils/logger'
import * as util from '../utils'
import generate from './utils/generate'

function install () {
  logger.start('Install dependencies')
  // 需要安装最新的wemix，因此不能提早写入package.json文件中
  const dependencies = [
    '@wemix/core',
    '@wemix/transform-plugin',
    '@wemix/uglifyjs-plugin',
    '@wemix/uglifyimg-plugin',
    '@wemix/pretty-plugin',
    '@wemix/babel-loader',
    '@wemix/postcss-loader',
    '@wemix/less-loader',
  ]
  const devDependencies = ['@wemix/cli']
  // 安装依赖包
  const cmd = 'npm install --registry https://registry.npm.taobao.org'
  const cmdSave = `npm install ${dependencies.join(
    ' '
  )} --save --registry https://registry.npm.taobao.org`
  const cmdSaveDev = `npm install ${devDependencies.join(
    ' '
  )} --save-dev --registry https://registry.npm.taobao.org`
  logger.info('Execute' + cmd)
  logger.info('May take a few minutes, please be patient...')
  util
    .exec(cmd)
    .then(() => {
      return util.exec(cmdSave)
    })
    .then(() => {
      return util.exec(cmdSaveDev)
    })
    .then(() => {
      logger.success('Install dependencies')
      logger.start('Run dev')
      const cmd = 'npm run dev'
      logger.info('Execute' + cmd)
      logger.info('May take a few minutes, please be patient...')

      util
        .exec(cmd)
        .then(() => {
          logger.success('Run dev')
        })
        .catch(error => {
          logger.error(error.stack || error)
        })
    })
    .catch(error => {
      logger.error(error.stack || error)
    })
}

function create (name, program) {
  logger.success('Create directory ' + name)
  logger.start('Init project')
  if (!program.template) {
    program.template = 'empty'
  }
  const tempDir = npath.join(
    __dirname,
    '..',
    npath.sep,
    '..',
    npath.sep,
    'templates',
    npath.sep,
    program.template
  )

  generate(name, tempDir, process.cwd(), error => {
    if (error) logger.error(error.stack || error)
    logger.success('Init project')
    install()
  })
}

export default function init (name, program) {
  logger.info('Generate project')
  if (!name || name === '.') {
    name = process
      .cwd()
      .split(npath.sep)
      .pop()

    // 使用当前目录作为项目根目录
    const files = fs.readdirSync(process.cwd())
    if (files.length > 0) {
      logger.error(
        'Not an empty directory, please execute "wemix new <projectName>"'
      )
    } else {
      logger.start('Create directory')
      inquirer
        .prompt([
          {
            type: 'confirm',
            message: 'Generate project in current directory?',
            name: 'ok',
          },
        ])
        .then(answers => {
          if (answers.ok) {
            create(name, program)
          }
        })
        .catch()
    }
  } else {
    // 使用自定义的目录作为项目目录
    if (!fs.ensureDirSync(name)) {
      logger.error('Failed to create directory')
      process.exit(1)
    }
    process.chdir(name)
    create(name, program)
  }
}
