import requests

BASE_URL = "http://localhost:7000"
EMAIL = "afmahetar2006@gmail.com"
OTP_CODE = "654321"
TIMEOUT = 30

def test_verify_otp_with_correct_email_and_otp():
    url = f"{BASE_URL}/api/auth/verify-otp"
    payload = {
        "email": EMAIL,
        "otp": OTP_CODE
    }
    headers = {
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
        data = response.json()
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        assert data.get("success") is True, "Success flag is not True"
        assert "Email verified successfully" in data.get("message", ""), "Unexpected success message"
    except requests.RequestException as e:
        raise AssertionError(f"Request failed: {e}")

test_verify_otp_with_correct_email_and_otp()