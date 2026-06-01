# lottery-server

`lottery-web` 项目的抽奖后端，使用 Go + Gin 实现，提供加密安全的随机抽奖（基于 `crypto/rand.Int`，等价于 Node 的 `crypto.randomInt`），用于替换前端 `Math.floor(Math.random() * available.length)`。

## 安全随机说明

| 方案 | 来源 | 取模偏差 | 是否加密安全 |
|---|---|---|---|
| `Math.random()`                          | V8 xorshift128+ | 取决于实现 | 否 |
| `crypto.getRandomValues + (% n)`         | OS CSPRNG       | **存在**   | 是 |
| `crypto.getRandomValues + rejection`     | OS CSPRNG       | 无         | 是 |
| Go `rand.Int(rand.Reader, big.NewInt(n))`| OS CSPRNG       | 无（内置 rejection sampling） | 是 |

本服务使用第四种，并封装为 `lottery.SecureIndex` / `lottery.SecureShuffle`。

## 运行

```bash
# 直接运行
cd backend
go run .

# 自定义端口
PORT=9090 go run .

# Docker
docker build -t lottery-server -f Dockerfile .
docker run --rm -p 8080:8080 lottery-server
```

## 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `PORT`              | `8080` | HTTP 监听端口 |
| `GIN_MODE`          | `release` | Gin 模式，可设为 `debug` |
| `CORS_ALLOW_ORIGIN` | `*` | 开发态 CORS 白名单；线上经 Nginx 同源代理可忽略 |

## HTTP 接口

所有响应均为 `application/json`。错误响应：`{ "error": "...", "code": "..." }`。

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET`  | `/healthz`                      | 健康检查 |
| `POST` | `/api/lottery/guests`           | 覆盖式上传宾客列表 `{ "codes": ["001","002",...] }` |
| `GET`  | `/api/lottery/guests`           | 查询全量宾客与当前轮次 |
| `POST` | `/api/lottery/draw`             | 抽奖 `{ "count": 1 }`；返回 `{ "winners": Guest[] }` |
| `POST` | `/api/lottery/winners/:id/revoke` | 撤销中奖 |
| `POST` | `/api/lottery/reset`            | 全部重置 |

### Guest 数据结构（与前端 `frontend/src/types/Guest` 对齐）

```json
{
  "id": 1,
  "code": "001",
  "hasWon": false,
  "wonAtRound": 1
}
```

## 测试

```bash
cd backend
go test ./...
```

包含：
- `SecureIndex` 范围与近似均匀分布测试
- `SecureShuffle` 不丢元素
- `Store.Draw` 多人抽奖无重复
- 并发 200 次 Draw 不重复中奖
- `Revoke` / `Reset` 语义

## 与前端的契约

- 前端 `useLotteryStore.selectWinnerAsync` 调用 `POST /api/lottery/draw`
- 调用失败或超时（默认 1500ms）自动降级为本地 `Math.random()`，体验不受影响
- 生产环境通过 Nginx 反向代理：浏览器 → `https://<host>/api/...` → `http://api:8080/api/...`
