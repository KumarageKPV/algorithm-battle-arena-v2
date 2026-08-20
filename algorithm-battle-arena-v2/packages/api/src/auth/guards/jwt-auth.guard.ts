import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Standard JWT authentication guard — equivalent to [Authorize] in ASP.NET.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

