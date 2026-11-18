#!/bin/bash

set -euo pipefail

: "${BUILD_DIR:?BUILD_DIR is required}"

echo "Skipping local database packaging; PostgreSQL is configured at runtime via DATABASE_URL."
