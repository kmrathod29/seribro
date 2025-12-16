import requests
import json
import datetime
import time

BASE_URL = "http://localhost:7000"
STUDENT_EMAIL = "afmahetar2006@gmail.com"
STUDENT_PASSWORD = "Arman2006@#"
OTP_CODE = "654321"  # Given second OTP
TIMEOUT = 30

def test_apply_to_project_with_complete_student_profile_and_valid_proposal():
    session = requests.Session()
    headers = {}
    application = {}

    try:
        # PHASE 1: Login as student to get token
        login_resp = session.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": STUDENT_EMAIL,
                "password": STUDENT_PASSWORD,
                "role": "student"
            },
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        assert login_data.get("success") is True
        token = login_data["data"]["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # PHASE 2: Get student profile and check completion and verification
        profile_resp = session.get(f"{BASE_URL}/api/student/profile", headers=headers, timeout=TIMEOUT)
        assert profile_resp.status_code == 200, f"Get profile failed: {profile_resp.text}"
        profile_data = profile_resp.json()
        assert profile_data.get("success") is True
        profile = profile_data.get("data", {})
        completion = profile.get("profileCompletion", 0)
        assert completion == 100, f"Profile completion is not 100%, got {completion}"
        # We assume email verified if OTP verified as per scenario, no direct flag found in PRD

        # PHASE 3: Browse projects and select an open project
        browse_params = {"page": 1, "limit": 10}
        browse_resp = session.get(f"{BASE_URL}/api/student/projects/browse", headers=headers, params=browse_params, timeout=TIMEOUT)
        assert browse_resp.status_code == 200, f"Browse projects failed: {browse_resp.text}"
        browse_data = browse_resp.json()
        assert browse_data.get("success") is True
        projects = browse_data.get("data", {}).get("projects", [])
        assert len(projects) > 0, "No projects available to apply"
        project = projects[0]
        project_id = project.get("id")
        assert project_id is not None

        # PHASE 3.2: Apply to the project with valid proposal
        proposal_text = "I am very interested in this project and have the required skills to deliver quality results."
        proposed_price = 1500.0
        estimated_time = "4 weeks"

        apply_payload = {
            "proposal": proposal_text,
            "proposedPrice": proposed_price,
            "estimatedTime": estimated_time
        }

        apply_resp = session.post(
            f"{BASE_URL}/api/student/projects/{project_id}/apply",
            headers=headers,
            json=apply_payload,
            timeout=TIMEOUT
        )
        assert apply_resp.status_code == 200, f"Apply to project failed: {apply_resp.text}"
        apply_data = apply_resp.json()
        assert apply_data.get("success") is True
        application = apply_data.get("data", {}).get("application", {})
        assert application.get("status") == "pending", f"Application status expected 'pending' but got {application.get('status')}"

    finally:
        # Cleanup: Withdraw application to leave clean state if application created
        if application and application.get("id") and headers:
            app_id = application["id"]
            withdraw_resp = session.put(
                f"{BASE_URL}/api/student/projects/applications/{app_id}/withdraw",
                headers=headers,
                timeout=TIMEOUT
            )
            # Withdraw may or may not succeed, do not assert here but log if failure
            if withdraw_resp.status_code != 200:
                print(f"Warning: Failed to withdraw application {app_id}, status: {withdraw_resp.status_code}")

        # Logout student
        if headers:
            logout_resp = session.post(f"{BASE_URL}/api/auth/logout", headers=headers, timeout=TIMEOUT)
            if logout_resp.status_code != 200:
                print(f"Warning: Logout failed for student, status: {logout_resp.status_code}")

test_apply_to_project_with_complete_student_profile_and_valid_proposal()