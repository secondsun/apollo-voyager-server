'use strict'
import { VoyagerConfig } from './config/VoyagerConfig'
import { FieldResolver, ResolverMappings, ResolverObject, ResolverWrapper, wrapResolvers } from '@aerogear/apollo-voyager-tools'

export function voyagerResolvers (resolverMappings: ResolverMappings, config: VoyagerConfig): ResolverMappings {
  return wrapResolvers(resolverMappings, voyagerResolverPartial(config))
}

export interface VoyagerResolversConfig {
  metrics: boolean,
  auditLogging: boolean
}

function voyagerResolverPartial (config: VoyagerConfig): ResolverWrapper {
  const { metrics, auditLogger } = config
  return (resolverFn: FieldResolver): FieldResolver => {
    return (obj, args, context, info) => {
      return new Promise(async (resolve, reject) => {
        const resolverStartTime = Date.now()
        try {
          const result = await resolverFn(obj, args, context, info)
          if (auditLogger) {
            auditLogger.auditLog(true, context, info, obj, args, '')
          }
          resolve(result)

          if (metrics) {
            const timeTook = Date.now() - resolverStartTime
            metrics.updateResolverMetrics(info, timeTook)
          }
        } catch (error) {
          // we only publish time in success. const timeTook
          // NOPE: const timeTook = Date.now() - resolverStartTime
          // NOPE: updateResolverMetrics(info, timeTook)
          // but, we audit log in case of failure too
          if (auditLogger) {
            auditLogger.auditLog(false, context, info, obj, args, error.message)
          }
          reject(error)
        }
      })
    }
  }
}

export { FieldResolver, ResolverMappings, ResolverObject, ResolverWrapper, wrapResolvers }
