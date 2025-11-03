# Jot List Monorepo

本仓库拆分为前端与后端两个子工程，采用 pnpm workspace 管理：

- 前端：`frontend/`（保持 Vite + Vue 技术栈）
- 后端：`backend/`（Node + TypeScript，Fastify 框架）

## 常用脚本（在仓库根目录执行）

- 开发前端：`pnpm dev:front`
- 开发后端：`pnpm dev:back`
- 前端构建：`pnpm build:front`
- 前端类型检查：`pnpm type-check:front`
- 前端 Lint：`pnpm lint:front`

## 配置重整说明

- Git、Editor 与 Prettier 等通用配置迁移到仓库根目录统一管理。
- Husky hooks 统一放置在根目录的 `.husky/` 中，针对前端运行 `lint-staged` 与类型检查。
- Vite、ESLint 等与前端绑定的配置保留在 `frontend/`。

## 数据存储方案推荐

针对 jot-list 类应用，建议采用以下方案：

1. 开发环境：`SQLite + Prisma`
   - 优点：零运维、文件级数据库易于迁移备份；Prisma 类型安全、迁移便捷。
   - 适合单机/小型部署，后端可直接嵌入 `sqlite` 文件。

2. 生产环境：`PostgreSQL + Prisma`
   - 优点：关系型能力强、生态成熟、云服务选择丰富（如 Supabase、RDS）。
   - 迁移路径：Prisma 同一模型可在开发使用 SQLite、在生产切换到 PostgreSQL。

3. 轻量级/嵌入式备选：`better-sqlite3`（无 ORM）
   - 适合极简后端或边缘部署；手写 SQL，性能与可控性好。

如果选择 Prisma：

- 在 `backend/` 初始化 Prisma：`pnpm add -D prisma && pnpm add @prisma/client`。
- 创建 `prisma/schema.prisma`，选择 `sqlite`（开发）与 `postgresql`（生产）配置。
- 使用 `pnpm prisma migrate dev` 管理迁移。

## 目录结构

```
jot-list/
  frontend/
  backend/
  .husky/
  .vscode/
  package.json
  pnpm-workspace.yaml
  ...
```

## 注意事项

- 统一使用 pnpm（已在根目录强制），Node 版本要求 `>= 22`。
- 如果你已有 CI/CD，请将工作目录调整为仓库根并按 workspace 运行相关脚本。