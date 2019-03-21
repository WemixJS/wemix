/*
 * @Description: 入口文件
 * @LastEditors: sanshao
 * @Date: 2019-02-20 15:36:23
 * @LastEditTime: 2019-03-25 10:24:56
 */

import program from 'commander'
import chalk from 'chalk'
import init from './init'
import build from './build'
import mkpage from './mkpage'
import mkcomponent from './mkcomponent'
import mkbehavior from './mkbehavior'

program.version(require('../../package.json').version, '-v, --version')

program
  .command('new <projectName>')
  .description('Generate a new project from a template')
  .action(init)
  .usage('[command] <options ...>')
  .option(
    '-t, --template <template>',
    'Choose a template [empty|custom]',
    /^(empty|custom)$/i,
    'custom'
  )
  .option(
    '-e, --export <export>',
    'Choose a type [wechat|alipay|tt|swan]',
    /^(wechat|alipay|tt|swan)$/i
  )
  .on('--help', () => {
    console.log()
    console.log('  Example:')
    console.log()
    console.log(chalk.gray('   # create a new project with a custom template'))
    console.log(
      '  $ wemix new <projectName> --template custom --export wechata'
    )
    console.log()
    console.log(chalk.gray('   # create a new project with an empty template'))
    console.log('  $ wemix new <projectName> --template empty --export wechat')
    console.log()
  })

program
  .command('build')
  .description('Compile')
  .action(build)
  .option(
    '-e, --export <export>',
    'Choose a type [wechat|alipay|tt|swan]',
    /^(wechat|alipay|tt|swan)$/i
  )
  .option('-c, --config <config>', 'Path to the config file')
  .option('-i, --entry <entry>', 'origin code dir or files')
  .option('-w, --watch', 'Watch the filesystem for changes')
  .option('--progress', 'Print compilation progress in percentage')
  .on('--help', () => {
    console.log()
    console.log('  Example:')
    console.log()
    console.log(chalk.gray('   # build in local'))
    console.log(
      '  $ wemix build --watch --config wemix.development.config.js --export wechat'
    )
    console.log()
    console.log(chalk.gray('   # 构建线上版本'))
    console.log(
      '  $ wemix build --config wemix.production.config.js --export wechat '
    )
    console.log()
  })

program
  .command('mkpage <pageName>')
  .description('Make a page from template')
  .action(mkpage)
  .usage('[command] <options ...>')

program
  .command('mkcomponent <componentName>')
  .description('Make a component from template')
  .action(mkcomponent)
  .usage('[command] <options ...>')

program
  .command('mkbehavior <behaviorName>')
  .description('Make a behavior from template')
  .action(mkbehavior)
  .usage('[command] <options ...>')

program.parse(process.argv)
