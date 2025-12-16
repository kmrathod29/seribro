import requests

BASE_URL = "http://localhost:7000"
LOGIN_ENDPOINT = "/api/auth/login"
STUDENT_PROFILE_ENDPOINT = "/api/student/profile"

# Credentials from the instruction
USER_EMAIL = "afmahetar2006@gmail.com"
USER_PASSWORD = "Arman2006@#"
USER_ROLE = "student"
TIMEOUT = 30


def test_get_student_profile_with_valid_token():
    session = requests.Session()
    try:
        # Step 1: Login to get JWT token
        login_payload = {
            "email": USER_EMAIL,
            "password": USER_PASSWORD,
            "role": USER_ROLE
        }
        login_resp = session.post(
            BASE_URL + LOGIN_ENDPOINT, json=login_payload, timeout=TIMEOUT)
        login_resp.raise_for_status()

        login_data = login_resp.json()
        assert login_data.get("success") is True, "Login should be successful"
        token = login_data.get("data", {}).get("token")
        assert token, "Token should be present in login response"

        headers = {"Authorization": f"Bearer {token}"}

        # Step 2: Get student profile with valid token
        profile_resp = session.get(
            BASE_URL + STUDENT_PROFILE_ENDPOINT, headers=headers, timeout=TIMEOUT)
        profile_resp.raise_for_status()

        profile_data = profile_resp.json()
        assert profile_data.get("success") is True, "Profile fetch should be successful"
        data = profile_data.get("data")
        assert data is not None, "Profile data should be present"

        # Validate presence of all profile sections
        # basicInfo, skills, techStack, projects, documents, profileCompletion
        assert "basicInfo" in data, "Profile should include 'basicInfo'"
        assert isinstance(data["basicInfo"], dict), "'basicInfo' should be a dict"

        assert "skills" in data, "Profile should include 'skills'"
        assert isinstance(data["skills"], (dict, list)), "'skills' should be dict or list"

        assert "techStack" in data, "Profile should include 'techStack'"
        assert isinstance(data["techStack"], list), "'techStack' should be a list"

        assert "projects" in data, "Profile should include 'projects'"
        assert isinstance(data["projects"], list), "'projects' should be a list"

        assert "documents" in data, "Profile should include 'documents'"
        assert isinstance(data["documents"], dict), "'documents' should be a dict"

        assert "profileCompletion" in data, "Profile should include 'profileCompletion'"
        profile_completion = data["profileCompletion"]
        assert isinstance(profile_completion, (int, float)), "'profileCompletion' should be numeric"
        assert 0 <= profile_completion <= 100, "'profileCompletion' should be between 0 and 100"
    except requests.RequestException as e:
        raise AssertionError(f"HTTP request failed: {e}")
    finally:
        session.close()

test_get_student_profile_with_valid_token()