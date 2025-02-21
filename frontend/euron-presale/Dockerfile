FROM node:20-alpine AS production

WORKDIR /app

# Copy the pre-built frontend files
COPY build/ /app/build/

# Install `serve`
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Run the app
CMD ["serve", "-s", "build", "-l", "3000"]
