import { z } from 'zod';
import { insertUserSchema, insertGigSchema, insertBidSchema, users, gigs, bids } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({
        username: z.string(), // Using 'username' field for passport compatibility, though UI might say Email
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>().nullable(),
      },
    },
  },
  gigs: {
    list: {
      method: 'GET' as const,
      path: '/api/gigs',
      input: z.object({
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof gigs.$inferSelect & { owner: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/gigs',
      input: insertGigSchema.omit({ ownerId: true }), // ownerId comes from session
      responses: {
        201: z.custom<typeof gigs.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/gigs/:id',
      responses: {
        200: z.custom<typeof gigs.$inferSelect & { owner: typeof users.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  bids: {
    create: {
      method: 'POST' as const,
      path: '/api/bids',
      input: insertBidSchema.omit({ freelancerId: true }), // freelancerId comes from session
      responses: {
        201: z.custom<typeof bids.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    listByGig: {
      method: 'GET' as const,
      path: '/api/bids/:gigId',
      responses: {
        200: z.array(z.custom<typeof bids.$inferSelect & { freelancer: typeof users.$inferSelect }>()),
        403: errorSchemas.unauthorized,
      },
    },
    hire: {
      method: 'PATCH' as const,
      path: '/api/bids/:bidId/hire',
      responses: {
        200: z.custom<typeof bids.$inferSelect>(),
        403: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
};

// ============================================
// HELPER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}
