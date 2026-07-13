# 当前抽奖系统说明

当前系统由 React 大屏与 Go 抽奖服务组成。Go 服务是名单、轮次和中奖记录的唯一事实来源；前端不再维护独立的随机结果或在接口失败时本地降级。

## 状态流

```text
浏览器加载 → GET /guests 恢复快照
导入/撤销/重置 → API 原子保存 → 返回完整快照 → 前端替换状态
Space → spinning → S → drawing（请求锁） → chasing → locking → revealed
```

`drawing` 阶段在请求发出前设置，因此快速重复按 S 不会创建多个真实抽奖请求。抽奖接口返回本次中奖者和完整名单快照；前端直接采用该快照，避免网络超时造成的前后端分叉。

## 后端保证

- 随机源：Go `crypto/rand.Int` 与 Fisher–Yates 洗牌。
- 持久化：每个状态变更先写入临时文件再原子替换状态文件；持久化失败时内存状态不变。
- 校验：名单最多 5,000 人、编号去重、去空白、单个编号最多 128 字符；请求体限制为 1 MiB。
- 操作保护：设置 `LOTTERY_ADMIN_TOKEN` 后，所有抽奖 API 都要求 `X-Lottery-Admin-Token`。

部署、密码与现场流程请使用 [QUICK_REFERENCE.md](QUICK_REFERENCE.md)。
