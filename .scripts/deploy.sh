#!/bin/bash
set -Eeuo pipefail

APP_NAME="markku-api"
BASE_DIR="/var/www/markku"
RELEASES_DIR="$BASE_DIR/releases"
ARCHIVES_DIR="$BASE_DIR/archives"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
ROLLBACK_REQUIRED=false
PREV_CLIENT_TARGET=""
PREV_SERVER_TARGET=""

log() {
	echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

require_cmd() {
	if ! command -v "$1" >/dev/null 2>&1; then
		echo "Missing required command: $1" >&2
		exit 1
	fi
}

archive_target() {
	local component="$1"
	local target_path="$2"

	if [[ -n "$target_path" && -d "$target_path" ]]; then
		local archive_file="$ARCHIVES_DIR/$component/${TIMESTAMP}-${component}.tar.gz"
		local archive_parent
		archive_parent="$(dirname "$target_path")"
		local archive_name
		archive_name="$(basename "$target_path")"

		log "Archiving current $component build -> $archive_file"
		sudo mkdir -p "$ARCHIVES_DIR/$component"
		sudo tar -C "$archive_parent" -czf "$archive_file" "$archive_name"
	fi
}

rollback() {
	if [[ "$ROLLBACK_REQUIRED" != true ]]; then
		return
	fi

	log "Deployment failed. Starting rollback..."

	if [[ -n "$PREV_CLIENT_TARGET" && -d "$PREV_CLIENT_TARGET" ]]; then
		log "Reverting client symlink"
		sudo ln -sfn "$PREV_CLIENT_TARGET" "$BASE_DIR/client"
	fi

	if [[ -n "$PREV_SERVER_TARGET" && -d "$PREV_SERVER_TARGET" ]]; then
		log "Reverting server symlink"
		sudo ln -sfn "$PREV_SERVER_TARGET" "$BASE_DIR/server"

		if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
			pm2 reload "$APP_NAME" --update-env || pm2 restart "$APP_NAME"
		else
			cd "$BASE_DIR/server"
			npm run start:prod
		fi
	fi

	log "Rollback completed."
}

trap rollback ERR

log "Deployment started..."

require_cmd git
require_cmd npm
require_cmd pm2
require_cmd tar
require_cmd sudo

# Make sure NVM is available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_DIR"

log "Updating repository"
git fetch origin main
git pull --ff-only origin main

log "Preparing release directories"
sudo mkdir -p "$RELEASES_DIR/client" "$RELEASES_DIR/server" "$ARCHIVES_DIR/client" "$ARCHIVES_DIR/server"

CURRENT_CLIENT_LINK="$BASE_DIR/client"
CURRENT_SERVER_LINK="$BASE_DIR/server"

if [[ -L "$CURRENT_CLIENT_LINK" ]]; then
	PREV_CLIENT_TARGET="$(readlink "$CURRENT_CLIENT_LINK")"
elif [[ -d "$CURRENT_CLIENT_LINK" ]]; then
	PREV_CLIENT_TARGET="$RELEASES_DIR/client/legacy-${TIMESTAMP}"
	log "Migrating legacy client directory"
	sudo mv "$CURRENT_CLIENT_LINK" "$PREV_CLIENT_TARGET"
fi

if [[ -L "$CURRENT_SERVER_LINK" ]]; then
	PREV_SERVER_TARGET="$(readlink "$CURRENT_SERVER_LINK")"
elif [[ -d "$CURRENT_SERVER_LINK" ]]; then
	PREV_SERVER_TARGET="$RELEASES_DIR/server/legacy-${TIMESTAMP}"
	log "Migrating legacy server directory"
	sudo mv "$CURRENT_SERVER_LINK" "$PREV_SERVER_TARGET"
fi

archive_target "client" "$PREV_CLIENT_TARGET"
archive_target "server" "$PREV_SERVER_TARGET"

log "Building client"
cd "$REPO_DIR/client"
npm ci
npm run build

NEW_CLIENT_RELEASE="$RELEASES_DIR/client/$TIMESTAMP"
sudo mkdir -p "$NEW_CLIENT_RELEASE"
sudo cp -R dist "$NEW_CLIENT_RELEASE/dist"

log "Building server"
cd "$REPO_DIR/server"
npm ci
npm run build

NEW_SERVER_RELEASE="$RELEASES_DIR/server/$TIMESTAMP"
sudo mkdir -p "$NEW_SERVER_RELEASE"
sudo cp -R dist/* package.json package-lock.json "$NEW_SERVER_RELEASE"

log "Installing production server dependencies in release"
cd "$NEW_SERVER_RELEASE"
sudo npm ci --omit=dev

ROLLBACK_REQUIRED=true

log "Switching current symlinks to new releases"
sudo ln -sfn "$NEW_CLIENT_RELEASE" "$CURRENT_CLIENT_LINK"
sudo ln -sfn "$NEW_SERVER_RELEASE" "$CURRENT_SERVER_LINK"

log "Reloading PM2 process with minimal downtime"
cd "$CURRENT_SERVER_LINK"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
	pm2 reload "$APP_NAME" --update-env
else
	npm run start:prod
fi

ROLLBACK_REQUIRED=false
log "Deployment finished successfully."
