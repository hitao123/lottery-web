package lottery

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func testRouter(token string) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	RegisterRoutes(r, NewStore(), token)
	return r
}

func request(t *testing.T, router http.Handler, method, path, token string, body []byte) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(method, path, bytes.NewReader(body))
	if len(body) > 0 {
		req.Header.Set("Content-Type", "application/json")
	}
	if token != "" {
		req.Header.Set("X-Lottery-Admin-Token", token)
	}
	res := httptest.NewRecorder()
	router.ServeHTTP(res, req)
	return res
}

func TestRoutesRequireConfiguredAdminToken(t *testing.T) {
	router := testRouter("operator-secret")
	if res := request(t, router, http.MethodGet, "/api/lottery/guests", "", nil); res.Code != http.StatusUnauthorized {
		t.Fatalf("want 401 without token, got %d: %s", res.Code, res.Body.String())
	}
	if res := request(t, router, http.MethodGet, "/api/lottery/guests", "operator-secret", nil); res.Code != http.StatusOK {
		t.Fatalf("want 200 with token, got %d: %s", res.Code, res.Body.String())
	}
}

func TestUploadRejectsDuplicateCodes(t *testing.T) {
	router := testRouter("token")
	res := request(t, router, http.MethodPost, "/api/lottery/guests", "token", []byte(`{"codes":["001","001"]}`))
	if res.Code != http.StatusBadRequest {
		t.Fatalf("want 400, got %d: %s", res.Code, res.Body.String())
	}
}

func TestDrawReturnsAuthoritativeSnapshot(t *testing.T) {
	router := testRouter("token")
	res := request(t, router, http.MethodPost, "/api/lottery/guests", "token", []byte(`{"codes":["001","002"]}`))
	if res.Code != http.StatusOK {
		t.Fatalf("upload failed: %d %s", res.Code, res.Body.String())
	}

	res = request(t, router, http.MethodPost, "/api/lottery/draw", "token", []byte(`{"count":1,"requestId":"draw-1"}`))
	if res.Code != http.StatusOK {
		t.Fatalf("draw failed: %d %s", res.Code, res.Body.String())
	}
	var response DrawResponse
	if err := json.Unmarshal(res.Body.Bytes(), &response); err != nil {
		t.Fatal(err)
	}
	if len(response.Winners) != 1 || len(response.Guests) != 2 || response.CurrentRound != 2 {
		t.Fatalf("unexpected draw snapshot: %+v", response)
	}
	if !response.Winners[0].HasWon || response.Winners[0].WonAtRound == nil {
		t.Fatalf("winner was not committed in response: %+v", response.Winners[0])
	}
}

func TestDrawRequestIDIsIdempotent(t *testing.T) {
	router := testRouter("token")
	if res := request(t, router, http.MethodPost, "/api/lottery/guests", "token", []byte(`{"codes":["001","002"]}`)); res.Code != http.StatusOK {
		t.Fatalf("upload failed: %d %s", res.Code, res.Body.String())
	}
	body := []byte(`{"count":1,"requestId":"retry-safe"}`)
	first := request(t, router, http.MethodPost, "/api/lottery/draw", "token", body)
	second := request(t, router, http.MethodPost, "/api/lottery/draw", "token", body)
	if first.Code != http.StatusOK || second.Code != http.StatusOK {
		t.Fatalf("idempotent draw failed: first=%d second=%d", first.Code, second.Code)
	}
	var firstResponse, secondResponse DrawResponse
	if err := json.Unmarshal(first.Body.Bytes(), &firstResponse); err != nil {
		t.Fatal(err)
	}
	if err := json.Unmarshal(second.Body.Bytes(), &secondResponse); err != nil {
		t.Fatal(err)
	}
	if firstResponse.Winners[0].ID != secondResponse.Winners[0].ID || secondResponse.CurrentRound != 2 {
		t.Fatalf("retry changed draw result: first=%+v second=%+v", firstResponse, secondResponse)
	}
}
