import logging
from pathlib import Path

from sqlalchemy import text

from app.core.database import engine

logger = logging.getLogger(__name__)


def migration_dir() -> Path:
    candidates = [
        Path("/app/db/migrations"),
        Path(__file__).resolve().parents[3] / "db" / "migrations",
    ]
    for candidate in candidates:
        if candidate.is_dir():
            return candidate
    return candidates[-1]


def _split_sql_statements(sql: str) -> list[str]:
    """Split a SQL script into individual statements.

    Splits on ``;`` outside quotes, comments and dollar-quoted strings so each
    statement can be executed separately (asyncpg rejects multi-command scripts).
    """
    statements: list[str] = []
    current: list[str] = []
    single = double = line_comment = block_comment = False
    dollar_quote: str | None = None
    index = 0
    length = len(sql)

    def flush() -> None:
        statement = "".join(current).strip()
        if statement:
            statements.append(statement)
        current.clear()

    while index < length:
        char = sql[index]
        nxt = sql[index + 1] if index + 1 < length else ""

        if line_comment:
            if char == "\n":
                current.append(char)
                line_comment = False
            index += 1
            continue

        if block_comment:
            if char == "*" and nxt == "/":
                current.append(" ")
                index += 2
                block_comment = False
                continue
            index += 1
            continue

        if dollar_quote is not None:
            if sql.startswith(dollar_quote, index):
                current.append(dollar_quote)
                index += len(dollar_quote)
                dollar_quote = None
                continue
            current.append(char)
            index += 1
            continue

        if char == "-" and nxt == "-":
            line_comment = True
            index += 2
            continue

        if char == "/" and nxt == "*":
            block_comment = True
            index += 2
            continue

        if char == "'":
            single = not single
            current.append(char)
            index += 1
            continue

        if char == '"':
            double = not double
            current.append(char)
            index += 1
            continue

        if char == "$" and not single and not double:
            end = sql.find("$", index + 1)
            if end != -1:
                candidate = sql[index : end + 1]
                tag = candidate[1:-1]
                if tag == "" or all(c.isalnum() or c == "_" for c in tag):
                    dollar_quote = candidate
                    current.append(candidate)
                    index = end + 1
                    continue

        if char == ";" and not single and not double:
            flush()
            index += 1
            continue

        current.append(char)
        index += 1

    flush()
    return statements


async def _ensure_tracking_table(connection) -> None:
    await connection.execute(text("create schema if not exists gridmitra"))
    await connection.execute(
        text(
            "create table if not exists gridmitra.schema_migrations ("
            "  filename text primary key,"
            "  applied_at timestamptz not null default now()"
            ")"
        )
    )


async def run_migrations() -> list[str]:
    """Apply pending ordered SQL migrations in a single transaction.

    Returns the list of migration filenames applied. Never edits an already
    applied migration; each filename is recorded in gridmitra.schema_migrations.
    """
    migration_files = sorted(migration_dir().glob("*.sql"))
    applied: list[str] = []

    async with engine.begin() as connection:
        await _ensure_tracking_table(connection)
        existing = {
            row[0]
            for row in await connection.execute(
                text("select filename from gridmitra.schema_migrations")
            )
        }
        for path in migration_files:
            if path.name in existing:
                continue
            for statement in _split_sql_statements(path.read_text(encoding="utf-8")):
                await connection.execute(text(statement))
            await connection.execute(
                text(
                    "insert into gridmitra.schema_migrations (filename) values (:filename)"
                ),
                {"filename": path.name},
            )
            applied.append(path.name)

    return applied