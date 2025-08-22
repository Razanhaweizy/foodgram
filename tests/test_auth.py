from tests.conftest import _register, _login, auth_headers

def test_register_ok(client):
    r = _register(client, "user1", "user1@example.com")
    assert r.status_code == 201
    data = r.json()
    assert data["username"] == "user1"
    assert data["email"] == "user1@example.com"

def test_register_duplicate_username(client):
    _register(client, "dupe", "dupe1@example.com")
    r = _register(client, "dupe", "dupe2@example.com")
    assert r.status_code == 400

def test_register_duplicate_email(client):
    _register(client, "u1", "dupe@example.com")
    r = _register(client, "u2", "dupe@example.com")
    assert r.status_code == 400

def test_login_ok_username(client):
    _register(client, "loginme", "loginme@example.com")
    r = _login(client, "loginme")
    assert r.status_code == 200
    assert "access_token" in r.json()
    assert "refresh_token" in r.json()

def test_login_ok_email(client):
    _register(client, "loginemail", "loginemail@example.com")
    r = _login(client, "loginemail@example.com")
    assert r.status_code == 200

def test_login_invalid(client):
    r = _login(client, "nope", "wrong")
    assert r.status_code == 401

def test_me_needs_auth(client):
    r = client.get("/auth/me")
    assert r.status_code == 401

def test_me_ok(client):
    _register(client, "meuser", "meuser@example.com")
    login = _login(client, "meuser")
    token = login.json()["access_token"]
    r = client.get("/auth/me", headers=auth_headers(token))
    assert r.status_code == 200
    assert r.json()["username"] == "meuser"

def test_refresh_ok(client):
    _register(client, "ref", "ref@example.com")
    r = _login(client, "ref")
    refresh = r.json()["refresh_token"]
    r2 = client.post("/auth/refresh", json={"refresh_token": refresh})
    assert r2.status_code == 200
    body = r2.json()
    assert "access_token" in body and "refresh_token" in body

def test_logout_noop(client):
    # no server state; should still return 204
    r = client.post("/auth/logout")
    assert r.status_code in (200, 204)
