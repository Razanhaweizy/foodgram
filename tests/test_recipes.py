from tests.conftest import auth_headers

def test_create_recipe(client, user_token):
    payload = {
        "title": "Pancakes",
        "description": "Fluffy",
        "ingredients": ["flour", "milk", "egg"],
        "steps": ["mix", "cook"]
    }
    r = client.post("/recipes", json=payload, headers=auth_headers(user_token))
    assert r.status_code == 201
    rec = r.json()
    assert rec["title"] == "Pancakes"
    assert rec["likes_count"] == 0
    assert rec["saves_count"] == 0

def test_list_recipes_basic(client, user_token):
    r = client.get("/recipes")
    assert r.status_code == 200
    body = r.json()
    assert "items" in body and "total" in body

def test_get_recipe_by_id(client, user_token):
    # Create recipe
    r = client.post("/recipes", json={
        "title": "Toast",
        "description": None,
        "ingredients": ["bread"],
        "steps": ["toast it"]
    }, headers=auth_headers(user_token))
    rec_id = r.json()["id"]
    r2 = client.get(f"/recipes/{rec_id}")
    assert r2.status_code == 200
    body = r2.json()
    assert body["id"] == rec_id
    assert body["likes_count"] == 0
    assert body["saves_count"] == 0

def test_update_recipe_permissions(client, user_token, bob_token):
    # Alice creates recipe
    r = client.post("/recipes", json={
        "title": "Alice Dish",
        "description": "",
        "ingredients": ["x"],
        "steps": ["y"]
    }, headers=auth_headers(user_token))
    rec_id = r.json()["id"]
    # Bob tries to edit -> forbidden
    r2 = client.patch(f"/recipes/{rec_id}", json={"title": "Hacked"}, headers=auth_headers(bob_token))
    assert r2.status_code in (403, 404)  # your router returns 403; if your get wrapper differs 404 can appear
    # Owner can edit
    r3 = client.patch(f"/recipes/{rec_id}", json={"title": "Alice Dish 2"}, headers=auth_headers(user_token))
    assert r3.status_code == 200
    assert r3.json()["title"] == "Alice Dish 2"

def test_delete_recipe_permissions(client, user_token, bob_token):
    r = client.post("/recipes", json={
        "title": "ToDelete",
        "description": "",
        "ingredients": ["x"],
        "steps": ["y"]
    }, headers=auth_headers(user_token))
    rec_id = r.json()["id"]
    # Bob cannot delete
    r2 = client.delete(f"/recipes/{rec_id}", headers=auth_headers(bob_token))
    assert r2.status_code in (403, 404)
    # Owner can delete
    r3 = client.delete(f"/recipes/{rec_id}", headers=auth_headers(user_token))
    assert r3.status_code == 204
