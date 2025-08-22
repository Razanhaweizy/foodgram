from tests.conftest import auth_headers

def _make_recipe(client, token, title="S"):
    r = client.post("/recipes", json={
        "title": title, "description": "", "ingredients": ["a"], "steps": ["b"]
    }, headers=auth_headers(token))
    return r.json()["id"]

def test_save_flow_idempotent_and_listing(client, user_token):
    rid1 = _make_recipe(client, user_token, "S1")
    rid2 = _make_recipe(client, user_token, "S2")

    # save both
    r1 = client.post(f"/recipes/{rid1}/save", headers=auth_headers(user_token))
    r2 = client.post(f"/recipes/{rid2}/save", headers=auth_headers(user_token))
    assert r1.status_code == 201 and r2.status_code == 201

    # list my saves
    rlist = client.get("/recipes/me/saves", headers=auth_headers(user_token))
    assert rlist.status_code == 200
    body = rlist.json()
    assert body["total"] >= 2
    assert any(item["title"] == "S1" for item in body["items"])

    # idempotent save (again)
    r3 = client.post(f"/recipes/{rid1}/save", headers=auth_headers(user_token))
    assert r3.status_code in (200, 201)

    # unsave
    r4 = client.delete(f"/recipes/{rid1}/save", headers=auth_headers(user_token))
    assert r4.status_code == 200
    assert r4.json()["saved"] is False
