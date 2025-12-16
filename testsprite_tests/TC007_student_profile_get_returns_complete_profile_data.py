import requests

BASE_URL = "http://localhost:5000"
LOGIN_PATH = "/api/auth/login"
STUDENT_PROFILE_PATH = "/api/student/profile"
TIMEOUT = 30

credentials = {
    "email": "afmahetar2006@gmail.com",
    "password": "Arman2006@#",
    "role": "student"
}


def test_student_profile_get_returns_complete_profile_data():
    # Step 1: Login to get JWT token
    login_url = BASE_URL + LOGIN_PATH
    try:
        login_resp = requests.post(login_url, json=credentials, timeout=TIMEOUT)
        login_resp.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"

    login_data = login_resp.json()
    assert login_data.get("success") is True, "Login unsuccessful"
    token = login_data.get("data", {}).get("token")
    assert token, "JWT token not found in login response"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    # Step 2: Get student profile
    profile_url = BASE_URL + STUDENT_PROFILE_PATH
    try:
        profile_resp = requests.get(profile_url, headers=headers, timeout=TIMEOUT)
        profile_resp.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Get student profile request failed: {e}"

    profile_data = profile_resp.json()
    assert profile_data.get("success") is True, "Failed to get student profile"

    data = profile_data.get("data")
    assert isinstance(data, dict), "Profile data is not a dictionary"

    # Verify all required profile sections are present
    assert "basicInfo" in data, "Missing 'basicInfo' section in profile data"
    assert "skills" in data, "Missing 'skills' section in profile data"
    assert "techStack" in data, "Missing 'techStack' section in profile data"
    assert "projects" in data, "Missing 'projects' section in profile data"
    assert "documents" in data, "Missing 'documents' section in profile data"
    assert "profileCompletion" in data, "Missing 'profileCompletion' in profile data"

    # Validate types of profile sections
    assert isinstance(data["basicInfo"], dict), "'basicInfo' should be a dictionary"
    assert isinstance(data["skills"], dict), "'skills' should be a dictionary"
    assert isinstance(data["techStack"], list), "'techStack' should be a list"
    assert isinstance(data["projects"], list), "'projects' should be a list"
    assert isinstance(data["documents"], dict), "'documents' should be a dictionary"
    assert isinstance(data["profileCompletion"], (int, float)), "'profileCompletion' should be a number"

    # Profile completion should be between 0 and 100
    assert 0 <= data["profileCompletion"] <= 100, "'profileCompletion' should be between 0 and 100"


test_student_profile_get_returns_complete_profile_data()
