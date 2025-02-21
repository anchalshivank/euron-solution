# Stage 1: Build the application
FROM rust:1.83 AS builder

# Set working directory
WORKDIR /usr/src/referral-generation-service

# Copy the source code
COPY . .

# Build the application
RUN cargo build --release

# Stage 2: Run the application
FROM debian:bookworm-slim

# Install necessary dependencies
RUN apt-get update && apt-get install -y libpq-dev && rm -rf /var/lib/apt/lists/*

# Copy the binary from the builder stage
COPY --from=builder /usr/src/referral-generation-service/target/release/referral-generation-service /usr/local/bin/

# Expose the port the app runs on
EXPOSE 8081

# Start the application
CMD ["referral-generation-service"]