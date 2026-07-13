# syntax=docker/dockerfile:1

FROM golang:1.22-alpine AS build
WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
ENV CGO_ENABLED=0 GOOS=linux
RUN go build -trimpath -ldflags="-s -w" -o /out/lottery-server ./
RUN mkdir -p /data && chown 65532:65532 /data

FROM gcr.io/distroless/static:nonroot AS runtime
WORKDIR /app
COPY --from=build /out/lottery-server /app/lottery-server
COPY --from=build --chown=nonroot:nonroot /data /data

USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/app/lottery-server"]
