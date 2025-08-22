from tests.conftest import auth_headers

def _make_recipe(client, token, title="R"):
    r = client.post("/recipes", json={
        "title": title, "description": "", "ingredients": ["a"], "steps": ["b"]
    }, headers=auth_headers(token))
    return r.json()["id"]

def test_like_flow_idempotent(client, user_token):
    rid = _make_recipe(client, user_token, "LikeTest")
    # like once
    r1 = client.post(f"/recipes/{rid}/like", headers=auth_headers(user_token))
    assert r1.status_code == 201
    assert r1.json()["liked"] is True
    # like again (idempotent)
    r2 = client.post(f"/recipes/{rid}/like", headers=auth_headers(user_token))
    assert r2.status_code in (200, 201)
    # count
    r3 = client.get(f"/recipes/{rid}/likes/count")
    assert r3.status_code == 200
    assert r3.json()["count"] == 1
    # check /me
    r4 = client.get(f"/recipes/{rid}/likes/me", headers=auth_headers(user_token))
    assert r4.status_code == 200
    assert r4.json()["liked"] is True
    # unlike
    r5 = client.delete(f"/recipes/{rid}/like", headers=auth_headers(user_token))
    assert r5.status_code == 200
    assert r5.json()["liked"] is False
    # count again
    r6 = client.get(f"/recipes/{rid}/likes/count")
    assert r6.status_code == 200
    assert r6.json()["count"] == 0
