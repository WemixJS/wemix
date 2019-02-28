/*
 * @Description: Resolver Factory
 * @LastEditors: sanshao
 * @Date: 2019-02-20 19:00:16
 * @LastEditTime: 2019-02-20 19:01:18
 */

import { ResolverFactory as Factory } from 'enhanced-resolve'
import { HookMap, SyncHook, SyncWaterfallHook } from 'tapable'

export default class ResolverFactory {
  constructor () {
    this.hooks = Object.freeze({
      resolveOptions: new HookMap(
        () => new SyncWaterfallHook(['resolveOptions'])
      ),
      resolver: new HookMap(() => new SyncHook(['resolver', 'resolveOptions'])),
    })
    this.cache = new Map()
  }

  get (type, resolveOptions) {
    let typedCaches = this.cache.get(type)
    if (!typedCaches) {
      typedCaches = {
        direct: new WeakMap(),
        stringified: new Map(),
      }
      this.cache.set(type, typedCaches)
    }
    const cachedResolver = typedCaches.direct.get(resolveOptions)
    if (cachedResolver) {
      return cachedResolver
    }
    const ident = JSON.stringify(resolveOptions)
    const resolver = typedCaches.stringified.get(ident)
    if (resolver) {
      typedCaches.direct.set(resolveOptions, resolver)
      return resolver
    }
    const newResolver = this._create(type, resolveOptions)
    typedCaches.direct.set(resolveOptions, newResolver)
    typedCaches.stringified.set(ident, newResolver)
    return newResolver
  }

  _create (type, resolveOptions) {
    const originalResolveOptions = Object.assign({}, resolveOptions)
    resolveOptions = this.hooks.resolveOptions.for(type).call(resolveOptions)
    const resolver = Factory.createResolver(resolveOptions)
    if (!resolver) {
      throw new Error('No resolver created')
    }
    // resolver.resolve = sealResolve(resolver.resolve, resolver)
    const childCache = new Map()
    resolver.withOptions = options => {
      const cacheEntry = childCache.get(options)
      if (cacheEntry !== undefined) return cacheEntry
      const mergedOptions = Object.assign({}, originalResolveOptions, options)
      const resolver = this.get(type, mergedOptions)
      childCache.set(options, resolver)
      return resolver
    }
    this.hooks.resolver.for(type).call(resolver, resolveOptions)
    return resolver
  }
}
