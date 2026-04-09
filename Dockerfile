FROM ollama/ollama:latest AS model-baker

ARG OLLAMA_MODEL=gemma4:26b
ENV OLLAMA_HOST=127.0.0.1:11434

# Bake the requested model into the image.
# This makes first-run startup much faster because the model is already present.
RUN ollama serve > /tmp/ollama-build.log 2>&1 & \
    pid=$! && \
    for i in $(seq 1 60); do \
      ollama list >/dev/null 2>&1 && break; \
      sleep 1; \
    done && \
    ollama pull "$OLLAMA_MODEL" && \
    ollama run "$OLLAMA_MODEL" "reply exactly with READY" >/tmp/model-smoke-test.txt && \
    kill "$pid" && wait "$pid" || true

FROM ollama/ollama:latest

ARG OLLAMA_MODEL=gemma4:26b
ENV OLLAMA_MODEL=${OLLAMA_MODEL}
ENV OLLAMA_HOST=0.0.0.0:11434
ENV ENABLE_OPENCLAW=0
ENV OPENCLAW_MODEL=${OLLAMA_MODEL}

COPY --from=model-baker /root/.ollama /root/.ollama
COPY scripts/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 11434
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
