FROM golang:1.21.0-alpine

# Install required packages
RUN apk add --no-cache gcc g++ make sqlite-dev

# Set working directory
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN go build -o main .

# Create a data directory for the SQLite database
RUN mkdir -p /app/data

# Set the database path environment variable
ENV DB_PATH=/app/data/notetime.db

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["./main"]