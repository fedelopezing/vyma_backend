import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * Returns CORS configuration options based on process.env.ALLOWED_ORIGINS
 */
export const getCorsOptions = (): CorsOptions => {
  const rawOrigins = process.env.ALLOWED_ORIGINS || '';
  const allowedOrigins = rawOrigins
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o.length > 0);

  return {
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'X-Company-Id',
      'x-company-id',
      'X-Tenant-Id',
      'x-tenant-id',
    ],
  };
};
