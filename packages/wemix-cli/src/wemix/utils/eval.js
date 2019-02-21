/*
 * @Description: meta.json
 * @LastEditors: sanshao
 * @Date: 2019-02-20 16:15:35
 * @LastEditTime: 2019-02-20 16:16:22
 */

export default function evaluate (exp, data) {
  const fn = new Function('data', 'with (data) { return ' + exp + '}') // eslint-disable-line
  try {
    return fn(data)
  } catch (e) {
    return null
  }
}
