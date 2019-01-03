import { GraphQLResolveInfo } from 'graphql'

export interface AuditLogger {
  logResolverCompletion (msg: string, success: boolean, obj: any, args: any, context: any, info: GraphQLResolveInfo): void
  auditLog (msg: string, obj: any, args: any, context: any, info: GraphQLResolveInfo): void
}
