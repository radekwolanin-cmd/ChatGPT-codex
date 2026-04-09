# Curated Ollama Docker Image (Gemma 4 26B A4B + OpenClaw)

This repository builds a **curated Docker image** for Ollama with:

- `gemma4:26b` baked into the image at build time (Gemma 4 26B A4B variant in Ollama library)
- Optional OpenClaw startup using local Ollama model
- A ready-to-run `docker-compose.yml`

## Why this image

The official Ollama container (`ollama/ollama`) is the recommended base image. This setup layers on top of it and pre-pulls the model so first use does not require downloading at runtime.

## Build

```bash
docker compose build
```

> Note: Building this image downloads a very large model (tens of GB).

## Run Ollama API

```bash
docker compose up -d
curl http://localhost:11434/api/tags
```

Test generation:

```bash
curl http://localhost:11434/api/generate \
  -d '{"model":"gemma4:26b","prompt":"Say hello in one short sentence.","stream":false}'
```

## Run OpenClaw locally with Ollama

OpenClaw integration is supported via:

```bash
ollama launch openclaw --model gemma4:26b --yes
```

In this image, you can auto-launch OpenClaw by setting:

```yaml
environment:
  ENABLE_OPENCLAW: "1"
  OPENCLAW_MODEL: gemma4:26b
```

Then restart:

```bash
docker compose up -d --build
```

## Notes

- If you add a volume mount on `/root/.ollama`, it can override baked-in models.
- For GPU hosts, start from Ollama's NVIDIA/ROCm runtime recommendations and adapt compose runtime settings.

## Research references used

- Ollama GitHub README (install and OpenClaw integration)
- Ollama Docker Hub page (official image + Docker run patterns)
- Ollama OpenClaw docs (headless mode and model selection)
- Ollama Gemma 4 library page (model tag naming)
