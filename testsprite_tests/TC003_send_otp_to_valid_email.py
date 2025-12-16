import requests

BASE_URL = "http://localhost:7000"
TIMEOUT = 30

def test_send_otp_to_valid_email():
    url = f"{BASE_URL}/api/auth/send-otp"
    valid_email = "testuser@example.com"
    payload = {"email": valid_email}
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
        data = response.json()

        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        assert data.get("success") is True, "Success flag not true in response"
        assert "OTP sent successfully" in data.get("message", ""), "Success message missing or incorrect"

    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_send_otp_to_valid_email()