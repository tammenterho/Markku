#!/bin/bash
set -Eeuo pipefail

APP_NAME="${APP_NAME:-markku-api}"
BASE_DIR="${BASE_DIR:-/var/www/markku}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
GIT_REMOTE="${GIT_REMOTE:-origin}"
RELEASES_DIR="$BASE_DIR/releases"
ARCHIVES_DIR="$BASE_DIR/archives"
SHARED_DIR="$BASE_DIR/shared"
SHARED_ENV_FILE="$SHARED_DIR/.env"
SHARED_UPLOADS_DIR="$SHARED_DIR/uploads"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
RELEASES_TO_KEEP="${RELEASES_TO_KEEP:-5}"
ARCHIVES_TO_KEEP="${ARCHIVES_TO_KEEP:-5}"
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

start_pm2_process() {
	local process_name="$1"
	local entry_file=""

	if [[ -f "src/main.js" ]]; then
		entry_file="src/main.js"
	elif [[ -f "main.js" ]]; then
		entry_file="main.js"
	elif [[ -f "dist/main.js" ]]; then
		entry_file="dist/main.js"
	else
		echo "Unable to find server entry file (tried src/main.js, main.js, dist/main.js)" >&2
		exit 1
	fi

	pm2 start "$entry_file" --name "$process_name" --node-args="-r dotenv/config"
}

resolve_path() {
	local path="$1"

	if command -v readlink >/dev/null 2>&1; then
		readlink -f "$path" 2>/dev/null && return
	fi

	if command -v realpath >/dev/null 2>&1; then
		realpath "$path" 2>/dev/null && return
	fi

	echo "$path"
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

cleanup_release_dirs() {
	local component="$1"
	local keep_count="$2"
	local component_dir="$RELEASES_DIR/$component"
	local releases=()

	mapfile -t releases < <(ls -1dt "$component_dir"/*/ 2>/dev/null || true)
	if (( ${#releases[@]} <= keep_count )); then
		return
	fi

	log "Cleaning old $component releases (keeping $keep_count)"
	for ((i=keep_count; i<${#releases[@]}; i++)); do
		sudo rm -rf "${releases[$i]%/}"
	done
}

cleanup_archive_files() {
	local component="$1"
	local keep_count="$2"
	local archive_dir="$ARCHIVES_DIR/$component"
	local archives=()

	mapfile -t archives < <(ls -1t "$archive_dir"/*.tar.gz 2>/dev/null || true)
	if (( ${#archives[@]} <= keep_count )); then
		return
	fi

	log "Cleaning old $component archives (keeping $keep_count)"
	for ((i=keep_count; i<${#archives[@]}; i++)); do
		sudo rm -f "${archives[$i]}"
	done
}

cleanup_old_artifacts() {
	cleanup_release_dirs "client" "$RELEASES_TO_KEEP"
	cleanup_release_dirs "server" "$RELEASES_TO_KEEP"
	cleanup_archive_files "client" "$ARCHIVES_TO_KEEP"
	cleanup_archive_files "server" "$ARCHIVES_TO_KEEP"
}

prepare_shared_server_assets() {
	local source_server_dir="$1"
	local source_uploads_dir="$source_server_dir/uploads"
	local resolved_source_uploads=""
	local resolved_shared_uploads=""

	sudo mkdir -p "$SHARED_UPLOADS_DIR"

	if [[ ! -f "$SHARED_ENV_FILE" && -f "$source_server_dir/.env" ]]; then
		log "Migrating server .env to shared directory"
		sudo cp "$source_server_dir/.env" "$SHARED_ENV_FILE"
	fi

	if [[ -d "$source_uploads_dir" ]]; then
		resolved_source_uploads="$(resolve_path "$source_uploads_dir")"
		resolved_shared_uploads="$(resolve_path "$SHARED_UPLOADS_DIR")"

		if [[ "$resolved_source_uploads" == "$resolved_shared_uploads" ]]; then
			log "Uploads already point to shared directory, skipping migration copy"
			return
		fi

		if [[ -z "$(ls -A "$SHARED_UPLOADS_DIR" 2>/dev/null || true)" ]]; then
			log "Migrating uploads to shared directory"
			sudo cp -R "$source_uploads_dir/." "$SHARED_UPLOADS_DIR/"
		fi
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
			start_pm2_process "$APP_NAME"
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

log "Updating repository from $GIT_REMOTE/$DEPLOY_BRANCH"
git fetch "$GIT_REMOTE" "$DEPLOY_BRANCH"
git checkout "$DEPLOY_BRANCH"
git pull --ff-only "$GIT_REMOTE" "$DEPLOY_BRANCH"

log "Preparing release directories"
sudo mkdir -p "$RELEASES_DIR/client" "$RELEASES_DIR/server" "$ARCHIVES_DIR/client" "$ARCHIVES_DIR/server" "$SHARED_UPLOADS_DIR"

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

if [[ -n "$PREV_SERVER_TARGET" && -d "$PREV_SERVER_TARGET" ]]; then
	prepare_shared_server_assets "$PREV_SERVER_TARGET"
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

if [[ -f "$SHARED_ENV_FILE" ]]; then
	sudo ln -sfn "$SHARED_ENV_FILE" "$NEW_SERVER_RELEASE/.env"
else
	log "Warning: shared .env not found at $SHARED_ENV_FILE"
fi
sudo ln -sfn "$SHARED_UPLOADS_DIR" "$NEW_SERVER_RELEASE/uploads"

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
	start_pm2_process "$APP_NAME"
fi

ROLLBACK_REQUIRED=false
cleanup_old_artifacts
log "Deployment finished successfully."
