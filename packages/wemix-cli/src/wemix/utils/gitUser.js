/*
 * @Description: 获取git user
 * @LastEditors: sanshao
 * @Date: 2019-02-20 16:20:11
 * @LastEditTime: 2019-02-20 16:20:25
 */

import childProcess from 'child_process'
const execSync = childProcess.execSync

export default function getGitUser () {
  let name
  let email

  try {
    name = execSync('git config --get user.name')
    email = execSync('git config --get user.email')
  } catch (e) {}

  name = name && name.toString().trim()
  email = email && ' <' + email.toString().trim() + '>'
  return (name || '') + (email || '')
}
