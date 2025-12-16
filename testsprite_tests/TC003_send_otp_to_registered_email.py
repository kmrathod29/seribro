import requests

BASE_URL = "http://localhost:5173/api/auth/send-otp"
TIMEOUT = 30

def test_send_otp_to_registered_email():
    # Registered email for the test (should be replaced with a real registered email in environment)
    registered_email = "afmahetar2006@gmail.com"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "email": registered_email
    }

    try:
        response = requests.post(
            BASE_URL,
            json=payload,
            headers=headers,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request to send OTP failed: {e}"

    assert response.status_code == 200, f"Unexpected status code: {response.status_code}"
    response_data = response.json()
    assert response_data.get("success") is True, "Success flag in response should be True"
    assert "OTP sent successfully" in response_data.get("message", ""), "Response message should confirm OTP sent"


test_send_otp_to_registered_email()
