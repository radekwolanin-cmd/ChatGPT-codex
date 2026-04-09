#!/usr/bin/env bash
set -euo pipefail

ollama serve &
OLLAMA_PID=$!

cleanup() {
  if kill -0 "$OLLAMA_PID" >/dev/null 2>&1; then
    kill "$OLLAMA_PID"
    wait "$OLLAMA_PID" || true
  fi
}
trap cleanup EXIT INT TERM

for _ in $(seq 1 90); do
  if ollama list >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if [[ "${ENABLE_OPENCLAW}" == "1" ]]; then
  ollama launch openclaw --model "${OPENCLAW_MODEL}" --yes || true
fi

wait "$OLLAMA_PID"
