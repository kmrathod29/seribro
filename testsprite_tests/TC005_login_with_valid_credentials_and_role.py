import requests

BASE_URL = "http://localhost:7000"
TIMEOUT = 30

def test_login_with_valid_credentials_and_role():
    """
    Test the login API with valid email, password, and role (student, company, admin).
    Verify that the user is authenticated, JWT token is returned and user details are correct.
    """
    login_url = f"{BASE_URL}/api/auth/login"

    # Test data for all roles with valid credentials given in instructions
    test_users = [
        {"email": "afmahetar2006@gmail.com", "password": "Arman2006@#", "role": "student"},
        {"email": "afmahetar2006@gmail.com", "password": "Arman2006@#", "role": "company"},
        {"email": "afmahetar2006@gmail.com", "password": "Arman2006@#", "role": "admin"},
    ]

    for user in test_users:
        try:
            response = requests.post(
                login_url,
                json={
                    "email": user["email"],
                    "password": user["password"],
                    "role": user["role"]
                },
                timeout=TIMEOUT
            )
        except requests.RequestException as e:
            assert False, f"RequestException during login for role {user['role']}: {e}"

        assert response.status_code == 200, f"Unexpected status code for role {user['role']}: {response.status_code}"
        json_response = response.json()
        assert "success" in json_response and json_response["success"] is True, f"Login not successful for role {user['role']}"
        assert "data" in json_response and isinstance(json_response["data"], dict), f"No data returned for role {user['role']}"
        data = json_response["data"]

        # Validate token existence
        assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 0, f"Token missing or invalid for role {user['role']}"

        # Validate user details
        assert "user" in data and isinstance(data["user"], dict), f"User details missing for role {user['role']}"
        user_data = data["user"]
        assert user_data.get("email") == user["email"], f"Email mismatch for role {user['role']}"
        assert user_data.get("role") == user["role"], f"Role mismatch for role {user['role']}"
        assert "id" in user_data and isinstance(user_data["id"], str) and user_data["id"], f"User ID missing or invalid for role {user['role']}"

test_login_with_valid_credentials_and_role()
