# Stage 1: Build the application
FROM rust:1.83 AS builder

# Set working directory
WORKDIR /usr/src/referral-query-service

# Copy the source code
COPY . .

# Build the application
RUN cargo build --release

# Stage 2: Run the application
FROM debian:bookworm-slim

# Install necessary dependencies
RUN apt-get update && apt-get install -y libpq-dev && rm -rf /var/lib/apt/lists/*

# Copy the binary from the builder stage
COPY --from=builder /usr/src/referral-query-service/target/release/referral-query-service /usr/local/bin/

# Expose the port the app runs on
EXPOSE 8083

# Start the application
CMD ["referral-query-service"]