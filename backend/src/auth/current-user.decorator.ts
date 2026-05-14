import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export const CurrentUser = createParamDecorator(
  (_data, ctx: ExecutionContext): AuthUser =>
    ctx.switchToHttp().getRequest().user,
);
