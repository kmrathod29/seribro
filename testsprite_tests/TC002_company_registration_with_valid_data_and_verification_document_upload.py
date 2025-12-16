import requests

BASE_URL = "http://localhost:7000"
TIMEOUT = 30

def test_company_registration_with_verification_document_upload():
    register_url = f"{BASE_URL}/api/auth/company/register"
    verify_otp_url = f"{BASE_URL}/api/auth/verify-otp"
    login_url = f"{BASE_URL}/api/auth/login"
    logout_url = f"{BASE_URL}/api/auth/logout"

    # Test data
    email = "testcompany@example.com"
    password = "StrongPass123!"
    company_name = "Test Company Ltd"
    phone = "1234567890"
    otp_code = "654321"  # As per instruction use second OTP

    # Prepare multipart form data for registration
    files = {
        "verificationDocument": ("verification.pdf", b"Dummy PDF content for test verification document", "application/pdf")
    }
    data = {
        "email": email,
        "password": password,
        "companyName": company_name,
        "phone": phone,
    }

    # Register company with verification document
    try:
        response = requests.post(register_url, data=data, files=files, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        resp_json = response.json()
        assert resp_json.get("success") is True
        assert "Company registered successfully" in resp_json.get("message", "")

        # Verify OTP
        otp_payload = {"email": email, "otp": otp_code}
        otp_resp = requests.post(verify_otp_url, json=otp_payload, timeout=TIMEOUT)
        assert otp_resp.status_code == 200, f"Expected 200, got {otp_resp.status_code}"
        otp_json = otp_resp.json()
        assert otp_json.get("success") is True
        assert "Email verified successfully" in otp_json.get("message", "")

        # Login with company credentials and role=company
        login_payload = {
            "email": email,
            "password": password,
            "role": "company"
        }
        login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Expected 200, got {login_resp.status_code}"
        login_json = login_resp.json()
        assert login_json.get("success") is True
        data = login_json.get("data")
        assert data is not None
        token = data.get("token")
        user = data.get("user")
        assert token and user
        assert user.get("email") == email
        assert user.get("role") == "company"

        # Logout and check JWT cookie cleared
        headers = {"Authorization": f"Bearer {token}"}
        logout_resp = requests.post(logout_url, headers=headers, timeout=TIMEOUT)
        assert logout_resp.status_code == 200, f"Expected 200, got {logout_resp.status_code}"
        logout_json = logout_resp.json()
        assert logout_json.get("success") is True
        assert "Logged out successfully" in logout_json.get("message", "")

    finally:
        # Attempt to cleanup: delete the created company if an admin token is available.
        # Since no admin credentials or delete endpoint provided in PRD, no deletion performed here.
        pass

test_company_registration_with_verification_document_upload()