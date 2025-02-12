import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { META_ROLES } from '../decorators/role-protected.decorator';


@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles: string[] = this.reflector.get( META_ROLES , context.getHandler() )

    if ( !validRoles || validRoles.length === 0 ) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if ( !user )
      throw new BadRequestException('El usuario no existe');

    if( validRoles.includes( user.role ) )
      return true;

    throw new ForbiddenException(
      `${ user.name } no tiene el rol: [${ validRoles }]`
    );
  }
}
