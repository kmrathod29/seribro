import requests
import io

BASE_URL = "http://localhost:7000"
REGISTER_ENDPOINT = "/api/auth/student/register"
TIMEOUT = 30

def test_student_registration_with_college_id_upload():
    url = BASE_URL + REGISTER_ENDPOINT

    # Test data for registration
    email = "teststudent_registration@example.com"
    password = "StrongPass123!"
    full_name = "Test Student"
    phone = "+1234567890"

    # Using in-memory bytes for the collegeId file
    college_id_content = io.BytesIO(b"dummy college id content")

    files = {
        "collegeId": ("college_id_sample.jpg", college_id_content, "image/jpeg")
    }
    data = {
        "email": email,
        "password": password,
        "fullName": full_name,
        "phone": phone
    }

    response = requests.post(url, data=data, files=files, timeout=TIMEOUT)

    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}, response: {response.text}"
    json_resp = response.json()
    assert json_resp.get("success") is True, f"Response success flag is not True: {json_resp}"
    assert "Student registered successfully" in json_resp.get("message", ""), f"Unexpected message: {json_resp.get('message')}"
    data_resp = json_resp.get("data")
    assert data_resp is not None, "Response.data is None"
    assert "userId" in data_resp and isinstance(data_resp["userId"], str) and data_resp["userId"], "userId missing or invalid in response"
    assert "email" in data_resp and data_resp["email"] == email, "Email in response does not match the request"

    # Cleanup: if possible, delete the created user by ID (if API available)
    # Since no deletion API documented, skipping cleanup


test_student_registration_with_college_id_upload()
