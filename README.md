# Euron Referral System

This project is a microservices-based referral system that allows users to generate, claim, and query referral codes efficiently.

## Features
- **Referral Code Management** – Generate, claim, and track referral codes.
- **Microservices Architecture** – Independent services for better scalability.
- **PostgreSQL Database** – Centralized storage for referral data.
- **Dockerized Deployment** – Easy setup using Docker & Docker Compose.

## Technologies Used
- **Backend:** Rust (ntex framework)
- **Database:** PostgreSQL
- **Containerization:** Docker & Docker Compose

## Architecture
The system consists of three microservices that interact with a shared PostgreSQL database:
1. **Referral Generation Service** – Creates unique referral codes.
2. **Referral Claiming Service** – Manages the claiming of referral codes.
3. **Referral Querying Service** – Retrieves referral details.

## Prerequisites
Ensure you have the following installed:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Setup & Running the Application
Clone the repository and start the services:

```sh
git clone https://github.com/anchalshivank/euron-solution.git
cd euron-solution
docker compose up --build
```

> ⚠️ The setup may take some time initially.

Once the backend services are up and running, open the frontend by navigating to:

**[http://localhost:3000](http://localhost:3000)**

## API Testing
- Use the provided **Postman collection** (`Euron.postman_collection.json`) to test endpoints.
- Alternatively, you can use `curl` or any API testing tool.

## Deployment
Currently, the application has not been deployed. Deployment updates will be provided soon.

## Troubleshooting
If `docker-compose` fails, try the following:
1. Ensure Docker is running.
2. Check running containers:
   ```sh
   docker ps -a
   ```
3. Stop and remove existing containers if needed:
   ```sh
   docker rm -f $(docker ps -aq)
   ```
4. Restart Docker and rerun:
   ```sh
   docker compose up --build
   ```

## Contact
For issues, feedback, or modifications, feel free to reach out.

---

**Author:** Shivank Anchal

