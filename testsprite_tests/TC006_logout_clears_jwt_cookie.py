import requests

BASE_URL = "http://localhost:5173/api/auth"
EMAIL = "afmahetar2006@gmail.com"
PASSWORD = "Arman2006@#"
TIMEOUT = 30

def test_logout_clears_jwt_cookie():
    session = requests.Session()
    login_url = f"{BASE_URL}/login"
    logout_url = f"{BASE_URL}/logout"

    try:
        # Phase 1: Authentication - Login to get JWT cookie
        login_payload = {
            "email": EMAIL,
            "password": PASSWORD,
            "role": "student"
        }
        login_response = session.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_response.status_code == 200, f"Login failed with status code {login_response.status_code}"
        login_json = login_response.json()
        assert login_json.get("success") is True, "Login response did not indicate success"
        assert "token" in login_json.get("data", {}), "Login response missing token"
        # Verify cookie set
        jwt_cookie = session.cookies.get("jwt")
        assert jwt_cookie is not None, "JWT cookie not set after login"

        # Phase 3: Logout - Test that logout clears JWT cookie and response confirms logout
        logout_response = session.post(logout_url, timeout=TIMEOUT)
        assert logout_response.status_code == 200, f"Logout failed with status code {logout_response.status_code}"
        logout_json = logout_response.json()
        assert logout_json.get("success") is True, "Logout response did not indicate success"
        assert logout_json.get("message") == "Logged out successfully", "Unexpected logout message"
        # After logout, JWT cookie should be cleared or expired
        jwt_cookie_after = session.cookies.get("jwt")
        # Some implementations may clear cookie by setting expired cookie; allow None or empty string
        assert not jwt_cookie_after, "JWT cookie was not cleared after logout"

    finally:
        session.close()

test_logout_clears_jwt_cookie()