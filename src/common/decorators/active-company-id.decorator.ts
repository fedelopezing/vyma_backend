import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Parameter decorator to resolve the active companyId.
 *
 * - If the authenticated user is a SuperAdmin (isSuperAdmin: true),
 *   it will look for a `companyId` in the query parameters or request body.
 * - Otherwise, it will fall back to the authenticated user's own `companyId`.
 */
export const ActiveCompanyId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number | null => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    if (user.isSuperAdmin) {
      const companyId = request.query?.companyId || request.body?.companyId;
      if (companyId) {
        return Number(companyId);
      }
    }

    return user.companyId;
  },
);
