# lottery-server

婚礼抽奖后端（Go + Gin）。它是名单、轮次和中奖记录的唯一事实来源，使用 `crypto/rand` 进行无偏安全随机抽取。

## 运行

```bash
cd backend
LOTTERY_ADMIN_TOKEN='现场操作密码' \
CORS_ALLOW_ORIGIN='http://localhost:5173' \
go run .
```

Docker Compose 部署前，复制根目录 `.env.example` 为 `.env` 并替换 `LOTTERY_ADMIN_TOKEN`；Compose 会拒绝在未设置密码时启动。状态保存于 Docker volume `lottery-data`，重启容器不会清空抽奖记录。

## 环境变量

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `PORT` | `8080` | HTTP 端口 |
| `LOTTERY_DATA_FILE` | `./data/lottery-state.json` | 状态文件路径；Docker 使用 `/data/lottery-state.json` |
| `LOTTERY_ADMIN_TOKEN` | 空（仅本地开发） | API 操作密码。线上必须设置 |
| `CORS_ALLOW_ORIGIN` | 空 | 仅 Vite 跨源开发时设置；线上 Nginx 同源时无需设置 |
| `GIN_MODE` | `release` | Gin 模式 |

所有 `/api/lottery/*` 接口在设置操作密码后都需要请求头 `X-Lottery-Admin-Token`。前端控制面板会把用户输入的密码只保存在当前标签页的 `sessionStorage`。

## 接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/healthz` | 健康检查，不要求操作密码 |
| GET | `/api/lottery/guests` | 获取完整权威快照 |
| POST | `/api/lottery/guests` | 覆盖导入名单，返回完整快照 |
| POST | `/api/lottery/draw` | 安全抽取；返回中奖者和完整快照 |
| GET | `/api/lottery/draws/:requestID` | 获取已提交抽奖的原始结果，用于超时恢复 |
| POST | `/api/lottery/winners/:id/revoke` | 撤销中奖，返回完整快照 |
| POST | `/api/lottery/reset` | 清空中奖记录，返回完整快照 |

名单限制：最多 5,000 人，编号去除首尾空白后不得为空、不得重复、长度不超过 128 字符。请求体最大 1 MiB。

`POST /draw` 必须携带客户端生成的 `requestId`。同一 ID 重试只会返回第一次提交的中奖结果，不会再抽一人。

## 测试

```bash
cd backend
go test ./...
go vet ./...
```
