/**
 * prismaExtractor.ts
 * Extracts and formats the raw, production-ready schema.prisma from specification.
 */

export function extractPrismaSchema(spec: any): string {
  // Support FullMvpSpec database schema
  if (spec?.database?.prismaSchemaCode && typeof spec.database.prismaSchemaCode === 'string') {
    return spec.database.prismaSchemaCode.trim();
  }

  // Support ArchitectureSpec database schema
  if (spec?.databaseSchema?.code && typeof spec.databaseSchema.code === 'string') {
    return spec.databaseSchema.code.trim();
  }

  // Fallback default schema
  const projectName = spec?.projectName || spec?.conceptName || 'Application';
  const provider = (spec?.database?.dbType || spec?.targetDatabase || 'PostgreSQL').toLowerCase().includes('mysql')
    ? 'mysql'
    : (spec?.database?.dbType || spec?.targetDatabase || 'PostgreSQL').toLowerCase().includes('mongo')
    ? 'mongodb'
    : 'postgresql';

  return `// Generated Prisma Schema for ${projectName}
// Quzar Ship Architecture Engine // Directives 2.0

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      String   @default("USER")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}
`;
}
