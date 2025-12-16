import requests
import time

BASE_URL = "http://localhost:5173/api"
EMAIL = "afmahetar2006@gmail.com"
PASSWORD = "Arman2006@#"
ROLE = "student"
TIMEOUT = 30

def test_student_submit_profile_for_admin_verification():
    session = requests.Session()

    try:
        # Phase 1: Login (Authentication)
        login_resp = session.post(
            f"{BASE_URL}/auth/login",
            json={"email": EMAIL, "password": PASSWORD, "role": ROLE},
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        assert login_data.get("success") is True, "Login success flag false"
        token = login_data["data"]["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Phase 2: Retrieve student profile to check completion
        profile_resp = session.get(f"{BASE_URL}/student/profile", headers=headers, timeout=TIMEOUT)
        assert profile_resp.status_code == 200, f"Get profile failed: {profile_resp.text}"
        profile_data = profile_resp.json()
        assert profile_data.get("success") is True, "Profile fetch success false"
        profile = profile_data.get("data", {})
        profile_completion = profile.get("profileCompletion", 0)
        assert profile_completion == 100, f"ProfileCompletion is {profile_completion}, expected 100"

        # Additional check: email verified assumed from login success and above

        # Phase 3: Submit student profile for verification
        submit_resp = session.post(
            f"{BASE_URL}/student/profile/submit-verification",
            headers=headers,
            timeout=TIMEOUT
        )
        assert submit_resp.status_code == 200, f"Submit for verification failed: {submit_resp.text}"
        submit_data = submit_resp.json()
        assert submit_data.get("success") is True, "Submit verification success false"
        assert "Profile submitted for verification" in submit_data.get("message", ""), "Unexpected submission message"

        # Additional: Wait a bit and confirm status if possible (not in PRD, so skipped)

    finally:
        # No resource to delete for this test specifically
        pass


test_student_submit_profile_for_admin_verification()