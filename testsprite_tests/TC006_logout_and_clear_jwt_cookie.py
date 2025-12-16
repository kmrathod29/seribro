import requests

BASE_URL = "http://localhost:7000"
AUTH = ("afmahetar2006@gmail.com", "Arman2006@#")
TIMEOUT = 30

def test_logout_and_clear_jwt_cookie():
    session = requests.Session()
    try:
        # Step 1: login to get the JWT cookie set in session
        login_url = f"{BASE_URL}/api/auth/login"
        login_payload = {
            "email": AUTH[0],
            "password": AUTH[1],
            "role": "student"  # Assuming testing logout for student role; can be changed if needed
        }
        login_resp = session.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_json = login_resp.json()
        assert login_json.get("success") is True, "Login response missing success true"
        token = login_json.get("data", {}).get("token")
        assert token, "Login response missing token"

        # Verify that JWT cookie is set
        jwt_cookies = [cookie for cookie in session.cookies if 'jwt' in cookie.name.lower()]
        assert jwt_cookies, "JWT cookie not found after login"

        # Step 2: logout request should clear JWT cookie
        logout_url = f"{BASE_URL}/api/auth/logout"
        logout_resp = session.post(logout_url, timeout=TIMEOUT)
        assert logout_resp.status_code == 200, f"Logout failed with status {logout_resp.status_code}"
        logout_json = logout_resp.json()
        assert logout_json.get("success") is True, "Logout response missing success true"
        assert "Logged out successfully" in logout_json.get("message", ""), "Logout response message unexpected"

        # After logout, JWT cookie should be cleared or expired
        jwt_cookies_after = [cookie for cookie in session.cookies if 'jwt' in cookie.name.lower() and cookie.value]
        assert not jwt_cookies_after, "JWT cookie still present after logout"

    finally:
        session.close()

test_logout_and_clear_jwt_cookie()