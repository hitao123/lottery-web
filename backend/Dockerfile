# syntax=docker/dockerfile:1

FROM golang:1.22-alpine AS build
WORKDIR /src

COPY go.mod go.sum ./
RUN go env -w GOPROXY=https://goproxy.cn,direct \
    && go mod download

COPY . .
ENV CGO_ENABLED=0 GOOS=linux
RUN go build -trimpath -ldflags="-s -w" -o /out/lottery-server ./
RUN mkdir -p /data && chown 65532:65532 /data

# 使用 alpine 替代 gcr.io/distroless，避免国内服务器访问 GCR 超时。
FROM alpine:3.22 AS runtime
RUN addgroup -g 65532 -S app && adduser -u 65532 -S app -G app
WORKDIR /app
COPY --from=build /out/lottery-server /app/lottery-server
COPY --from=build --chown=65532:65532 /data /data

USER 65532:65532
EXPOSE 8080
ENTRYPOINT ["/app/lottery-server"]
