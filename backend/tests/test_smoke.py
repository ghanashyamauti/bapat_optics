import os
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("MOCK_PAYMENTS", "true")

def test_import_and_policy():
    from app.main import app
    paths = set(app.openapi()["paths"])
    assert "/health" in paths
    assert any(path.rstrip("/") == "/api/v1/policies" for path in paths)
