# めぐる MVP Phase 1: プロジェクト基盤 + データベース + 認証API

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** モノレポの基盤構築、Prismaスキーマ定義、NestJSでの認証API（マジックリンク + パスワード）を実装し、E2Eでテナント作成→ユーザー登録→ログインが動作する状態にする。

**Architecture:** pnpm workspaceモノレポ。apps/api (NestJS) と packages/db (Prisma) を構築。認証はJWT + マジックリンク。マルチテナントはPrismaミドルウェアでtenantIdフィルタを自動適用。

**Tech Stack:** Node.js, pnpm, asdf, NestJS, Prisma, PostgreSQL, JWT, bcrypt, nodemailer

**Specs:** `docs/prd/001-meguru-mvp.md`, `docs/spec/001-system-architecture.md`, `docs/spec/002-data-model.md`, `docs/adr/*`

---

## File Structure

```
meguru/
├── .tool-versions                          # asdf: node, pnpm versions
├── .gitignore
├── pnpm-workspace.yaml
├── package.json                            # workspace root
├── apps/
│   └── api/
│       ├── package.json
│       ├── tsconfig.json
│       ├── nest-cli.json
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── common/
│       │   │   ├── guards/
│       │   │   │   ├── auth.guard.ts
│       │   │   │   ├── roles.guard.ts
│       │   │   │   └── auth.guard.spec.ts
│       │   │   ├── decorators/
│       │   │   │   ├── current-user.decorator.ts
│       │   │   │   ├── roles.decorator.ts
│       │   │   │   └── public.decorator.ts
│       │   │   ├── interceptors/
│       │   │   │   ├── tenant.interceptor.ts
│       │   │   │   └── tenant.interceptor.spec.ts
│       │   │   └── filters/
│       │   │       └── http-exception.filter.ts
│       │   ├── modules/
│       │   │   ├── prisma/
│       │   │   │   ├── prisma.module.ts
│       │   │   │   └── prisma.service.ts
│       │   │   ├── tenant/
│       │   │   │   ├── tenant.module.ts
│       │   │   │   ├── tenant.service.ts
│       │   │   │   ├── tenant.controller.ts
│       │   │   │   ├── tenant.service.spec.ts
│       │   │   │   └── dto/
│       │   │   │       └── create-tenant.dto.ts
│       │   │   ├── auth/
│       │   │   │   ├── auth.module.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.spec.ts
│       │   │   │   ├── strategies/
│       │   │   │   │   └── jwt.strategy.ts
│       │   │   │   └── dto/
│       │   │   │       ├── login.dto.ts
│       │   │   │       ├── register.dto.ts
│       │   │   │       └── magic-link.dto.ts
│       │   │   ├── user/
│       │   │   │   ├── user.module.ts
│       │   │   │   ├── user.service.ts
│       │   │   │   ├── user.controller.ts
│       │   │   │   ├── user.service.spec.ts
│       │   │   │   └── dto/
│       │   │   │       ├── create-user.dto.ts
│       │   │   │       └── update-user.dto.ts
│       │   │   └── group/
│       │   │       ├── group.module.ts
│       │   │       ├── group.service.ts
│       │   │       ├── group.controller.ts
│       │   │       ├── group.service.spec.ts
│       │   │       └── dto/
│       │   │           └── create-group.dto.ts
│       │   └── test/
│       │       ├── jest-e2e.json
│       │       └── auth.e2e-spec.ts
│       └── .env.example
├── packages/
│   └── db/
│       ├── package.json
│       ├── tsconfig.json
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/              # auto-generated
│       │   └── seed.ts
│       └── src/
│           └── index.ts                 # re-export PrismaClient + types
└── docs/                                # already exists
```

---

### Task 1: Git初期化 + asdf + pnpm workspace

**Files:**
- Create: `.gitignore`
- Create: `.tool-versions`
- Create: `pnpm-workspace.yaml`
- Create: `package.json`

- [ ] **Step 1: Git初期化**

```bash
cd /Users/masayafukazawa/workspace/me/meguru
git init
```

- [ ] **Step 2: .gitignore作成**

```gitignore
node_modules/
dist/
.env
.env.local
*.log
.next/
.turbo/
.superpowers/
```

- [ ] **Step 3: .tool-versions作成**

```
nodejs 22.14.0
pnpm 10.7.0
```

- [ ] **Step 4: asdfでNode.jsとpnpmをインストール**

```bash
asdf install
```

Expected: Node.js 22.14.0 と pnpm 10.7.0 がインストールされる

- [ ] **Step 5: pnpm-workspace.yaml作成**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 6: ルートpackage.json作成**

```json
{
  "name": "meguru",
  "private": true,
  "scripts": {
    "dev:api": "pnpm --filter @meguru/api dev",
    "build:api": "pnpm --filter @meguru/api build",
    "test": "pnpm -r test",
    "test:e2e": "pnpm --filter @meguru/api test:e2e",
    "db:migrate": "pnpm --filter @meguru/db migrate",
    "db:generate": "pnpm --filter @meguru/db generate",
    "db:seed": "pnpm --filter @meguru/db seed"
  },
  "engines": {
    "node": ">=22",
    "pnpm": ">=10"
  }
}
```

- [ ] **Step 7: バージョン確認**

```bash
node -v    # Expected: v22.14.0
pnpm -v    # Expected: 10.7.0
```

- [ ] **Step 8: Commit**

```bash
git add .gitignore .tool-versions pnpm-workspace.yaml package.json
git commit -m "chore: init monorepo with asdf + pnpm workspace"
```

---

### Task 2: packages/db — Prismaスキーマ

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/prisma/schema.prisma`
- Create: `packages/db/src/index.ts`

- [ ] **Step 1: packages/db/package.json作成**

```json
{
  "name": "@meguru/db",
  "version": "0.0.1",
  "private": true,
  "main": "src/index.ts",
  "scripts": {
    "generate": "prisma generate",
    "migrate": "prisma migrate dev",
    "migrate:deploy": "prisma migrate deploy",
    "seed": "tsx prisma/seed.ts",
    "studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^6.5.0"
  },
  "devDependencies": {
    "prisma": "^6.5.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: packages/db/tsconfig.json作成**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*", "prisma/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Prismaスキーマ作成**

`packages/db/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  MEMBER
}

enum UserStatus {
  ACTIVE
  PENDING
  INVITED
}

enum CircularType {
  NOTICE
  SURVEY
  ATTENDANCE
}

enum CircularStatus {
  DRAFT
  PUBLISHED
  CLOSED
}

enum TargetType {
  ALL
  GROUP
}

enum QuestionType {
  YES_NO
  SINGLE_CHOICE
  MULTI_CHOICE
  FREE_TEXT
}

enum InvitationMethod {
  EMAIL
  LINE
  QR
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  EXPIRED
}

enum NotificationChannel {
  LINE
}

enum NotificationType {
  NEW_CIRCULAR
  REMINDER
}

enum NotificationStatus {
  PENDING
  SENT
  FAILED
}

model Tenant {
  id        String   @id @default(uuid()) @db.Uuid
  name      String   @db.VarChar(100)
  slug      String   @unique @db.VarChar(50)
  plan      String   @default("free") @db.VarChar(20)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users       User[]
  groups      Group[]
  circulars   Circular[]
  templates   Template[]
  invitations Invitation[]
  notifications Notification[]

  @@map("tenants")
}

model User {
  id           String     @id @default(uuid()) @db.Uuid
  tenantId     String     @db.Uuid
  groupId      String?    @db.Uuid
  name         String     @db.VarChar(50)
  email        String?    @db.VarChar(255)
  phone        String?    @db.VarChar(20)
  lineUserId   String?    @db.VarChar(100)
  passwordHash String?    @db.VarChar(255)
  role         Role       @default(MEMBER)
  status       UserStatus @default(PENDING)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  tenant        Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  group         Group?           @relation(fields: [groupId], references: [id], onDelete: SetNull)
  createdCirculars Circular[]    @relation("CircularCreator")
  reads         CircularRead[]
  answers       CircularAnswer[]
  invitations   Invitation[]     @relation("InvitedBy")
  notifications Notification[]

  @@unique([tenantId, email])
  @@index([tenantId])
  @@index([lineUserId])
  @@map("users")
}

model Group {
  id        String   @id @default(uuid()) @db.Uuid
  tenantId  String   @db.Uuid
  name      String   @db.VarChar(50)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  users  User[]

  @@index([tenantId])
  @@map("groups")
}

model Circular {
  id             String         @id @default(uuid()) @db.Uuid
  tenantId       String         @db.Uuid
  createdById    String         @db.Uuid
  templateId     String?        @db.Uuid
  title          String         @db.VarChar(200)
  body           String         @db.Text
  type           CircularType
  status         CircularStatus @default(DRAFT)
  targetType     TargetType     @default(ALL)
  targetGroupIds String[]       @db.Uuid
  deadline       DateTime?
  publishedAt    DateTime?
  closedAt       DateTime?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  tenant    Tenant             @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdBy User               @relation("CircularCreator", fields: [createdById], references: [id])
  template  Template?          @relation(fields: [templateId], references: [id], onDelete: SetNull)
  reads     CircularRead[]
  questions CircularQuestion[]
  notifications Notification[]

  @@index([tenantId, status])
  @@index([tenantId, createdAt(sort: Desc)])
  @@map("circulars")
}

model CircularRead {
  id         String   @id @default(uuid()) @db.Uuid
  circularId String   @db.Uuid
  userId     String   @db.Uuid
  readAt     DateTime @default(now())

  circular Circular @relation(fields: [circularId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([circularId, userId])
  @@index([circularId])
  @@index([userId])
  @@map("circular_reads")
}

model CircularQuestion {
  id           String       @id @default(uuid()) @db.Uuid
  circularId   String       @db.Uuid
  questionText String       @db.VarChar(500)
  type         QuestionType
  options      Json?
  sortOrder    Int          @default(0)
  createdAt    DateTime     @default(now())

  circular Circular         @relation(fields: [circularId], references: [id], onDelete: Cascade)
  answers  CircularAnswer[]

  @@index([circularId])
  @@map("circular_questions")
}

model CircularAnswer {
  id         String   @id @default(uuid()) @db.Uuid
  questionId String   @db.Uuid
  userId     String   @db.Uuid
  answer     Json
  answeredAt DateTime @default(now())

  question CircularQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  user     User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([questionId, userId])
  @@index([questionId])
  @@index([userId])
  @@map("circular_answers")
}

model Template {
  id           String       @id @default(uuid()) @db.Uuid
  tenantId     String       @db.Uuid
  name         String       @db.VarChar(100)
  description  String?      @db.VarChar(500)
  bodyTemplate String       @db.Text
  type         CircularType
  questions    Json?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  tenant    Tenant     @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  circulars Circular[]

  @@index([tenantId])
  @@map("templates")
}

model Invitation {
  id          String           @id @default(uuid()) @db.Uuid
  tenantId    String           @db.Uuid
  invitedById String           @db.Uuid
  token       String           @unique @db.VarChar(255)
  method      InvitationMethod
  status      InvitationStatus @default(PENDING)
  expiresAt   DateTime
  createdAt   DateTime         @default(now())

  tenant    Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  invitedBy User   @relation("InvitedBy", fields: [invitedById], references: [id])

  @@index([token])
  @@index([tenantId, status])
  @@map("invitations")
}

model Notification {
  id         String             @id @default(uuid()) @db.Uuid
  tenantId   String             @db.Uuid
  userId     String             @db.Uuid
  circularId String             @db.Uuid
  channel    NotificationChannel
  type       NotificationType
  status     NotificationStatus @default(PENDING)
  sentAt     DateTime?
  createdAt  DateTime           @default(now())

  tenant   Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  circular Circular @relation(fields: [circularId], references: [id], onDelete: Cascade)

  @@index([tenantId, status])
  @@index([userId, status])
  @@map("notifications")
}
```

- [ ] **Step 4: packages/db/src/index.ts作成**

```typescript
export { PrismaClient } from "@prisma/client";
export type {
  Tenant,
  User,
  Group,
  Circular,
  CircularRead,
  CircularQuestion,
  CircularAnswer,
  Template,
  Invitation,
  Notification,
  Role,
  UserStatus,
  CircularType,
  CircularStatus,
  TargetType,
  QuestionType,
  InvitationMethod,
  InvitationStatus,
  NotificationChannel,
  NotificationType,
  NotificationStatus,
} from "@prisma/client";
```

- [ ] **Step 5: .env.example作成**

`packages/db/.env.example`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/meguru_dev
```

- [ ] **Step 6: 依存関係インストール**

```bash
cd /Users/masayafukazawa/workspace/me/meguru
pnpm install
```

- [ ] **Step 7: Prisma generate（DBなしでスキーマ検証）**

```bash
pnpm --filter @meguru/db generate
```

Expected: Prisma Client generated successfully

- [ ] **Step 8: Commit**

```bash
git add packages/db/
git commit -m "feat(db): add Prisma schema with all MVP tables"
```

---

### Task 3: apps/api — NestJSプロジェクト初期化

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/nest-cli.json`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/.env.example`

- [ ] **Step 1: apps/api/package.json作成**

```json
{
  "name": "@meguru/api",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "jest --config test/jest-e2e.json"
  },
  "dependencies": {
    "@meguru/db": "workspace:*",
    "@nestjs/common": "^11.0.0",
    "@nestjs/config": "^4.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "bcrypt": "^5.1.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "nodemailer": "^6.9.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "@types/bcrypt": "^5.0.2",
    "@types/express": "^5.0.0",
    "@types/jest": "^29.5.0",
    "@types/node": "^22.0.0",
    "@types/nodemailer": "^6.4.0",
    "@types/passport-jwt": "^4.0.1",
    "jest": "^29.7.0",
    "ts-jest": "^29.2.0",
    "typescript": "^5.7.0"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": { "^.+\\.(t|j)s$": "ts-jest" },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "moduleNameMapper": {
      "^@meguru/db$": "<rootDir>/../../packages/db/src"
    }
  }
}
```

- [ ] **Step 2: apps/api/tsconfig.json作成**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2022",
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "paths": {
      "@meguru/db": ["../../packages/db/src"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

- [ ] **Step 3: apps/api/nest-cli.json作成**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src"
}
```

- [ ] **Step 4: apps/api/.env.example作成**

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/meguru_dev
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
MAGIC_LINK_SECRET=change-me-in-production
MAGIC_LINK_EXPIRES_IN=15m
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=noreply@meguru.app
MAIL_PASS=change-me
APP_URL=http://localhost:3000
```

- [ ] **Step 5: PrismaModuleとPrismaService作成**

`apps/api/src/modules/prisma/prisma.service.ts`:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@meguru/db";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Returns a Prisma client with tenant filter middleware applied.
   * Use this in services that need tenant-scoped queries.
   */
  forTenant(tenantId: string): PrismaClient {
    return this.$extends({
      query: {
        $allOperations({ args, query }) {
          const argsWithTenant = args as Record<string, unknown>;
          if ("where" in args) {
            (argsWithTenant.where as Record<string, unknown>).tenantId =
              tenantId;
          }
          return query(argsWithTenant);
        },
      },
    }) as unknown as PrismaClient;
  }
}
```

`apps/api/src/modules/prisma/prisma.module.ts`:

```typescript
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 6: app.module.ts作成**

`apps/api/src/app.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./modules/prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 7: main.ts作成**

`apps/api/src/main.ts`:

```typescript
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}
bootstrap();
```

- [ ] **Step 8: 依存関係インストール + ビルド確認**

```bash
cd /Users/masayafukazawa/workspace/me/meguru
pnpm install
pnpm --filter @meguru/api build
```

Expected: ビルド成功、dist/main.js が生成される

- [ ] **Step 9: Commit**

```bash
git add apps/api/ pnpm-lock.yaml
git commit -m "feat(api): init NestJS app with Prisma module"
```

---

### Task 4: 共通ガード・デコレータ・フィルタ

**Files:**
- Create: `apps/api/src/common/decorators/current-user.decorator.ts`
- Create: `apps/api/src/common/decorators/roles.decorator.ts`
- Create: `apps/api/src/common/decorators/public.decorator.ts`
- Create: `apps/api/src/common/guards/auth.guard.ts`
- Create: `apps/api/src/common/guards/roles.guard.ts`
- Create: `apps/api/src/common/interceptors/tenant.interceptor.ts`
- Create: `apps/api/src/common/filters/http-exception.filter.ts`
- Test: `apps/api/src/common/guards/auth.guard.spec.ts`
- Test: `apps/api/src/common/interceptors/tenant.interceptor.spec.ts`

- [ ] **Step 1: デコレータ3つ作成**

`apps/api/src/common/decorators/public.decorator.ts`:

```typescript
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

`apps/api/src/common/decorators/roles.decorator.ts`:

```typescript
import { SetMetadata } from "@nestjs/common";
import type { Role } from "@meguru/db";

export const ROLES_KEY = "roles";
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

`apps/api/src/common/decorators/current-user.decorator.ts`:

```typescript
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface CurrentUserPayload {
  userId: string;
  tenantId: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

- [ ] **Step 2: AuthGuard作成**

`apps/api/src/common/guards/auth.guard.ts`:

```typescript
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException("Missing authentication token");
    }

    try {
      request.user = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException("Invalid authentication token");
    }

    return true;
  }

  private extractTokenFromHeader(request: {
    headers: { authorization?: string };
  }): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
```

- [ ] **Step 3: RolesGuard作成**

`apps/api/src/common/guards/roles.guard.ts`:

```typescript
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Role } from "@meguru/db";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

- [ ] **Step 4: TenantInterceptor作成**

`apps/api/src/common/interceptors/tenant.interceptor.ts`:

```typescript
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    if (request.user?.tenantId) {
      request.tenantId = request.user.tenantId;
    }
    return next.handle();
  }
}
```

- [ ] **Step 5: HttpExceptionFilter作成**

`apps/api/src/common/filters/http-exception.filter.ts`:

```typescript
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Response } from "express";

@Catch()
export class HttpExceptionFilterImpl implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : "Internal server error";

    response.status(status).json({
      statusCode: status,
      message,
      error:
        exception instanceof HttpException
          ? exception.name
          : "InternalServerError",
    });
  }
}
```

- [ ] **Step 6: AuthGuardのユニットテスト**

`apps/api/src/common/guards/auth.guard.spec.ts`:

```typescript
import { UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "./auth.guard";

describe("AuthGuard", () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() } as unknown as JwtService;
    reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
    guard = new AuthGuard(jwtService, reflector);
  });

  const mockContext = (authorization?: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization },
          user: undefined,
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    }) as any;

  it("allows public routes", async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);
    expect(await guard.canActivate(mockContext())).toBe(true);
  });

  it("throws on missing token", async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    await expect(guard.canActivate(mockContext())).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("throws on invalid token", async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error());
    await expect(
      guard.canActivate(mockContext("Bearer bad-token")),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("sets user on valid token", async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    const payload = { userId: "1", tenantId: "t1", role: "ADMIN" };
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(payload);
    const ctx = mockContext("Bearer valid-token");
    expect(await guard.canActivate(ctx)).toBe(true);
  });
});
```

- [ ] **Step 7: テスト実行**

```bash
cd /Users/masayafukazawa/workspace/me/meguru
pnpm --filter @meguru/api test -- --testPathPattern=auth.guard.spec
```

Expected: 4 tests pass

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/common/
git commit -m "feat(api): add guards, decorators, interceptors, exception filter"
```

---

### Task 5: Tenantモジュール

**Files:**
- Create: `apps/api/src/modules/tenant/dto/create-tenant.dto.ts`
- Create: `apps/api/src/modules/tenant/tenant.service.ts`
- Create: `apps/api/src/modules/tenant/tenant.controller.ts`
- Create: `apps/api/src/modules/tenant/tenant.module.ts`
- Test: `apps/api/src/modules/tenant/tenant.service.spec.ts`

- [ ] **Step 1: DTOを書く**

`apps/api/src/modules/tenant/dto/create-tenant.dto.ts`:

```typescript
import { IsString, IsNotEmpty, MaxLength, Matches } from "class-validator";

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message: "slug must contain only lowercase letters, numbers, and hyphens",
  })
  slug!: string;
}
```

- [ ] **Step 2: テストを書く**

`apps/api/src/modules/tenant/tenant.service.spec.ts`:

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { TenantService } from "./tenant.service";
import { PrismaService } from "../prisma/prisma.service";
import { ConflictException } from "@nestjs/common";

describe("TenantService", () => {
  let service: TenantService;
  let prisma: {
    tenant: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      tenant: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  describe("create", () => {
    it("creates a tenant with name and slug", async () => {
      const dto = { name: "○○町内会", slug: "marumaru" };
      const expected = { id: "uuid-1", ...dto, plan: "free" };
      prisma.tenant.findUnique.mockResolvedValue(null);
      prisma.tenant.create.mockResolvedValue(expected);

      const result = await service.create(dto);
      expect(result).toEqual(expected);
      expect(prisma.tenant.create).toHaveBeenCalledWith({
        data: { name: "○○町内会", slug: "marumaru" },
      });
    });

    it("throws ConflictException on duplicate slug", async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: "existing" });
      await expect(
        service.create({ name: "Test", slug: "existing-slug" }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("findBySlug", () => {
    it("returns tenant by slug", async () => {
      const tenant = { id: "uuid-1", name: "Test", slug: "test" };
      prisma.tenant.findUnique.mockResolvedValue(tenant);
      expect(await service.findBySlug("test")).toEqual(tenant);
    });
  });
});
```

- [ ] **Step 3: テスト失敗を確認**

```bash
pnpm --filter @meguru/api test -- --testPathPattern=tenant.service.spec
```

Expected: FAIL — TenantService not found

- [ ] **Step 4: TenantService実装**

`apps/api/src/modules/tenant/tenant.service.ts`:

```typescript
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException("Tenant with this slug already exists");
    }

    return this.prisma.tenant.create({
      data: { name: dto.name, slug: dto.slug },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.tenant.findUnique({ where: { slug } });
  }

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException("Tenant not found");
    return tenant;
  }
}
```

- [ ] **Step 5: テスト成功を確認**

```bash
pnpm --filter @meguru/api test -- --testPathPattern=tenant.service.spec
```

Expected: 3 tests pass

- [ ] **Step 6: Controller + Module作成**

`apps/api/src/modules/tenant/tenant.controller.ts`:

```typescript
import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { TenantService } from "./tenant.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";

@Controller("tenants")
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.tenantService.create(dto);
  }

  @Public()
  @Get(":slug")
  findBySlug(@Param("slug") slug: string) {
    return this.tenantService.findBySlug(slug);
  }
}
```

`apps/api/src/modules/tenant/tenant.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { TenantService } from "./tenant.service";
import { TenantController } from "./tenant.controller";

@Module({
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
```

- [ ] **Step 7: AppModuleにTenantModuleを追加**

`apps/api/src/app.module.ts` に `TenantModule` をimport追加。

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/modules/tenant/ apps/api/src/app.module.ts
git commit -m "feat(api): add tenant module with CRUD and slug uniqueness"
```

---

### Task 6: Authモジュール（マジックリンク + パスワード認証）

**Files:**
- Create: `apps/api/src/modules/auth/dto/login.dto.ts`
- Create: `apps/api/src/modules/auth/dto/register.dto.ts`
- Create: `apps/api/src/modules/auth/dto/magic-link.dto.ts`
- Create: `apps/api/src/modules/auth/strategies/jwt.strategy.ts`
- Create: `apps/api/src/modules/auth/auth.service.ts`
- Create: `apps/api/src/modules/auth/auth.controller.ts`
- Create: `apps/api/src/modules/auth/auth.module.ts`
- Test: `apps/api/src/modules/auth/auth.service.spec.ts`

- [ ] **Step 1: DTOs作成**

`apps/api/src/modules/auth/dto/register.dto.ts`:

```typescript
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  MaxLength,
  MinLength,
  IsUUID,
} from "class-validator";
import { Role } from "@meguru/db";

export class RegisterDto {
  @IsUUID()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
```

`apps/api/src/modules/auth/dto/login.dto.ts`:

```typescript
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
```

`apps/api/src/modules/auth/dto/magic-link.dto.ts`:

```typescript
import { IsEmail, IsString, IsUUID } from "class-validator";

export class RequestMagicLinkDto {
  @IsEmail()
  email!: string;

  @IsUUID()
  tenantId!: string;
}

export class VerifyMagicLinkDto {
  @IsString()
  token!: string;
}
```

- [ ] **Step 2: JWT Strategy作成**

`apps/api/src/modules/auth/strategies/jwt.strategy.ts`:

```typescript
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export interface JwtPayload {
  userId: string;
  tenantId: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("JWT_SECRET"),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
```

- [ ] **Step 3: AuthServiceのテスト作成**

`apps/api/src/modules/auth/auth.service.spec.ts`:

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";

jest.mock("bcrypt");

describe("AuthService", () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; create: jest.Mock; update: jest.Mock } };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    jwtService = { signAsync: jest.fn().mockResolvedValue("jwt-token") };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const map: Record<string, string> = {
                MAGIC_LINK_SECRET: "test-secret",
                APP_URL: "http://localhost:3000",
              };
              return map[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe("register", () => {
    it("creates user with hashed password for admin", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: "u1",
        tenantId: "t1",
        role: "ADMIN",
        name: "Admin",
        email: "a@test.com",
      });

      const result = await service.register({
        tenantId: "t1",
        name: "Admin",
        email: "a@test.com",
        password: "password123",
        role: "ADMIN",
      });

      expect(result.accessToken).toBe("jwt-token");
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordHash: "hashed",
            role: "ADMIN",
            status: "ACTIVE",
          }),
        }),
      );
    });

    it("creates user without password (magic link flow)", async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: "u2",
        tenantId: "t1",
        role: "MEMBER",
        name: "Member",
        email: "m@test.com",
      });

      const result = await service.register({
        tenantId: "t1",
        name: "Member",
        email: "m@test.com",
      });

      expect(result.accessToken).toBe("jwt-token");
    });
  });

  describe("loginWithPassword", () => {
    it("returns token on valid credentials", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.user.findFirst.mockResolvedValue({
        id: "u1",
        tenantId: "t1",
        role: "ADMIN",
        passwordHash: "hashed",
      });

      const result = await service.loginWithPassword({
        email: "a@test.com",
        password: "password123",
      });

      expect(result.accessToken).toBe("jwt-token");
    });

    it("throws on invalid password", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      prisma.user.findFirst.mockResolvedValue({
        id: "u1",
        passwordHash: "hashed",
      });

      await expect(
        service.loginWithPassword({
          email: "a@test.com",
          password: "wrong",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
```

- [ ] **Step 4: テスト失敗を確認**

```bash
pnpm --filter @meguru/api test -- --testPathPattern=auth.service.spec
```

Expected: FAIL — AuthService not found

- [ ] **Step 5: AuthService実装**

`apps/api/src/modules/auth/auth.service.ts`:

```typescript
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RequestMagicLinkDto } from "./dto/magic-link.dto";
import * as crypto from "node:crypto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { tenantId: dto.tenantId, email: dto.email },
    });
    if (existing) {
      throw new ConflictException("User with this email already exists");
    }

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : null;

    const user = await this.prisma.user.create({
      data: {
        tenantId: dto.tenantId,
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role ?? "MEMBER",
        status: "ACTIVE",
      },
    });

    const accessToken = await this.generateToken(user);
    return { accessToken, user: { id: user.id, name: user.name, role: user.role } };
  }

  async loginWithPassword(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, status: "ACTIVE" },
    });
    if (!user?.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const accessToken = await this.generateToken(user);
    return { accessToken, user: { id: user.id, name: user.name, role: user.role } };
  }

  async requestMagicLink(dto: RequestMagicLinkDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: { tenantId: dto.tenantId, email: dto.email, status: "ACTIVE" },
    });
    if (!user) {
      // Don't reveal whether user exists
      return { message: "If an account exists, a login link has been sent" };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const secret = this.configService.getOrThrow<string>("MAGIC_LINK_SECRET");
    const payload = { userId: user.id, tenantId: user.tenantId, token };
    const magicToken = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: "15m",
    });

    const appUrl = this.configService.getOrThrow<string>("APP_URL");
    const _link = `${appUrl}/auth/verify?token=${magicToken}`;

    // TODO: Send email with link via nodemailer (Phase 2)
    console.log(`Magic link for ${user.email}: ${_link}`);

    return { message: "If an account exists, a login link has been sent" };
  }

  async verifyMagicLink(token: string) {
    const secret = this.configService.getOrThrow<string>("MAGIC_LINK_SECRET");
    try {
      const payload = await this.jwtService.verifyAsync<{
        userId: string;
        tenantId: string;
      }>(token, { secret });

      const user = await this.prisma.user.findFirst({
        where: { id: payload.userId, tenantId: payload.tenantId, status: "ACTIVE" },
      });
      if (!user) throw new UnauthorizedException("User not found");

      const accessToken = await this.generateToken(user);
      return { accessToken, user: { id: user.id, name: user.name, role: user.role } };
    } catch {
      throw new UnauthorizedException("Invalid or expired magic link");
    }
  }

  private async generateToken(user: {
    id: string;
    tenantId: string;
    role: string;
  }): Promise<string> {
    return this.jwtService.signAsync({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
    });
  }
}
```

- [ ] **Step 6: テスト成功を確認**

```bash
pnpm --filter @meguru/api test -- --testPathPattern=auth.service.spec
```

Expected: 4 tests pass

- [ ] **Step 7: AuthController作成**

`apps/api/src/modules/auth/auth.controller.ts`:

```typescript
import { Body, Controller, Post, Query } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RequestMagicLinkDto } from "./dto/magic-link.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.loginWithPassword(dto);
  }

  @Public()
  @Post("magic-link")
  requestMagicLink(@Body() dto: RequestMagicLinkDto) {
    return this.authService.requestMagicLink(dto);
  }

  @Public()
  @Post("verify")
  verifyMagicLink(@Query("token") token: string) {
    return this.authService.verifyMagicLink(token);
  }
}
```

- [ ] **Step 8: AuthModule作成**

`apps/api/src/modules/auth/auth.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_SECRET"),
        signOptions: { expiresIn: config.get("JWT_EXPIRES_IN", "7d") },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

- [ ] **Step 9: AppModuleにAuthModuleを追加し、AuthGuardをグローバルに設定**

`apps/api/src/app.module.ts` を更新:

```typescript
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { TenantModule } from "./modules/tenant/tenant.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AuthGuard } from "./common/guards/auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    TenantModule,
    AuthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
```

- [ ] **Step 10: ビルド確認**

```bash
pnpm --filter @meguru/api build
```

Expected: ビルド成功

- [ ] **Step 11: Commit**

```bash
git add apps/api/src/modules/auth/ apps/api/src/app.module.ts
git commit -m "feat(api): add auth module with password + magic link authentication"
```

---

### Task 7: User + Groupモジュール

**Files:**
- Create: `apps/api/src/modules/user/dto/create-user.dto.ts`
- Create: `apps/api/src/modules/user/dto/update-user.dto.ts`
- Create: `apps/api/src/modules/user/user.service.ts`
- Create: `apps/api/src/modules/user/user.controller.ts`
- Create: `apps/api/src/modules/user/user.module.ts`
- Create: `apps/api/src/modules/group/dto/create-group.dto.ts`
- Create: `apps/api/src/modules/group/group.service.ts`
- Create: `apps/api/src/modules/group/group.controller.ts`
- Create: `apps/api/src/modules/group/group.module.ts`
- Test: `apps/api/src/modules/user/user.service.spec.ts`
- Test: `apps/api/src/modules/group/group.service.spec.ts`

- [ ] **Step 1: User DTOs作成**

`apps/api/src/modules/user/dto/create-user.dto.ts`:

```typescript
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  MaxLength,
  IsUUID,
} from "class-validator";
import { Role } from "@meguru/db";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsUUID()
  @IsOptional()
  groupId?: string;
}
```

`apps/api/src/modules/user/dto/update-user.dto.ts`:

```typescript
import { PartialType } from "@nestjs/common";
import { CreateUserDto } from "./create-user.dto";

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

- [ ] **Step 2: UserServiceテスト作成**

`apps/api/src/modules/user/user.service.spec.ts`:

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { PrismaService } from "../prisma/prisma.service";

describe("UserService", () => {
  let service: UserService;
  let prisma: {
    user: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe("findByTenant", () => {
    it("returns all users in a tenant", async () => {
      const users = [
        { id: "u1", name: "User 1", tenantId: "t1" },
        { id: "u2", name: "User 2", tenantId: "t1" },
      ];
      prisma.user.findMany.mockResolvedValue(users);

      const result = await service.findByTenant("t1");
      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { tenantId: "t1" },
        include: { group: true },
        orderBy: { name: "asc" },
      });
    });
  });

  describe("update", () => {
    it("updates user fields", async () => {
      const updated = { id: "u1", name: "Updated", tenantId: "t1" };
      prisma.user.update.mockResolvedValue(updated);

      const result = await service.update("t1", "u1", { name: "Updated" });
      expect(result).toEqual(updated);
    });
  });
});
```

- [ ] **Step 3: テスト失敗確認 → UserService実装**

`apps/api/src/modules/user/user.service.ts`:

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTenant(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      include: { group: true },
      orderBy: { name: "asc" },
    });
  }

  async findById(tenantId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { group: true },
    });
    if (!user || user.tenantId !== tenantId) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async update(tenantId: string, userId: string, dto: UpdateUserDto) {
    await this.findById(tenantId, userId);
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
  }

  async approve(tenantId: string, userId: string) {
    await this.findById(tenantId, userId);
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
    });
  }
}
```

- [ ] **Step 4: テスト成功確認**

```bash
pnpm --filter @meguru/api test -- --testPathPattern=user.service.spec
```

Expected: 2 tests pass

- [ ] **Step 5: Group DTO + Service + テスト作成（同パターン）**

`apps/api/src/modules/group/dto/create-group.dto.ts`:

```typescript
import { IsString, IsNotEmpty, MaxLength, IsInt, IsOptional } from "class-validator";

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
```

`apps/api/src/modules/group/group.service.ts`:

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateGroupDto } from "./dto/create-group.dto";

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTenant(tenantId: string) {
    return this.prisma.group.findMany({
      where: { tenantId },
      include: { _count: { select: { users: true } } },
      orderBy: { sortOrder: "asc" },
    });
  }

  async create(tenantId: string, dto: CreateGroupDto) {
    return this.prisma.group.create({
      data: { tenantId, name: dto.name, sortOrder: dto.sortOrder ?? 0 },
    });
  }

  async delete(tenantId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!group || group.tenantId !== tenantId) {
      throw new NotFoundException("Group not found");
    }
    return this.prisma.group.delete({ where: { id: groupId } });
  }
}
```

`apps/api/src/modules/group/group.service.spec.ts`:

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { GroupService } from "./group.service";
import { PrismaService } from "../prisma/prisma.service";

describe("GroupService", () => {
  let service: GroupService;
  let prisma: {
    group: { findMany: jest.Mock; create: jest.Mock; findUnique: jest.Mock; delete: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      group: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
  });

  it("creates a group", async () => {
    prisma.group.create.mockResolvedValue({
      id: "g1",
      tenantId: "t1",
      name: "1班",
      sortOrder: 1,
    });

    const result = await service.create("t1", { name: "1班", sortOrder: 1 });
    expect(result.name).toBe("1班");
  });

  it("lists groups by tenant", async () => {
    prisma.group.findMany.mockResolvedValue([]);
    const result = await service.findByTenant("t1");
    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 6: Controllers + Modules作成**

`apps/api/src/modules/user/user.controller.ts`:

```typescript
import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserService } from "./user.service";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.userService.findByTenant(user.tenantId);
  }

  @Get(":id")
  findOne(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.userService.findById(user.tenantId, id);
  }

  @Roles("ADMIN")
  @Patch(":id")
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(user.tenantId, id, dto);
  }

  @Roles("ADMIN")
  @Post(":id/approve")
  approve(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.userService.approve(user.tenantId, id);
  }
}
```

`apps/api/src/modules/user/user.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

`apps/api/src/modules/group/group.controller.ts`:

```typescript
import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { GroupService } from "./group.service";
import { CreateGroupDto } from "./dto/create-group.dto";

@Controller("groups")
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.groupService.findByTenant(user.tenantId);
  }

  @Roles("ADMIN")
  @Post()
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateGroupDto,
  ) {
    return this.groupService.create(user.tenantId, dto);
  }

  @Roles("ADMIN")
  @Delete(":id")
  delete(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
  ) {
    return this.groupService.delete(user.tenantId, id);
  }
}
```

`apps/api/src/modules/group/group.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { GroupService } from "./group.service";
import { GroupController } from "./group.controller";

@Module({
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
```

- [ ] **Step 7: AppModuleにUser + Groupモジュール追加**

```typescript
// app.module.ts の imports に追加
import { UserModule } from "./modules/user/user.module";
import { GroupModule } from "./modules/group/group.module";
// imports: [..., UserModule, GroupModule]
```

- [ ] **Step 8: 全テスト実行**

```bash
pnpm --filter @meguru/api test
```

Expected: All tests pass

- [ ] **Step 9: Commit**

```bash
git add apps/api/src/modules/user/ apps/api/src/modules/group/ apps/api/src/app.module.ts
git commit -m "feat(api): add user and group modules with CRUD"
```

---

### Task 8: DBマイグレーション + シードデータ + E2Eテスト

**Files:**
- Create: `packages/db/prisma/seed.ts`
- Create: `apps/api/test/jest-e2e.json`
- Create: `apps/api/test/auth.e2e-spec.ts`

- [ ] **Step 1: シードデータ作成**

`packages/db/prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // テナント作成
  const tenant = await prisma.tenant.upsert({
    where: { slug: "sakura-cho" },
    update: {},
    create: {
      name: "さくら町内会",
      slug: "sakura-cho",
    },
  });

  console.log(`Tenant: ${tenant.name} (${tenant.id})`);

  // グループ作成
  const group1 = await prisma.group.create({
    data: { tenantId: tenant.id, name: "1班", sortOrder: 1 },
  });
  const group2 = await prisma.group.create({
    data: { tenantId: tenant.id, name: "2班", sortOrder: 2 },
  });

  // 管理者作成
  const adminHash = await bcrypt.hash("admin12345", 10);
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "山田太郎",
      email: "admin@sakura-cho.example.com",
      passwordHash: adminHash,
      role: "ADMIN",
      status: "ACTIVE",
      groupId: group1.id,
    },
  });

  // 住民作成
  const member1 = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "鈴木花子",
      email: "hanako@example.com",
      role: "MEMBER",
      status: "ACTIVE",
      groupId: group1.id,
    },
  });
  const member2 = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "佐藤次郎",
      email: "jiro@example.com",
      role: "MEMBER",
      status: "ACTIVE",
      groupId: group2.id,
    },
  });

  // 回覧作成（お知らせ）
  const notice = await prisma.circular.create({
    data: {
      tenantId: tenant.id,
      createdById: admin.id,
      title: "4月の集金について",
      body: "今月の自治会費の集金は4月15日に各班長が回ります。",
      type: "NOTICE",
      status: "PUBLISHED",
      targetType: "ALL",
      publishedAt: new Date(),
    },
  });

  // 回覧作成（出欠確認）
  const attendance = await prisma.circular.create({
    data: {
      tenantId: tenant.id,
      createdById: admin.id,
      title: "春の一斉清掃のお知らせ",
      body: "4月20日（日）9:00〜11:00に一斉清掃を実施します。集合場所は公民館前です。",
      type: "ATTENDANCE",
      status: "PUBLISHED",
      targetType: "ALL",
      deadline: new Date("2026-04-18"),
      publishedAt: new Date(),
    },
  });

  await prisma.circularQuestion.create({
    data: {
      circularId: attendance.id,
      questionText: "参加できますか？",
      type: "YES_NO",
      options: ["参加する", "不参加"],
      sortOrder: 0,
    },
  });

  // 既読データ
  await prisma.circularRead.create({
    data: { circularId: notice.id, userId: member1.id },
  });

  console.log("Seed completed");
  console.log(`  Admin: admin@sakura-cho.example.com / admin12345`);
  console.log(`  Members: ${member1.name}, ${member2.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: packages/db/package.jsonにbcrypt依存追加**

`packages/db/package.json` の dependencies に `"bcrypt": "^5.1.1"` と devDependencies に `"@types/bcrypt": "^5.0.2"` を追加。

- [ ] **Step 3: E2Eテスト設定**

`apps/api/test/jest-e2e.json`:

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" },
  "moduleNameMapper": {
    "^@meguru/db$": "<rootDir>/../../packages/db/src"
  }
}
```

- [ ] **Step 4: E2Eテスト作成**

`apps/api/test/auth.e2e-spec.ts`:

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/modules/prisma/prisma.service";

describe("Auth (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.tenant.deleteMany({ where: { slug: "test-cho" } });
    await prisma.$disconnect();
    await app.close();
  });

  let tenantId: string;
  let accessToken: string;

  it("POST /tenants — creates a tenant", async () => {
    const res = await request(app.getHttpServer())
      .post("/tenants")
      .send({ name: "テスト町内会", slug: "test-cho" })
      .expect(201);

    tenantId = res.body.id;
    expect(res.body.name).toBe("テスト町内会");
    expect(res.body.slug).toBe("test-cho");
  });

  it("POST /auth/register — registers admin with password", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        tenantId,
        name: "管理者テスト",
        email: "admin@test-cho.example.com",
        password: "password123",
        role: "ADMIN",
      })
      .expect(201);

    accessToken = res.body.accessToken;
    expect(accessToken).toBeDefined();
    expect(res.body.user.role).toBe("ADMIN");
  });

  it("POST /auth/login — logs in with password", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "admin@test-cho.example.com",
        password: "password123",
      })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
  });

  it("GET /users — returns users (authenticated)", async () => {
    const res = await request(app.getHttpServer())
      .get("/users")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("管理者テスト");
  });

  it("GET /users — rejects without token", async () => {
    await request(app.getHttpServer()).get("/users").expect(401);
  });

  it("POST /groups — creates a group (admin)", async () => {
    const res = await request(app.getHttpServer())
      .post("/groups")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "1班", sortOrder: 1 })
      .expect(201);

    expect(res.body.name).toBe("1班");
  });

});
```

- [ ] **Step 5: DBマイグレーション実行（ローカルPostgreSQL必要）**

```bash
cp packages/db/.env.example packages/db/.env
# DATABASE_URL をローカルPostgreSQLに合わせて編集
# Prismaはスキーマと同じディレクトリの.envを読む
pnpm --filter @meguru/db migrate -- --name init
```

Expected: Migration created and applied

- [ ] **Step 6: シード実行**

```bash
pnpm --filter @meguru/db seed
```

Expected: Seed completed

- [ ] **Step 7: E2Eテスト実行**

```bash
pnpm --filter @meguru/api test:e2e
```

Expected: All E2E tests pass

- [ ] **Step 8: Commit**

```bash
git add packages/db/prisma/seed.ts apps/api/test/
git commit -m "feat: add seed data and auth E2E tests"
```

---

## Phase 1 完了条件

- [ ] pnpm workspace + asdf でモノレポが構築されている
- [ ] Prismaスキーマが全MVPテーブルを定義している
- [ ] NestJS APIが起動し、以下のエンドポイントが動作する:
  - `POST /tenants` — テナント作成
  - `GET /tenants/:slug` — テナント取得
  - `POST /auth/register` — ユーザー登録
  - `POST /auth/login` — パスワードログイン
  - `POST /auth/magic-link` — マジックリンク要求
  - `POST /auth/verify` — マジックリンク検証
  - `GET /users` — ユーザー一覧
  - `PATCH /users/:id` — ユーザー更新
  - `POST /users/:id/approve` — ユーザー承認
  - `GET /groups` — グループ一覧
  - `POST /groups` — グループ作成
  - `DELETE /groups/:id` — グループ削除
- [ ] ユニットテスト + E2Eテストが通る
- [ ] シードデータで動作確認できる

## 次のフェーズ

- **Phase 2**: 回覧CRUD + 既読・回答API + テンプレート
- **Phase 3**: Next.js フロントエンド（shadcn/ui + デザインシステム）
- **Phase 4**: LINE連携（Messaging API + Webhook + Postback）
