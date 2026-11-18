#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/../.zscripts" && pwd)"
TEST_ROOT="$(mktemp -d)"
trap 'rm -rf "$TEST_ROOT"' EXIT

PROJECT_DIR="$TEST_ROOT/project"
BUILD_DIR="$TEST_ROOT/build"
mkdir -p "$PROJECT_DIR/db"
printf 'local-sqlite-data\n' >"$PROJECT_DIR/db/custom.db"

PROJECT_DIR="$PROJECT_DIR" BUILD_DIR="$BUILD_DIR" \
    bash "$SCRIPT_DIR/database-runtime-build.sh"

test ! -e "$BUILD_DIR/db/custom.db"
test "$(cat "$PROJECT_DIR/db/custom.db")" = "local-sqlite-data"

echo "database runtime build tests passed"
