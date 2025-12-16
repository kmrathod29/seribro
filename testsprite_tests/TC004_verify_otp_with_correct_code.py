import requests
import time

BASE_URL = "http://localhost:5173/api/auth"
EMAIL = "afmahetar2006@gmail.com"
TIMEOUT = 30

def test_verify_otp_with_correct_code():
    session = requests.Session()

    # Step 1: Send OTP to registered email
    send_otp_payload = {"email": EMAIL}
    send_otp_resp = session.post(f"{BASE_URL}/send-otp", json=send_otp_payload, timeout=TIMEOUT)
    assert send_otp_resp.status_code == 200
    send_otp_json = send_otp_resp.json()
    assert send_otp_json.get("success") is True
    assert "OTP sent successfully" in send_otp_json.get("message", "")

    # Sleep briefly to simulate time for OTP arrival or generation
    time.sleep(2)

    # Assuming test environment OTP is '123456'
    correct_otp = "123456"

    # Step 2: Verify OTP with the correct code
    verify_otp_payload = {
        "email": EMAIL,
        "otp": correct_otp
    }
    verify_otp_resp = session.post(f"{BASE_URL}/verify-otp", json=verify_otp_payload, timeout=TIMEOUT)
    assert verify_otp_resp.status_code == 200
    verify_otp_json = verify_otp_resp.json()
    assert verify_otp_json.get("success") is True
    assert "Email verified successfully" in verify_otp_json.get("message", "")


test_verify_otp_with_correct_code()
