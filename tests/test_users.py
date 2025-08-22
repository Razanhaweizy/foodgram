from tests.conftest import auth_headers, _register, _login

def test_update_me_and_get_me(client, user_token):
    # Update profile
    r = client.patch("/users/me", json={"username": "alice2"}, headers=auth_headers(user_token))
    assert r.status_code == 200
    assert r.json()["username"] == "alice2"
    # Verify get_me
    r2 = client.get("/users/me", headers=auth_headers(user_token))
    assert r2.status_code == 200
    assert r2.json()["username"] == "alice2"

def test_update_me_unique_checks(client, user_token):
    # Create another user
    _register(client, "other", "other@example.com")
    # Try to take their username
    r = client.patch("/users/me", json={"username": "other"}, headers=auth_headers(user_token))
    assert r.status_code == 400

def test_delete_me(client, user_token):
    r = client.delete("/users/me", headers=auth_headers(user_token))
    assert r.status_code == 204
    # subsequent me should fail
    r2 = client.get("/users/me", headers=auth_headers(user_token))
    assert r2.status_code == 401

def test_admin_list_users(client, admin_token):
    # seed
    _register(client, "u1", "u1@example.com")
    _register(client, "u2", "u2@example.com")
    r = client.get("/users", headers=auth_headers(admin_token))
    assert r.status_code == 200
    body = r.json()
    assert "items" in body and body["total"] >= 2

def test_admin_get_user_by_id(client, admin_token):
    _register(client, "target", "target@example.com")
    # find by list and get its id
    r = client.get("/users", headers=auth_headers(admin_token))
    uid = [u["id"] for u in r.json()["items"] if u["username"] == "target"][0]
    r2 = client.get(f"/users/{uid}", headers=auth_headers(admin_token))
    assert r2.status_code == 200
    assert r2.json()["username"] == "target"

def test_admin_update_user(client, admin_token):
    _register(client, "toedit", "toedit@example.com")
    # get id
    r = client.get("/users", headers=auth_headers(admin_token))
    uid = [u["id"] for u in r.json()["items"] if u["username"] == "toedit"][0]
    # update
    r2 = client.patch(f"/users/{uid}", json={"username": "toedit2"}, headers=auth_headers(admin_token))
    assert r2.status_code == 200
    assert r2.json()["username"] == "toedit2"

def test_admin_delete_user(client, admin_token):
    _register(client, "todelete", "todelete@example.com")
    r = client.get("/users", headers=auth_headers(admin_token))
    uid = [u["id"] for u in r.json()["items"] if u["username"] == "todelete"][0]
    r2 = client.delete(f"/users/{uid}", headers=auth_headers(admin_token))
    assert r2.status_code == 204
