#!/bin/bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

export APP_NAME="markku-api-demo"
export BASE_DIR="/var/www/demo-markku"
export DEPLOY_BRANCH="demo"
export GIT_REMOTE="origin"

bash "$SCRIPT_DIR/deploy.sh"
