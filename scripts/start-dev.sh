#!/bin/bash

# =============================================================================
# InamiMapApp 開発環境起動スクリプト (Unix/Mac/Linux)
# =============================================================================
#
# このスクリプトはDocker経由でFirebase Emulatorsを起動し、
# シードデータを投入して開発環境を構築します。
#
# 使用方法:
#   ./scripts/start-dev.sh           # エミュレータを起動
#   ./scripts/start-dev.sh --seed    # エミュレータを起動してシードデータを投入
#   ./scripts/start-dev.sh --web     # Web版の開発サーバーも起動
#   ./scripts/start-dev.sh --clean   # データをクリアして再起動
#
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ヘルパー関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# バナー表示
show_banner() {
    echo ""
    echo "=============================================="
    echo "  井波マップアプリ 開発環境"
    echo "  InamiMapApp Development Environment"
    echo "=============================================="
    echo ""
}

# オプション解析
SEED_DATA=false
START_WEB=false
CLEAN_START=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --seed)
            SEED_DATA=true
            shift
            ;;
        --web)
            START_WEB=true
            shift
            ;;
        --clean)
            CLEAN_START=true
            shift
            ;;
        --help|-h)
            echo "使用方法: $0 [オプション]"
            echo ""
            echo "オプション:"
            echo "  --seed    シードデータを投入"
            echo "  --web     Web版の開発サーバーも起動"
            echo "  --clean   データをクリアして再起動"
            echo "  --help    このヘルプを表示"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# メイン処理
main() {
    show_banner

    cd "$PROJECT_ROOT"

    # クリーンスタートの場合
    if [ "$CLEAN_START" = true ]; then
        log_info "Cleaning up existing data..."
        docker compose down -v 2>/dev/null || true
    fi

    # Docker Composeでエミュレータを起動
    log_info "Starting Firebase Emulators with Docker..."
    docker compose up -d

    # エミュレータの起動を待機
    log_info "Waiting for emulators to start..."
    sleep 10

    # ヘルスチェック
    for i in {1..30}; do
        if curl -s http://localhost:4000 > /dev/null 2>&1; then
            log_success "Firebase Emulators are ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            log_error "Emulators failed to start. Check docker logs."
            exit 1
        fi
        sleep 2
    done

    # シードデータの投入
    if [ "$SEED_DATA" = true ]; then
        log_info "Seeding Firestore with demo data..."
        cd "$PROJECT_ROOT/scripts"
        npm install --silent
        npm run seed
        cd "$PROJECT_ROOT"
        log_success "Seed data imported!"
    fi

    # Web版の開発サーバーを起動
    if [ "$START_WEB" = true ]; then
        log_info "Starting web development server..."
        cd "$PROJECT_ROOT/web"
        npm install --silent
        npm run dev &
        cd "$PROJECT_ROOT"
    fi

    # 接続情報を表示
    echo ""
    echo "=============================================="
    echo "  開発環境が起動しました"
    echo "=============================================="
    echo ""
    echo "Firebase Emulator UI: http://localhost:4000"
    echo "Firestore:            localhost:8080"
    echo "Auth:                 localhost:9099"
    echo "Storage:              localhost:9199"
    echo "Functions:            localhost:5001"
    echo ""
    if [ "$START_WEB" = true ]; then
        echo "Web Admin:            http://localhost:5173"
        echo ""
    fi
    echo "停止するには: docker compose down"
    echo ""
}

main
