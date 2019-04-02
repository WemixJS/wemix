export default {
  extend () {
    let options, name, src, copy, copyIsArray, clone
    let target = arguments[0] || {}
    let i = 1
    let length = arguments.length
    let deep = false
    let self = this

    // Handle a deep copy situation
    if (typeof target === 'boolean') {
      deep = target

      // Skip the boolean and the target
      target = arguments[i] || {}
      i++
    }

    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== 'object' && !(typeof target === 'function')) {
      target = {}
    }

    // Extend jQuery itself if only one argument is passed
    if (i === length) {
      target = this
      i--
    }

    for (; i < length; i++) {
      // Only deal with non-null/undefined values
      if ((options = arguments[i])) {
        // Extend the base object
        for (name in options) {
          src = target[name]
          copy = options[name]

          // Prevent never-ending loop
          if (target === copy) {
            continue
          }

          // Recurse if we're merging plain objects or arrays
          if (
            deep &&
            copy &&
            (self.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))
          ) {
            if (copyIsArray) {
              copyIsArray = false
              clone = src && Array.isArray(src) ? src : []
            } else {
              clone = src && self.isPlainObject(src) ? src : {}
            }

            // Never move original objects, clone them
            target[name] = self.extend(deep, clone, copy)

            // Don't bring in undefined values => bring undefined values
          } else {
            target[name] = copy
          }
        }
      }
    }

    // Return the modified object
    return target
  },
  isPlainObject (obj) {
    let proto, Ctor

    // Detect obvious negatives
    // Use toString instead of jQuery.type to catch host objects
    if (!obj || Object.prototype.toString.call(obj) !== '[object Object]') {
      return false
    }

    proto = Object.getPrototypeOf(obj)

    // Objects with no prototype (e.g., `Object.create( null )`) are plain
    if (!proto) {
      return true
    }

    // Objects with prototype are plain iff they were constructed by a global Object function
    Ctor =
      Object.prototype.hasOwnProperty.call(proto, 'constructor') &&
      proto.constructor
    return (
      typeof Ctor === 'function' &&
      Object.prototype.hasOwnProperty.toString.call(Ctor) ===
        Object.prototype.hasOwnProperty.toString.call(Object)
    )
  },
}
