$ErrorActionPreference = "Stop"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "Git is required: https://git-scm.com/downloads"
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker Desktop is required: https://docs.docker.com/desktop/"
}

docker compose version | Out-Null

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example"
}

docker compose config | Out-Null
docker compose up --build -d
docker compose ps

Write-Host "GridMitra is starting at http://localhost:5173"
