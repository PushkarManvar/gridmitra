from app.core.migrations import _split_sql_statements, migration_dir


def test_split_sql_statements_simple() -> None:
    sql = "create table a (id int); create table b (id int);"
    assert _split_sql_statements(sql) == [
        "create table a (id int)",
        "create table b (id int)",
    ]


def test_split_sql_statements_ignores_semicolons_inside_quotes() -> None:
    sql = "insert into t (v) values ('a;b'); select 1;"
    statements = _split_sql_statements(sql)
    assert statements == ["insert into t (v) values ('a;b')", "select 1"]


def test_split_sql_statements_ignores_semicolons_in_dollar_quotes() -> None:
    sql = (
        "create function f() returns int language plpgsql as "
        "$$ begin return 1; end; $$; select f();"
    )
    statements = _split_sql_statements(sql)
    assert statements == [
        "create function f() returns int language plpgsql as $$ begin return 1; end; $$",
        "select f()",
    ]


def test_split_sql_statements_ignores_line_and_block_comments() -> None:
    sql = "-- first; comment\ncreate table a (id int); /* block; comment */ select 1;"
    assert _split_sql_statements(sql) == ["create table a (id int)", "select 1"]


def test_migration_files_are_present_and_ordered() -> None:
    files = sorted(migration_dir().glob("*.sql"))
    assert files, "no migration files found"
    assert [path.name for path in files] == sorted(path.name for path in files)