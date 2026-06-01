package lottery

// Guest 与前端 frontend/src/types/Guest 字段一一对齐（JSON 小驼峰）。
type Guest struct {
	ID         int    `json:"id"`
	Code       string `json:"code"`
	HasWon     bool   `json:"hasWon"`
	WonAtRound *int   `json:"wonAtRound,omitempty"`
}

// UploadRequest 用于上传完整 codes 列表，覆盖式重置内存态。
type UploadRequest struct {
	Codes []string `json:"codes"`
}

// DrawRequest 用于发起抽奖；Count 缺省视为 1。
type DrawRequest struct {
	Count int `json:"count"`
}

// DrawResponse 返回本次抽中的获奖者列表。
type DrawResponse struct {
	Winners []Guest `json:"winners"`
}

// GuestsResponse 用于查询全量宾客。
type GuestsResponse struct {
	Guests       []Guest `json:"guests"`
	CurrentRound int     `json:"currentRound"`
	Total        int     `json:"total"`
}

// ErrorResponse 统一错误响应体。
type ErrorResponse struct {
	Error string `json:"error"`
	Code  string `json:"code"`
}
