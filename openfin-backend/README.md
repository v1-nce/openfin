# OpenFin Backend

FastAPI service scaffolded for deployment on Render.

## Local development

```bash
uv venv
uv pip install -r requirements.txt
uv run uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000` with docs at `/docs`.

