#!/bin/sh

set -e

# Resolve the directory containing this script.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$SCRIPT_DIR"

# Store the PIDs of all child processes.
pids=""

# Cleanup function: gracefully stop all services.
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    
    # Send SIGTERM to all child processes.
    for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
            service_name=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
            echo "   Stopping process $pid ($service_name)..."
            kill -TERM "$pid" 2>/dev/null
        fi
    done
    
    # Wait up to five seconds for all processes to exit.
    sleep 1
    for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
            # If still running, wait up to four more seconds.
            timeout=4
            while [ $timeout -gt 0 ] && kill -0 "$pid" 2>/dev/null; do
                sleep 1
                timeout=$((timeout - 1))
            done
            # Force-stop the process if it is still running.
            if kill -0 "$pid" 2>/dev/null; then
                echo "   Force-stopping process $pid..."
                kill -KILL "$pid" 2>/dev/null
            fi
        fi
    done
    
    echo "✅ All services stopped."
    exit 0
}

echo "🚀 Starting all services..."
echo ""

# Switch to the build directory.
cd "$BUILD_DIR" || exit 1

ls -lah

# Python dependencies are installed into the deployment package during the build rather
# than reusing the sandbox's /home/z/.venv. Next.js and its child processes inherit these paths.
if [ -d "/app/python-runtime/site-packages" ]; then
    export PYTHONPATH="/app/python-runtime/site-packages:/app/next-service-dist${PYTHONPATH:+:$PYTHONPATH}"
    export PATH="/app/python-runtime/site-packages/bin:$PATH"
    export PYTHONDONTWRITEBYTECODE=1
    export PYTHONUNBUFFERED=1
    echo "🐍 Packaged Python runtime enabled: $(python --version 2>&1)"
fi

# Start the Next.js server.
if [ -f "./next-service-dist/server.js" ]; then
    echo "🚀 Starting the Next.js server..."
    cd next-service-dist/ || exit 1
    
    # Set environment variables.
    export NODE_ENV=production
    export PORT="${PORT:-3000}"
    export HOSTNAME="0.0.0.0"
    if [ -z "${DATABASE_URL:-}" ]; then
        echo "❌ DATABASE_URL is required for PostgreSQL"
        exit 1
    fi
    
    # Start Next.js in the background.
    bun server.js &
    NEXT_PID=$!
    pids="$NEXT_PID"
    
    # Wait briefly, then check whether the process started successfully.
    sleep 1
    if ! kill -0 "$NEXT_PID" 2>/dev/null; then
        echo "❌ Failed to start the Next.js server."
        exit 1
    else
        echo "✅ Next.js server started (PID: $NEXT_PID, port: $PORT)."
    fi
    
    cd ../
else
    echo "⚠️  Next.js server file not found: ./next-service-dist/server.js"
fi

# Start mini services.
if [ -f "./mini-services-start.sh" ]; then
    echo "🚀 Starting mini services..."
    
    # Run the startup script from the root directory; it handles mini-services-dist internally.
    sh ./mini-services-start.sh &
    MINI_PID=$!
    pids="$pids $MINI_PID"
    
    # Wait briefly, then check whether the process started successfully.
    sleep 1
    if ! kill -0 "$MINI_PID" 2>/dev/null; then
        echo "⚠️  Mini services may have failed to start; continuing..."
    else
        echo "✅ Mini services started (PID: $MINI_PID)."
    fi
elif [ -d "./mini-services-dist" ]; then
    echo "⚠️  Mini-services directory exists, but its startup script was not found."
else
    echo "ℹ️  Mini-services directory does not exist; skipping."
fi

# Start Caddy (if a Caddyfile is present).
echo "🚀 Starting Caddy..."

# Run Caddy in the foreground as the main process.
echo "✅ Caddy is running in the foreground."
echo ""
echo "🎉 All services started."
echo ""
echo "💡 Press Ctrl+C to stop all services."
echo ""

# Run Caddy as the main process.
exec caddy run --config Caddyfile --adapter caddyfile
