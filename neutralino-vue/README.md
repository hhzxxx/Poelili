# Poelili Neutralino.js + Vue3 重构方案（含外部 .NET 图色/HTTP/更新器）

## 目标
- 保留：多账号 Cookie 管理、市集物品搜索监听、接口代理池与自动调度。
- 新增：窗口自动化/图色识别（通过外部 .NET EXE 调用）。
- 打包：Windows 可安装包，总体积 < 20MB。
- 支持远程更新：应用内检查并下载，调用独立 Updater 原子替换，支持回滚。

## 总体架构
- 宿主：Neutralino.js（极轻原生壳，无 Node 运行时）。
- UI：Vue3 + Vite（SPA），通过 Neutralino WebView 加载。
- 数据：SQLite（sql.js WASM，定期持久化到 data/db/app.db）。
- 系统能力桥：使用 Neutralino 的 `os.spawnProcess`/`filesystem`/`events` 等访问系统。
- 外部 EXE：
  - `ImgOps.exe`：窗口操作与图色识别（点击/键入/截图/模板匹配/找色/等待像素）。
  - `HttpCli.exe`：带代理/超时/重试/限速的 HTTP 客户端。
  - `Updater.exe`：远程更新器（下载包后原子替换，支持回滚与重启）。

## 目录结构
```
neutralino-vue/
  app/
    index.html
    vite-env.d.ts
    src/
      main.ts
      router/
      store/
      pages/
        Dashboard.vue
        Accounts.vue
        Trade.vue
        Proxy.vue
        Automation.vue
        Settings.vue
      components/
      assets/
      api/
        http.ts
        proxyClient.ts
        automationBridge.ts
        cookies.ts
        trade.ts
        scheduler.ts
        updater.ts
        storage.ts
        logger.ts
        process.ts
        paths.ts
      domain/
        auth/
        trade/
        proxy/
        jobs/
      styles/
    vite.config.ts
  resources/                 # 由 Vite 构建产物填充
  bin/
    ImgOps.exe               # 外部 .NET 图色/自动化工具
    HttpCli.exe              # 外部 .NET HTTP 客户端
    Updater.exe              # 外部 .NET 自更新替换器
  data/
    db/app.db
    logs/app.log
    config/
      app.config.json
      proxy.config.json
      trade.rules.json
      automation.config.json
  neutralino.config.json
  package.json
  README.md
```

## 模块职责
- `api/process.ts`：统一进程调用封装（spawn、收集 stdout/stderr、超时、JSON 解析）。
- `api/paths.ts`：可配置的外部工具与数据目录路径解析，默认指向 `bin/` 与 `data/`。
- `api/storage.ts`：sql.js 初始化、DB 迁移、周期性 flush；配置 JSON 读写。
- `api/logger.ts`：结构化日志（文件滚动+UI 控制台），脱敏敏感信息。
- `api/http.ts`：基础 fetch；
- `api/proxyClient.ts`：经由 `HttpCli.exe` 的请求（代理、超时、重试、限速、路由策略）。
- `api/cookies.ts`：多账号 Cookie 加密存取（可复用 .NET DPAPI 子命令）、校验、脱敏。
- `api/trade.ts`：市集监听引擎（规则模型、轮询、去重、事件通知）。
- `api/scheduler.ts`：轻量任务调度（interval/cron/once）。
- `api/automationBridge.ts`：自动化/图色动作桥（点击、键入、模板匹配、等待像素等）。
- `api/updater.ts`：更新检查、下载包、调用 `Updater.exe` 执行替换与重启。

## Neutralino 配置关键点（neutralino.config.json）
- `defaultMode: "window"`，加载 `resources/index.html`。
- `nativeAllowList` 启用 `os.*`/`filesystem.*`/`events.*`/`tray.*` 等。
- 指定 `cli.binaryName` 以设置产物名称。

示例：
```json
{
  "applicationId": "poelili.app",
  "defaultMode": "window",
  "documentRoot": "/resources/",
  "url": "/index.html",
  "enableServer": false,
  "nativeAllowList": [
    "os.*",
    "filesystem.*",
    "events.*",
    "computer.*",
    "clipboard.*",
    "tray.*",
    "window.*",
    "notification.*"
  ],
  "modes": {
    "window": {
      "title": "Poelili",
      "width": 1100,
      "height": 720,
      "resizable": true,
      "fullScreen": false,
      "icon": "/resources/assets/icon.png"
    }
  },
  "cli": { "binaryName": "Poelili" }
}
```

## 构建与打包
- 前端：`vite build` → 输出复制到 `resources/`。
- 应用：`neu build --release` 生成 Windows 可执行包。
- 体积控制：
  - 避免引入大型图像/AI库；
  - `sql.js` ~1.1MB；
  - 外部 EXE 采用 .NET 8 Self-Contained + Trim + SingleFile（每个 1~3MB）。

`package.json` 脚本建议：
```json
{
  "scripts": {
    "dev": "neu run -- --window",
    "build:ui": "cd app && vite build && cd .. && node scripts/copy-build.js",
    "build": "npm run build:ui && neu build --release",
    "start": "neu run"
  },
  "devDependencies": {
    "vite": "^5",
    "vue": "^3",
    "vue-router": "^4",
    "pinia": "^2",
    "typescript": "^5"
  },
  "dependencies": {
    "sql.js": "^1.11.0",
    "zod": "^3"
  }
}
```

`scripts/copy-build.js`：将 `app/dist` 拷贝至 `resources/`。

## 配置与数据
- `data/config/app.config.json`：语言、日志级别、更新通道、数据目录。
- `data/config/proxy.config.json`：代理源、健康检查、评分权重、路由策略、限速。
- `data/config/trade.rules.json`：监听规则集合（关键词/价位/词缀/频率/触发动作）。
- `data/config/automation.config.json`：外部工具路径与命令模板、默认阈值。
- SQLite 表（示例）：
  - `accounts(id, name, tags, cookie_enc, verified_at, status)`
  - `proxies(id, url, score, latency_ms, fail_count, alive, last_checked_at)`
  - `listen_rules(id, name, query_json, freq_s, last_cursor, enabled)`
  - `events(id, type, payload_json, created_at)`

## 外部 EXE 协议
- 所有命令行参数使用 `--key=value`，标准输出 JSON：`{ ok: boolean, data?: any, error?: string }`。

### ImgOps.exe（图色/自动化）
- 子命令：
  - `click --x= --y= [--win=Title]`
  - `keypress --text=STRING`
  - `find-template --img=PATH --th=0.85 [--area=x,y,w,h]`
  - `wait-pixel --x= --y= --rgb=#RRGGBB --timeout=MS`
- 输出：
```json
{ "ok": true, "data": { "x": 100, "y": 200, "score": 0.91 } }
```

### HttpCli.exe（HTTP with Proxy）
- 参数：`--url= --method=GET --timeout=8000 --proxy=http://user:pass@host:port --h:Header=Value --body=...`
- 输出：
```json
{ "status": 200, "headers": { "content-type": "application/json" }, "body": "...", "durationMs": 123 }
```

### Updater.exe（远程更新）
- 参数：`--zip=... --appdir=... --relaunch=1`。
- 行为：退出主进程后解压覆盖，失败自动回滚，成功后可重启主程序。

## 前端关键接口（供页面调用）
- Cookies
  - `listAccounts()`/`saveCookie(accountId, cookie)`/`verify(accountId)`
- Trade
  - `addRule(rule)`/`removeRule(id)`/`getResults(ruleId, cursor?)`/`pollOnce()`
- Proxy
  - `addSource(url)`/`getBest()`/`metrics()`/`requestViaProxy(req)`
- Scheduler
  - `register(job)`/`start(id)`/`stop(id)`
- Automation
  - `clickAt({x,y,windowTitle?})`/`findTemplate({imagePath,area?,threshold?})`
- Updater
  - `checkLatest(feedUrl)`/`downloadAndUpdate(latest)`

## 市集监听策略
- 规则驱动：多规则并发，频率由 `freq_s` 控制。
- 去重：对象指纹（关键字段 hash），滑动窗口保留最近 N 条。
- 网络：统一通过 `proxyClient`，失败自适应退避，代理熔断/恢复。
- 通知：系统通知/托盘提示/声音，触发自动化（可选）。

## 代理池与调度
- 来源拉取（定时），健康检测（延迟+成功率），
- 评分模型：`score = w1*(1/latency) + w2*successRate`，指数衰减更新；
- 路由策略：轮询/加权最优/按账号绑定；
- 限速器：令牌桶（rps+burst）。

## 安全
- Cookie 加密：建议在 `HttpCli.exe` 增加 `encrypt/decrypt` 子命令调用 DPAPI；
- UI 脱敏显示；导出需二次确认并加密。
- 日志脱敏（头部与 cookie）。

## 远程更新
- 服务端 `latest.json`：
```json
{ "version": "0.2.1", "url": "https://cdn.example.com/poelili/app-0.2.1.zip", "notes": "...", "hash": "sha256:..." }
```
- 客户端：检查→下载→调用 `Updater.exe` 执行替换→重启。

## 迁移步骤（建议 2-3 周）
1) 初始化 Neutralino+Vue3 骨架，落地 `process.ts`/`paths.ts`/`storage.ts`/`logger.ts`。
2) 代理池与 `HttpCli.exe` 通路，完成健康检测、评分与路由、限速器。
3) 市集监听规则/轮询/去重/通知；接入代理网络层。
4) 自动化桥与 `ImgOps.exe`，实现点击/等待像素/模板匹配；提供调试页。
5) 自更新链路与设置页；体积优化与安装包出包。

## 验收标准
- 包体 ≤ 20MB；
- 多账号 Cookie 管理稳定、加密存储、导入/验证可用；
- 市集监听持续产出有效结果，具备去重与告警；
- 代理池可用性 > 95%，失败自动切换，调度无阻塞；
- 自动化模块可运行基础脚本或调用外部工具完成动作；
- 自更新可用，可灰度/回滚。

## 下一步
- 生成脚手架文件：`neutralino.config.json`、根 `package.json`、`app/` 基础代码与 `scripts/copy-build.js`。
- 放入占位的 `bin/*.exe` 路径并提供模拟输出，以便端到端验证后替换为真实 .NET 工具。
