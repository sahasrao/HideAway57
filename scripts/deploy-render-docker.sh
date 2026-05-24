#!/usr/bin/env bash
# Deploy HideAway57 to Render from a locally built Docker image (no GitHub).
#
# Prerequisites:
#   1. Docker Desktop (or Colima) installed and running
#   2. Docker Hub account + access token
#   3. RENDER_API_KEY in environment (or .env)
#
# Usage:
#   export RENDER_API_KEY=rnd_...
#   export DOCKERHUB_USERNAME=youruser
#   export DOCKERHUB_TOKEN=dckr_pat_...
#   npm run deploy:render:docker

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env 2>/dev/null || true
  set +a
fi

: "${RENDER_API_KEY:?Set RENDER_API_KEY}"
: "${DOCKERHUB_USERNAME:?Set DOCKERHUB_USERNAME (Docker Hub username)}"
: "${DOCKERHUB_TOKEN:?Set DOCKERHUB_TOKEN (Docker Hub access token)}"

IMAGE="docker.io/${DOCKERHUB_USERNAME}/hideaway57:latest"
RENDER_CLI="${RENDER_CLI:-$HOME/.local/bin/render}"
WORKSPACE_ID="${RENDER_WORKSPACE_ID:-tea-d88a17egvqtc73ejm5dg}"
SERVICE_NAME="${RENDER_SERVICE_NAME:-hideaway57}"
APP_URL="https://${SERVICE_NAME}.onrender.com"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker is not installed."
  echo "Install Docker Desktop: https://docs.docker.com/desktop/setup/install/mac-install/"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "ERROR: Docker daemon is not running. Start Docker Desktop and retry."
  exit 1
fi

echo "==> Fetching Postgres connection from Render..."
DB_JSON="$(curl -sf -H "Authorization: Bearer ${RENDER_API_KEY}" \
  "https://api.render.com/v1/postgres/dpg-d88a3vi8qa3s73f3pqgg-a/connection-info")"
DB_INTERNAL="$(python3 -c 'import json,sys; print(json.load(sys.stdin)["internalConnectionString"])' <<<"$DB_JSON")"
DB_EXTERNAL="$(python3 -c 'import json,sys; print(json.load(sys.stdin)["externalConnectionString"])' <<<"$DB_JSON")"

AUTH_SECRET="${AUTH_SECRET:-$(openssl rand -base64 32)}"

echo "==> Building Docker image (linux/amd64)..."
docker build \
  --platform linux/amd64 \
  --build-arg "DATABASE_URL=${DB_EXTERNAL}" \
  -t "${IMAGE}" \
  .

echo "==> Logging in to Docker Hub..."
echo "${DOCKERHUB_TOKEN}" | docker login -u "${DOCKERHUB_USERNAME}" --password-stdin

echo "==> Pushing image..."
docker push "${IMAGE}"

export RENDER_API_KEY
"${RENDER_CLI}" workspace set "${WORKSPACE_ID}" --confirm >/dev/null 2>&1 || true

EXISTING="$("${RENDER_CLI}" services --output json 2>/dev/null | python3 -c "
import json,sys
data=json.load(sys.stdin)
for item in data:
  svc=item.get('service') or item.get('web_service') or item
  if isinstance(svc,dict) and svc.get('name')=='${SERVICE_NAME}':
    print(svc.get('id',''))
    break
" || true)"

if [[ -z "${EXISTING}" ]]; then
  echo "==> Creating Render image-backed web service..."
  "${RENDER_CLI}" services create \
    --name "${SERVICE_NAME}" \
    --type web_service \
    --image "${IMAGE}" \
    --plan free \
    --region oregon \
    --health-check-path / \
    --env-var "NODE_ENV=production" \
    --env-var "DATABASE_URL=${DB_INTERNAL}" \
    --env-var "AUTH_SECRET=${AUTH_SECRET}" \
    --env-var "AUTH_TRUST_HOST=true" \
    --env-var "AUTH_URL=${APP_URL}" \
    --env-var "NEXTAUTH_URL=${APP_URL}" \
    --auto-deploy no \
    --confirm -o json
else
  echo "==> Service exists (${EXISTING}). Triggering image deploy..."
  "${RENDER_CLI}" deploys create "${EXISTING}" --image "${IMAGE}" --wait --confirm
fi

echo ""
echo "Deploy started."
echo "URL: ${APP_URL}"
echo "Dashboard: https://dashboard.render.com/t/${WORKSPACE_ID}"
echo ""
echo "Set manually in Render if needed: AUTH_GOOGLE_*, STRIPE_*"
