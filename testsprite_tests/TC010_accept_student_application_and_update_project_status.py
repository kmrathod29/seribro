import requests
import time

BASE_URL = "http://localhost:7000"
TIMEOUT = 30

# Credentials from instruction, assuming roles as per test plan requirement
STUDENT_CREDENTIALS = {"email": "student@example.com", "password": "StudentPass1!"}
COMPANY_CREDENTIALS = {"email": "company@example.com", "password": "CompanyPass1!"}
ADMIN_CREDENTIALS = {"email": "admin@example.com", "password": "AdminPass1!"}

OTP_CODE = "654321"  # second OTP as per instructions


def login(email, password, role):
    resp = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": email, "password": password, "role": role},
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    data = resp.json()
    assert data.get("success") is True
    token = data["data"]["token"]
    user_id = data["data"]["user"]["id"]
    return token, user_id


def logout(token):
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.post(f"{BASE_URL}/api/auth/logout", headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    assert data.get("success") is True


def verify_otp(email):
    # Send OTP
    resp = requests.post(f"{BASE_URL}/api/auth/send-otp", json={"email": email}, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    assert data.get("success") is True
    # Verify OTP with fixed code
    resp = requests.post(f"{BASE_URL}/api/auth/verify-otp", json={"email": email, "otp": OTP_CODE}, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    assert data.get("success") is True


def approve_student(admin_token, student_id):
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = requests.post(f"{BASE_URL}/api/admin/student/{student_id}/approve", headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    assert data.get("success") is True


def approve_company(admin_token, company_id):
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = requests.post(f"{BASE_URL}/api/admin/company/{company_id}/approve", headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    assert data.get("success") is True


def complete_and_submit_student_profile(token):
    headers = {"Authorization": f"Bearer {token}"}
    # Fill basic info
    resp = requests.put(
        f"{BASE_URL}/api/student/profile/basicInfo",
        headers=headers,
        json={"fullName": "Test Student", "phone": "1234567890", "college": "Test College"},
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    assert resp.json().get("success") is True
    # Fill skills
    resp = requests.put(
        f"{BASE_URL}/api/student/profile/skills",
        headers=headers,
        json={"skills": ["Python", "JavaScript"]},
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    assert resp.json().get("success") is True
    # Fill tech stack
    resp = requests.put(
        f"{BASE_URL}/api/student/profile/techStack",
        headers=headers,
        json={"techStack": ["React", "Node.js"]},
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    assert resp.json().get("success") is True
    # Add a project
    resp = requests.post(
        f"{BASE_URL}/api/student/profile/projects",
        headers=headers,
        json={
            "title": "Sample Project",
            "description": "Description",
            "link": "http://github.com/sample/project",
            "technologies": ["React", "Node.js"],
        },
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    assert resp.json().get("success") is True
    # Upload documents would be multipart/form-data; skipping files upload here assuming test environment setup.
    # Submit for verification
    resp = requests.post(
        f"{BASE_URL}/api/student/profile/submit-verification",
        headers=headers,
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    data = resp.json()
    assert data.get("success") is True


def complete_and_submit_company_profile(token):
    headers = {"Authorization": f"Bearer {token}"}
    # Fill company basic info
    resp = requests.put(
        f"{BASE_URL}/api/company/profile/basicInfo",
        headers=headers,
        json={"companyName": "Test Company", "phone": "0987654321", "address": "123 Test St"},
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    assert resp.json().get("success") is True
    # Submit for verification
    resp = requests.post(
        f"{BASE_URL}/api/company/profile/submit-verification",
        headers=headers,
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    data = resp.json()
    assert data.get("success") is True


def create_project(token):
    headers = {"Authorization": f"Bearer {token}"}
    project_payload = {
        "title": f"Test Project {int(time.time())}",
        "description": "A test project description",
        "requirements": "Some requirements",
        "budget": 1000,
        "deadline": "2030-12-31T23:59:59Z",
        "skills": ["Python", "React"],
        "techStack": ["Django", "React"],
    }
    resp = requests.post(
        f"{BASE_URL}/api/company/projects/create",
        headers=headers,
        json=project_payload,
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    data = resp.json()
    assert data.get("success") is True
    project = data["data"]["project"]
    assert project["status"] == "open"
    assert project["applicationCount"] == 0
    return project["id"]


def apply_to_project(token, project_id):
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "proposal": "I would love to work on this project.",
        "proposedPrice": 900,
        "estimatedTime": "2 months",
    }
    resp = requests.post(
        f"{BASE_URL}/api/student/projects/{project_id}/apply",
        headers=headers,
        json=payload,
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    data = resp.json()
    assert data.get("success") is True
    application = data["data"]["application"]
    assert application["status"] == "pending"
    return application["id"]


def shortlist_application(token, application_id):
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.post(
        f"{BASE_URL}/api/company/applications/{application_id}/shortlist",
        headers=headers,
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    data = resp.json()
    assert data.get("success") is True
    assert data["data"]["application"]["status"] == "shortlisted"


def get_applications_by_project(token, project_id):
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(
        f"{BASE_URL}/api/company/applications/projects/{project_id}/applications",
        headers=headers,
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    data = resp.json()
    assert data.get("success") is True
    return data["data"]["applications"]


def accept_application(token, application_id):
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.post(
        f"{BASE_URL}/api/company/applications/{application_id}/approve",
        headers=headers,
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    data = resp.json()
    assert data.get("success") is True
    assert data["data"]["application"]["status"] == "accepted"
    assert data["data"]["project"]["status"] == "assigned"
    assert "assignedStudent" in data["data"]["project"]
    return data


def get_notifications(token):
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/api/notifications", headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    assert data.get("success") is True
    return data["data"]["notifications"]


def test_accept_student_application_and_update_project_status():
    # 1. Login as admin
    admin_token, _ = login(ADMIN_CREDENTIALS["email"], ADMIN_CREDENTIALS["password"], "admin")

    # 2. Register and verify two students, approve them via admin
    student_tokens = {}
    student_ids = []
    for i in range(2):
        email = f"teststudent{i}@example.com"
        password = "StudentPass1!"
        full_name = f"Student{i}"
        # Register student
        files = {"collegeId": ("college_id.txt", b"dummy college id content")}
        data = {"email": email, "password": password, "fullName": full_name, "phone": "1234567890"}
        resp = requests.post(f"{BASE_URL}/api/auth/student/register", data=data, files=files, timeout=TIMEOUT)
        resp.raise_for_status()
        resp_data = resp.json()
        assert resp_data.get("success") is True
        user_id = resp_data["data"]["userId"]
        student_ids.append(user_id)
        # Verify OTP
        verify_otp(email)
        # Login student
        token, _ = login(email, password, "student")
        # Complete profile and submit for verification
        complete_and_submit_student_profile(token)
        student_tokens[user_id] = token
        # Admin approve student
        approve_student(admin_token, user_id)

    # 3. Register and verify company, approve via admin
    comp_email = "testcompany@example.com"
    comp_password = "CompanyPass1!"
    files = {"verificationDocument": ("verification.txt", b"dummy verification document")}
    data = {"email": comp_email, "password": comp_password, "companyName": "TestCompany", "phone": "0987654321"}
    resp = requests.post(f"{BASE_URL}/api/auth/company/register", data=data, files=files, timeout=TIMEOUT)
    resp.raise_for_status()
    resp_data = resp.json()
    assert resp_data.get("success") is True
    # Verify OTP for company
    verify_otp(comp_email)
    # Login company
    company_token, company_id = login(comp_email, comp_password, "company")
    # Complete profile and submit for verification
    complete_and_submit_company_profile(company_token)
    # Admin approve company
    approve_company(admin_token, company_id)

    # 4. Company creates a project
    project_id = create_project(company_token)

    # 5. Both students apply to the project
    application_ids = []
    for student_id in student_ids:
        app_id = apply_to_project(student_tokens[student_id], project_id)
        application_ids.append(app_id)

    # 6. Company shortlists both applications
    for app_id in application_ids:
        shortlist_application(company_token, app_id)

    # 7. Company accepts the first application
    accepted_app_id = application_ids[0]
    accept_response = accept_application(company_token, accepted_app_id)

    # 8. Verify accepted application status
    applications = get_applications_by_project(company_token, project_id)
    statuses = {app["id"]: app["status"] for app in applications}
    assert statuses.get(accepted_app_id) == "accepted"
    # Others should be rejected
    for app_id in application_ids[1:]:
        assert statuses.get(app_id) == "rejected"

    # 9. Verify project status updated
    project_resp = requests.get(f"{BASE_URL}/api/company/projects/my-projects?status=assigned", headers={"Authorization": f"Bearer {company_token}"}, timeout=TIMEOUT)
    project_resp.raise_for_status()
    proj_data = project_resp.json()
    projects = proj_data.get("data", {}).get("projects", [])
    assigned_proj = next((p for p in projects if p["id"] == project_id), None)
    assert assigned_proj is not None
    assert assigned_proj["status"] == "assigned"
    # assignedStudent id is in accept_response
    assert accept_response["data"]["project"]["assignedStudent"] is not None

    # 10. Verify notifications for involved users (company and students)
    # Company notifications
    company_notifications = get_notifications(company_token)
    assert any(
        ("accepted" in n.get("message", "").lower() or "application" in n.get("message", "").lower())
        for n in company_notifications
    )
    # Student notifications for accepted and rejected
    accepted_student_id = accept_response["data"]["project"]["assignedStudent"]
    for student_id in student_ids:
        notif_token = student_tokens[student_id]
        notifications = get_notifications(notif_token)
        if student_id == accepted_student_id:
            # Should include acceptance notification
            assert any("accepted" in n.get("message", "").lower() for n in notifications)
        else:
            # Should include rejection notification
            assert any("rejected" in n.get("message", "").lower() for n in notifications)

    # 11. Test preventing double assignment - accepting other application now should fail
    headers = {"Authorization": f"Bearer {company_token}"}
    second_app_id = application_ids[1]
    resp = requests.post(f"{BASE_URL}/api/company/applications/{second_app_id}/approve", headers=headers, timeout=TIMEOUT)
    assert resp.status_code >= 400  # should fail
    err_data = resp.json()
    assert err_data.get("success") is False or resp.status_code == 400


test_accept_student_application_and_update_project_status()
