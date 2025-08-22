import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from backend.main import app
from backend.database import get_db
from backend.models.base import Base

TEST_DATABASE_URL = "sqlite:///./test_db.sqlite"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

TEST_PASSWORD = "pass12345"


@pytest.fixture(scope="session", autouse=True)
def create_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    """Yield a fresh SQLAlchemy session per test."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(autouse=True)
def _clean_db_between_tests(db_session):
    """
    Optional but helpful: ensure each test starts with empty tables so tests
    don't affect each other (e.g., username renames).
    """
    for table in reversed(Base.metadata.sorted_tables):
        db_session.execute(table.delete())
    db_session.commit()
    yield


@pytest.fixture
def client(db_session):
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass  # session closed by the fixture

    app.dependency_overrides[get_db] = _override_get_db
    try:
        with TestClient(app) as c:
            yield c
    finally:
        app.dependency_overrides.pop(get_db, None)


def _register(client: TestClient, username: str, email: str, password: str = TEST_PASSWORD):
    return client.post(
        "/auth/register",
        json={"username": username, "email": email, "password": password},
    )


def _login(client: TestClient, login: str, password: str = TEST_PASSWORD):
    # Allows username OR email in the "username" field
    return client.post("/auth/login", data={"username": login, "password": password})


@pytest.fixture
def user_token(client: TestClient):
    _register(client, "alice", "alice@test.com")
    # Login by email so it still works even if the username is later changed
    res = _login(client, "alice@test.com")
    return res.json()["access_token"]


@pytest.fixture
def bob_token(client: TestClient):
    _register(client, "bob", "bob@test.com")
    res = _login(client, "bob@test.com")
    return res.json()["access_token"]


@pytest.fixture
def admin_token(client: TestClient, db_session):
    _register(client, "admin", "admin@test.com")

    from backend.models.user import User
    admin = db_session.query(User).filter(User.username == "admin").first()
    admin.is_admin = True
    db_session.add(admin)
    db_session.commit()

    res = _login(client, "admin@test.com")
    return res.json()["access_token"]


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}
