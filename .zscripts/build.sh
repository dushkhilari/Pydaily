#!/bin/bash

# Redirect stderr to stdout so command execution reports errors consistently.
exec 2>&1

set -e

# Resolve the directory containing this script (.zscripts).
# Use $0 to locate the script, consistent with other build scripts.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Next.js project directory.
NEXTJS_PROJECT_DIR="/home/z/my-project"

# Check whether the Next.js project directory exists.
if [ ! -d "$NEXTJS_PROJECT_DIR" ]; then
    echo "❌ Error: Next.js project directory does not exist: $NEXTJS_PROJECT_DIR"
    exit 1
fi

echo "🚀 Building the Next.js app and mini services..."
echo "📁 Next.js project directory: $NEXTJS_PROJECT_DIR"

# Change to the Next.js project directory.
cd "$NEXTJS_PROJECT_DIR" || exit 1

# Set environment variables.
export NEXT_TELEMETRY_DISABLED=1

BUILD_DIR="/tmp/build_fullstack_$BUILD_ID"
echo "📁 Creating build directory: $BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Install dependencies.
echo "📦 Installing dependencies..."
bun install

# Build the Next.js app.
echo "🔨 Building the Next.js app..."
bun run build

# Verify that the standalone server entry was generated.
# Next.js creates .next/standalone/server.js only when output:"standalone" is configured.
# A build can otherwise succeed and produce static files while omitting the standalone server.
# The deployment package would then lack server.js, leaving the reverse proxy without an app
# to serve and causing the platform health check to time out.
# If the entry is missing, restore output:"standalone" only when no conflicting output is set,
# then rebuild. Existing standalone projects skip this recovery path without file changes.
if [ ! -f ".next/standalone/server.js" ]; then
    echo "⚠️  Build did not produce .next/standalone/server.js; checking the Next.js output setting..."
    NEXT_CONFIG_FILE="$(ls next.config.ts next.config.js next.config.mjs next.config.cjs 2>/dev/null | head -1)"

    if [ -z "$NEXT_CONFIG_FILE" ]; then
        echo "❌ Build failed: no next.config.* file was found, so standalone output cannot be configured."
        exit 1
    fi

    if grep -Eq "output\s*:\s*['\"]standalone['\"]" "$NEXT_CONFIG_FILE"; then
        # Standalone is already configured, so the failure has another cause
        # (for example, a build error or custom distDir). Do not modify the config.
        echo "❌ Build failed: $NEXT_CONFIG_FILE already sets output:\"standalone\", but .next/standalone/server.js is missing."
        echo "   Check the build output above for errors or custom build configuration."
        exit 1
    fi

    if grep -Eq "output\s*:\s*['\"]" "$NEXT_CONFIG_FILE"; then
        # Do not override an explicit output setting such as "export"; it conflicts
        # with this standalone deployment model.
        echo "❌ Build failed: $NEXT_CONFIG_FILE sets a non-standalone output (such as \"export\"), which is incompatible with this deployment."
        echo "   Set output:\"standalone\" or use a deployment model that supports the configured output."
        exit 1
    fi

    echo "🔧 Adding output:\"standalone\" to $NEXT_CONFIG_FILE and rebuilding..."
    cp "$NEXT_CONFIG_FILE" "${NEXT_CONFIG_FILE}.zbak"
    # Insert output:"standalone" after the first configuration object brace.
    # This supports common const, export default, and module.exports patterns.
    perl -0pi -e 's/((?:const\s+\w+[^=]*=|export\s+default|module\.exports\s*=)\s*\{)/$1\n  output: "standalone",/' "$NEXT_CONFIG_FILE"

    if ! grep -Eq "output\s*:\s*['\"]standalone['\"]" "$NEXT_CONFIG_FILE"; then
        echo "❌ Could not find a supported config object in $NEXT_CONFIG_FILE; add output:\"standalone\" manually."
        echo "   Current $NEXT_CONFIG_FILE contents:"
        cat "$NEXT_CONFIG_FILE"
        mv "${NEXT_CONFIG_FILE}.zbak" "$NEXT_CONFIG_FILE"
        exit 1
    fi

    echo "🔨 Added output:\"standalone\"; rebuilding..."
    bun run build

    if [ ! -f ".next/standalone/server.js" ]; then
        echo "❌ .next/standalone/server.js is still missing after adding output:\"standalone\" and rebuilding."
        exit 1
    fi
    echo "✅ Recovery succeeded: the standalone server entry was generated."
fi

# Build mini services if the directory exists.
if [ -d "$NEXTJS_PROJECT_DIR/mini-services" ]; then
    echo "🔨 Building mini services..."
    # Use the mini-services scripts in the workspace-agent directory.
    sh "$SCRIPT_DIR/mini-services-install.sh"
    sh "$SCRIPT_DIR/mini-services-build.sh"

    # Copy mini-services-start.sh into the mini-services-dist directory.
    echo "  - Copying mini-services-start.sh to $BUILD_DIR"
    cp "$SCRIPT_DIR/mini-services-start.sh" "$BUILD_DIR/mini-services-start.sh"
    chmod +x "$BUILD_DIR/mini-services-start.sh"
else
    echo "ℹ️  Mini-services directory does not exist; skipping."
fi

# Copy all build artifacts into the temporary build directory.
echo "📦 Collecting build artifacts in $BUILD_DIR..."

# Copy the Next.js standalone output.
if [ -d ".next/standalone" ]; then
    echo "  - Copying .next/standalone"
    cp -r .next/standalone "$BUILD_DIR/next-service-dist/"
fi

# Copy Next.js static files.
if [ -d ".next/static" ]; then
    echo "  - Copying .next/static"
    mkdir -p "$BUILD_DIR/next-service-dist/.next"
    cp -r .next/static "$BUILD_DIR/next-service-dist/.next/"
fi

# Copy the public directory.
if [ -d "public" ]; then
    echo "  - Copying public"
    cp -r public "$BUILD_DIR/next-service-dist/"
fi

# Python does not inherit the workspace-agent's /home/z/.venv. If the project includes
# Python source or dependency manifests, package production dependencies during the build
# and preserve the source's project-relative paths.
PROJECT_DIR="$NEXTJS_PROJECT_DIR" BUILD_DIR="$BUILD_DIR" \
    bash "$SCRIPT_DIR/python-runtime-build.sh"

# PostgreSQL is external to the deployment artifact; never package a local database.
PROJECT_DIR="$NEXTJS_PROJECT_DIR" BUILD_DIR="$BUILD_DIR" \
    bash "$SCRIPT_DIR/database-runtime-build.sh"

# Copy the Caddyfile if present.
if [ -f "Caddyfile" ]; then
    echo "  - Copying Caddyfile"
    cp Caddyfile "$BUILD_DIR/"
else
    echo "ℹ️  Caddyfile not found; skipping."
fi

# Copy the start.sh script.
echo "  - Copying start.sh to $BUILD_DIR"
cp "$SCRIPT_DIR/start.sh" "$BUILD_DIR/start.sh"
chmod +x "$BUILD_DIR/start.sh"

# Create the archive at $BUILD_DIR.tar.gz.
PACKAGE_FILE="${BUILD_DIR}.tar.gz"
echo ""
echo "📦 Packaging build artifacts into $PACKAGE_FILE..."
cd "$BUILD_DIR" || exit 1
tar -czf "$PACKAGE_FILE" .
cd - > /dev/null || exit 1

# # Remove the temporary directory.
# rm -rf "$BUILD_DIR"

echo ""
echo "✅ Build complete. All artifacts were packaged into $PACKAGE_FILE."
echo "📊 Archive size:"
ls -lh "$PACKAGE_FILE"
