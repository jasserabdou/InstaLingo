# InstaLingo Dockerized Application

This repository contains a dockerized version of the InstaLingo application, which consists of a React frontend and a Flask backend for language translation.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

### Build and run the application

1. Clone this repository (if you haven't already)

2. Navigate to the project root directory

3. Start the application using Docker Compose:

```
docker-compose up -d
```

This command will build the Docker images for both the frontend and backend services and start the containers in detached mode.

4. Access the application at [http://localhost](http://localhost)

### Stopping the application

To stop the running containers:

```
docker-compose down
```

## Application Architecture

- **Frontend**: React application served by Nginx on port 80
- **Backend**: Flask application running on port 5000

## Development Workflow

### View logs

To view the logs from the containers:

```
docker-compose logs -f
```

### Rebuilding after changes

If you make changes to the application code, you'll need to rebuild the relevant containers:

```
docker-compose build frontend backend
docker-compose up -d
```

## Environment Variables

### Backend Environment Variables
- `FLASK_ENV`: The Flask environment (development/production)
- `FLASK_APP`: The Flask application file
- `SECRET_KEY`: Secret key for Flask sessions

### Frontend Environment Variables
- `REACT_APP_API_URL`: The URL for the backend API

## Volumes

The Docker Compose configuration includes a volume mount for the backend to enable hot reloading of code changes:

```yaml
volumes:
  - ./translation-app:/app
```

## Networking

The services are connected via a bridge network, with the frontend being able to communicate with the backend using the service name `backend`.

## Troubleshooting

If you encounter any issues:

1. Check the logs: `docker-compose logs -f`
2. Ensure all containers are running: `docker-compose ps`
3. Test the backend health endpoint: `curl http://localhost:5000/health`
