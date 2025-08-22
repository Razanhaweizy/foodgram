from tests.conftest import auth_headers

def test_tags_crud_admin_only(client, admin_token, user_token):
    # non-admin cannot create
    r = client.post("/tags", json={"name": "Breakfast"}, headers=auth_headers(user_token))
    assert r.status_code in (401, 403)

    # admin creates
    r2 = client.post("/tags", json={"name": "Breakfast"}, headers=auth_headers(admin_token))
    assert r2.status_code == 201
    tid = r2.json()["id"]

    # list
    r3 = client.get("/tags")
    assert r3.status_code == 200
    assert any(t["name"] == "Breakfast" for t in r3.json())

    # get by id
    r4 = client.get(f"/tags/{tid}")
    assert r4.status_code == 200
    assert r4.json()["name"] == "Breakfast"

    # update
    r5 = client.patch(f"/tags/{tid}", json={"name": "Brunch"}, headers=auth_headers(admin_token))
    assert r5.status_code == 200
    assert r5.json()["name"] == "Brunch"

    # delete
    r6 = client.delete(f"/tags/{tid}", headers=auth_headers(admin_token))
    assert r6.status_code == 204
