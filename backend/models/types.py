from sqlalchemy.types import TypeDecorator, JSON

class JSONAuto(TypeDecorator):
    """
    Uses JSONB on PostgreSQL, JSON on other dialects.
    """
    impl = JSON
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            from sqlalchemy.dialects.postgresql import JSONB
            return dialect.type_descriptor(JSONB())
        return dialect.type_descriptor(JSON())
