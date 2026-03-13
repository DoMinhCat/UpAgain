FROM golang:1.26-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o upcycle-api main.go

FROM alpine:3.21
RUN apk add --no-cache ca-certificates

WORKDIR /root/

COPY --from=builder /app/upcycle-back .
COPY .env . 

EXPOSE 8080
CMD ["./upcycle-back"]