#!/usr/bin/env bash

# ==============================================================================
# LogiSyncPRO — Autonomous Enterprise Logistics Platform
# Startup Automation Script
# ==============================================================================

set -e

# Change directory to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Color formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Print banner
print_banner() {
  echo -e "${CYAN}${BOLD}"
  echo "  _                 _ ____                    ____  ____   ___  "
  echo " | |    ___   __ _ (_)  _ \ _   _ _ __   ___ |  _ \|  _ \ / _ \ "
  echo " | |   / _ \ / _\` || | |_) | | | | '_ \ / __|| |_) | |_) | | | |"
  echo " | |__| (_) | (_| || |  _ <| |_| | | | | (__ |  __/|  _ <| |_| |"
  echo " |_____\___/ \__, ||_|_| \_\\__,_|_| |_|\___||_|   |_| \_\\___/ "
  echo "             |___/                                              "
  echo -e "${NC}"
  echo -e "${BLUE}${BOLD}Enterprise Logistics Coordination & Telemetry Platform${NC}"
  echo -e "${BLUE}------------------------------------------------------------${NC}"
}

# Print help message
show_help() {
  print_banner
  echo -e "${BOLD}Usage:${NC} ./start.sh [OPTION]"
  echo ""
  echo -e "${BOLD}Options:${NC}"
  echo -e "  ${GREEN}dev, -w, --web${NC}         Start Vite dev server with integrated API middleware (Default)"
  echo -e "  ${GREEN}all, -a, --all${NC}         Start both Web Frontend + APK Backend concurrently"
  echo -e "  ${GREEN}prod, -p, --prod${NC}       Build frontend and start standalone production server"
  echo -e "  ${GREEN}apk, -b, --apk${NC}         Start only the Android APK backend (port 5050)"
  echo -e "  ${GREEN}docker, -d, --docker${NC}   Build and run containers using Docker Compose"
  echo -e "  ${GREEN}help, -h, --help${NC}       Display this help menu"
  echo ""
  echo -e "${BOLD}Examples:${NC}"
  echo "  ./start.sh              # Starts Vite web app + API middleware (http://localhost:5173)"
  echo "  ./start.sh --all        # Starts Web (port 5173) and APK Backend (port 5050)"
  echo "  ./start.sh --prod       # Runs production build and starts server (port 3000)"
  echo "  ./start.sh --docker     # Launches all services in Docker containers"
  echo ""
}

# Check prerequisites
check_prerequisites() {
  if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js is not installed or not found in PATH.${NC}"
    echo "Please install Node.js (v18+ recommended) from https://nodejs.org/"
    exit 1
  fi

  if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERROR] npm is not installed or not found in PATH.${NC}"
    exit 1
  fi
}

# Ensure root environment file exists
ensure_root_env() {
  if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
      echo -e "${YELLOW}[!] Root .env not found. Creating .env from .env.example...${NC}"
      cp .env.example .env
      echo -e "${GREEN}[✓] Created .env successfully.${NC}"
    else
      echo -e "${YELLOW}[!] Warning: Neither .env nor .env.example was found in root.${NC}"
    fi
  fi
}

# Ensure root dependencies are installed
ensure_root_dependencies() {
  if [ ! -d "node_modules" ]; then
    echo -e "${CYAN}[i] node_modules not found. Installing root dependencies...${NC}"
    npm install
    echo -e "${GREEN}[✓] Root dependencies installed.${NC}"
  fi
}

# Ensure APK backend environment file exists
ensure_apk_env() {
  if [ -d "apk-backend" ]; then
    if [ ! -f "apk-backend/.env" ]; then
      if [ -f "apk-backend/.env.example" ]; then
        echo -e "${YELLOW}[!] apk-backend/.env not found. Creating from .env.example...${NC}"
        cp apk-backend/.env.example apk-backend/.env
        echo -e "${GREEN}[✓] Created apk-backend/.env successfully.${NC}"
      fi
    fi
  fi
}

# Ensure APK backend dependencies are installed
ensure_apk_dependencies() {
  if [ -d "apk-backend" ]; then
    if [ ! -d "apk-backend/node_modules" ]; then
      echo -e "${CYAN}[i] apk-backend/node_modules not found. Installing dependencies...${NC}"
      (cd apk-backend && npm install)
      echo -e "${GREEN}[✓] apk-backend dependencies installed.${NC}"
    fi
  fi
}

# Mode 1: Start Web Dev Server (Default)
start_dev() {
  print_banner
  check_prerequisites
  ensure_root_env
  ensure_root_dependencies

  echo -e "${GREEN}${BOLD}Starting LogiSyncPRO Web Dev Server...${NC}"
  echo -e "${CYAN}→ Vite Dev Server with Neon API Middleware on /api/*${NC}"
  echo -e "${CYAN}→ Press Ctrl+C to stop.${NC}"
  echo ""
  npm run dev
}

# Mode 2: Start Both Web Dev & APK Backend Concurrently
start_all() {
  print_banner
  check_prerequisites
  ensure_root_env
  ensure_root_dependencies
  ensure_apk_env
  ensure_apk_dependencies

  echo -e "${GREEN}${BOLD}Starting LogiSyncPRO (Web App + APK Backend)...${NC}"
  echo -e "${CYAN}→ Web App:     http://localhost:5173 (with /api/*)${NC}"
  echo -e "${CYAN}→ APK Backend: http://localhost:5050${NC}"
  echo -e "${YELLOW}Press Ctrl+C to gracefully stop all services.${NC}"
  echo ""

  # Graceful cleanup on interrupt
  APK_PID=""
  VITE_PID=""

  cleanup() {
    echo ""
    echo -e "${YELLOW}[*] Shutting down all services...${NC}"
    if [ -n "$APK_PID" ] && kill -0 "$APK_PID" 2>/dev/null; then
      kill "$APK_PID" 2>/dev/null || true
    fi
    if [ -n "$VITE_PID" ] && kill -0 "$VITE_PID" 2>/dev/null; then
      kill "$VITE_PID" 2>/dev/null || true
    fi
    wait 2>/dev/null || true
    echo -e "${GREEN}[✓] All services stopped.${NC}"
    exit 0
  }

  trap cleanup SIGINT SIGTERM EXIT

  # Start APK backend in subshell
  (
    cd apk-backend
    npm run dev
  ) &
  APK_PID=$!

  # Start Vite frontend
  npm run dev &
  VITE_PID=$!

  # Wait for both processes
  wait "$VITE_PID" "$APK_PID"
}

# Mode 3: Standalone Production Server
start_prod() {
  print_banner
  check_prerequisites
  ensure_root_env
  ensure_root_dependencies

  echo -e "${GREEN}${BOLD}Building production bundle...${NC}"
  npm run build

  echo ""
  echo -e "${GREEN}${BOLD}Starting Standalone Production Server...${NC}"
  echo -e "${CYAN}→ Server entry: server/prodServer.js${NC}"
  echo -e "${CYAN}→ Listening on: http://localhost:${PORT:-3000}${NC}"
  echo -e "${CYAN}→ Press Ctrl+C to stop.${NC}"
  echo ""
  npm start
}

# Mode 4: APK Backend Only
start_apk() {
  print_banner
  check_prerequisites
  ensure_apk_env
  ensure_apk_dependencies

  echo -e "${GREEN}${BOLD}Starting LogiSyncPRO Android APK REST API...${NC}"
  echo -e "${CYAN}→ Listening on: http://localhost:5050${NC}"
  echo -e "${CYAN}→ Press Ctrl+C to stop.${NC}"
  echo ""
  cd apk-backend
  npm run dev
}

# Mode 5: Docker Compose
start_docker() {
  print_banner
  if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERROR] Docker is not installed or not in PATH.${NC}"
    echo "Please install Docker Desktop: https://www.docker.com/"
    exit 1
  fi

  ensure_root_env
  ensure_apk_env

  echo -e "${GREEN}${BOLD}Building and starting containers via Docker Compose...${NC}"
  echo -e "${CYAN}→ Web App:     http://localhost:3000${NC}"
  echo -e "${CYAN}→ APK Backend: http://localhost:5050${NC}"
  echo ""
  docker compose up --build
}

# Command dispatching
MODE="${1:-dev}"

case "$MODE" in
  dev|-w|--web)
    start_dev
    ;;
  all|-a|--all)
    start_all
    ;;
  prod|-p|--prod)
    start_prod
    ;;
  apk|-b|--apk|--apk-backend)
    start_apk
    ;;
  docker|-d|--docker)
    start_docker
    ;;
  help|-h|--help)
    show_help
    ;;
  *)
    echo -e "${RED}Unknown option: $MODE${NC}"
    echo ""
    show_help
    exit 1
    ;;
esac
