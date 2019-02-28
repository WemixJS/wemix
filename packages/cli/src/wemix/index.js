/*
 * @Description: 入口文件
 * @LastEditors: sanshao
 * @Date: 2019-02-20 15:36:23
 * @LastEditTime: 2019-02-21 17:07:24
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
  .on('--help', () => {
    console.log()
    console.log('  Example:')
    console.log()
    console.log(chalk.gray('   # create a new project with a custom template'))
    console.log('  $ wemix new <projectName> -t custom')
    console.log()
    console.log(chalk.gray('   # create a new project with an empty template'))
    console.log('  $ wemix new <projectName> -t empty')
    console.log()
  })

program
  .command('build')
  .description('Compile')
  .action(build)
  .option('--config <config>', 'Path to the config file')
  .option('--entryDir <entryDir>', 'origin code dir')
  .option('--outputDir <outputDir>', 'compiled code dir')
  .option('-w, --watch', 'Watch the filesystem for changes')
  .option('--progress', 'Print compilation progress in percentage')
  .on('--help', () => {
    console.log()
    console.log('  Example:')
    console.log()
    console.log(chalk.gray('   # build in local'))
    console.log('  $ wemix build --config wemix.development.config.js')
    console.log()
    console.log(chalk.gray('   # 构建线上版本'))
    console.log('  $ wemix build --config wemix.production.config.js ')
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
