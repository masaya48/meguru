#!/bin/bash
# 開発用 .env ファイルを .env.example から自動生成するスクリプト
# 既に .env がある場合はスキップ

set -e
cd "$(dirname "$0")/.."

copy_if_missing() {
  local dir=$1
  if [ -f "$dir/.env.example" ] && [ ! -f "$dir/.env" ]; then
    cp "$dir/.env.example" "$dir/.env"
    echo "Created $dir/.env from .env.example"
  elif [ -f "$dir/.env" ]; then
    echo "Skipped $dir/.env (already exists)"
  fi
}

copy_if_missing "apps/api"
copy_if_missing "packages/db"

echo "Done. Review .env files and update secrets if needed."
