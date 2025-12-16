import requests
import json

BASE_URL = "http://localhost:5173"
LOGIN_PATH = "/api/auth/login"
PROFILE_UPDATE_BASE_PATH = "/api/student/profile"

USERNAME = "afmahetar2006@gmail.com"
PASSWORD = "Arman2006@#"
ROLE = "student"
TIMEOUT = 30


def test_student_profile_update_for_each_section():
    # Step 1: Login to get JWT token
    login_url = f"{BASE_URL}{LOGIN_PATH}"
    login_payload = {
        "email": USERNAME,
        "password": PASSWORD,
        "role": ROLE
    }
    try:
        login_response = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        login_response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"

    login_json = login_response.json()
    assert login_json.get("success") is True, f"Login failed: {login_json}"
    token = login_json.get("data", {}).get("token")
    assert token and isinstance(token, str), "JWT token not found in login response"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Define profile sections and their corresponding update payloads with valid data
    profile_sections_payloads = {
        "basic-info": {
            "fullName": "Arman Mahetar",
            "phone": "1234567890",
            "address": "123 Main St, City, Country",
            "linkedin": "https://www.linkedin.com/in/armanmahetar",
            "github": "https://github.com/armanmahetar"
        },
        "skills": {
            "skills": ["Python", "JavaScript", "React"]
        },
        "tech-stack": {
            "techStack": ["Node.js", "Express.js", "MongoDB"]
        },
        "portfolio-links": {
            "portfolioLinks": [
                "https://armanmahetar.dev/project1",
                "https://armanmahetar.dev/project2"
            ]
        }
    }

    # Update each profile section and check response
    for section, payload in profile_sections_payloads.items():
        url = f"{BASE_URL}{PROFILE_UPDATE_BASE_PATH}/{section}"
        try:
            response = requests.put(url, headers=headers, json=payload, timeout=TIMEOUT)
            response.raise_for_status()
        except requests.RequestException as e:
            assert False, f"PUT request failed for section '{section}': {e}"

        resp_json = response.json()
        assert resp_json.get("success") is True, f"Profile update not successful for section '{section}': {resp_json}"
        message = resp_json.get("message", "").lower()
        assert "updated successfully" in message, f"Unexpected success message for section '{section}': {message}"


test_student_profile_update_for_each_section()