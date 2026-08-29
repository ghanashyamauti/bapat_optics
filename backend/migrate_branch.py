from sqlalchemy import text
from app.core.database import engine

with engine.begin() as connection:
    connection.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS branch_stock JSONB DEFAULT '{}'::jsonb"))
print("branch inventory ready")
