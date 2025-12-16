import requests
import io

BASE_URL = "http://localhost:5173"
TIMEOUT = 30

auth_credentials = {
    "email": "afmahetar2006@gmail.com",
    "password": "Arman2006@#",
    "role": "student"
}

def login_and_get_token():
    login_url = BASE_URL + "/api/auth/login"
    resp = requests.post(login_url, json=auth_credentials, timeout=TIMEOUT)
    resp.raise_for_status()
    json_resp = resp.json()
    assert json_resp.get("success") is True
    token = json_resp.get("data", {}).get("token")
    assert token and isinstance(token, str)
    return token

def upload_student_document(token, document_type, file_name, file_content):
    url = f"{BASE_URL}/api/student/profile/{document_type}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    files = {
        "file": (file_name, io.BytesIO(file_content), "application/octet-stream")
    }
    resp = requests.post(url, headers=headers, files=files, timeout=TIMEOUT)
    resp.raise_for_status()
    json_resp = resp.json()
    assert json_resp.get("success") is True
    assert "Document uploaded successfully" in json_resp.get("message", "")

def test_student_document_upload_with_valid_file():
    token = login_and_get_token()

    # Prepare dummy file contents for different document types
    documents = {
        "resume": ("resume.pdf", b"%PDF-1.4 dummy resume content"),
        "collegeId": ("college_id.png", b"\x89PNG\r\n\x1a\n\x00\x00\x00 dummy college id content"),
        "certificates": ("certificate.jpg", b"\xff\xd8\xff dummy certificate content")
    }

    for doc_type, (file_name, content) in documents.items():
        upload_student_document(token, doc_type, file_name, content)

test_student_document_upload_with_valid_file()