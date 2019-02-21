/*
 * @Description: Compile Plugin
 * @LastEditors: sanshao
 * @Date: 2019-02-20 19:22:44
 * @LastEditTime: 2019-02-20 19:25:31
 */

export default class CompilePlugin {
  apply (compiler) {
    compiler.hooks.compile.tapAsync(
      'CompilePlugin',
      (compilation, callback) => {
        // if (compilation.waitCompile.size === 0) {
        //   const awaitBuildStatic = await this.buildStatic
        //   const awaitBuildApp = await this.buildApp
        //   awaitBuildStatic(compilation)
        //   awaitBuildApp(compilation, `${compiler.context}/src/app`)
        //   callback()
        // }
        // 如果没有就从app开始
        // 如果有就看是否增删改 新增文件不编译 删除文件同时删 更改文件看是否有新的引入
      }
    )
  }
}
