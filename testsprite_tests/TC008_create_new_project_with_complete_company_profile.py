import requests
import traceback
from datetime import datetime, timedelta

BASE_URL = "http://localhost:7000"
TIMEOUT = 30

# Credentials for the company user to login (assumed pre-existing verified company user)
COMPANY_EMAIL = "afmahetar2006@gmail.com"
COMPANY_PASSWORD = "Arman2006@#"
COMPANY_ROLE = "company"

def test_create_new_project_with_complete_company_profile():
    session = requests.Session()
    token = None
    project_id = None
    try:
        # Step 1: Login as company to get token
        login_resp = session.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": COMPANY_EMAIL,
                "password": COMPANY_PASSWORD,
                "role": COMPANY_ROLE
            },
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_json = login_resp.json()
        assert login_json.get("success") is True, f"Login failed: {login_json}"
        token = login_json["data"]["token"]
        assert token, "No token received on login"
        user_role = login_json["data"]["user"].get("role")
        assert user_role == COMPANY_ROLE, f"Logged in user role mismatch: expected '{COMPANY_ROLE}', got '{user_role}'"

        headers = {
            "Authorization": f"Bearer {token}"
        }

        # Step 2: Verify company profile completeness & submission if needed
        # Get company profile
        profile_resp = session.get(
            f"{BASE_URL}/api/company/profile",
            headers=headers,
            timeout=TIMEOUT
        )
        assert profile_resp.status_code == 200, f"Failed to get company profile: {profile_resp.text}"
        profile_json = profile_resp.json()
        assert profile_json.get("success") is True, f"Failed company profile response: {profile_json}"
        profile_data = profile_json.get("data", {})
        # We need to assure profile is fully complete (profileCompletion not explicitly stated, assume verificationStatus "approved")
        verification_status = profile_data.get("verificationStatus", "").lower()
        # If not approved, submit for verification and assume admin auto-approval for this test
        if verification_status != "approved":
            # Submit for verification
            submit_resp = session.post(
                f"{BASE_URL}/api/company/profile/submit-verification",
                headers=headers,
                timeout=TIMEOUT
            )
            assert submit_resp.status_code == 200, f"Failed to submit company profile for verification: {submit_resp.text}"
            submit_json = submit_resp.json()
            assert submit_json.get("success") is True, f"Failed submission: {submit_json}"

            # For test we assume admin approves via backend or simulate here:
            # We do not have admin token or steps, so skipping approve call (should be pre-approved for test)
            # Re-fetch profile and check verificationStatus again
            profile_resp = session.get(
                f"{BASE_URL}/api/company/profile",
                headers=headers,
                timeout=TIMEOUT
            )
            assert profile_resp.status_code == 200, f"Failed to get company profile after submission: {profile_resp.text}"
            profile_json = profile_resp.json()
            verification_status = profile_json.get("data", {}).get("verificationStatus", "").lower()
            assert verification_status == "approved", f"Company profile not approved after submission, status: {verification_status}"

        # Step 3: Create a new project with valid full details
        deadline_date = (datetime.utcnow() + timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%S.%fZ")

        project_payload = {
            "title": "AI Powered Inventory Management System",
            "description": "Develop an AI based system to optimize inventory management and forecasting.",
            "requirements": "Experience with machine learning, Python, and inventory systems.",
            "budget": 25000,
            "deadline": deadline_date,
            "skills": ["Machine Learning", "Python", "Data Analysis"],
            "techStack": ["TensorFlow", "React", "MongoDB"]
        }

        create_resp = session.post(
            f"{BASE_URL}/api/company/projects/create",
            json=project_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 200, f"Create project failed: {create_resp.text}"
        create_json = create_resp.json()
        assert create_json.get("success") is True, f"Create project response failure: {create_json}"
        project = create_json.get("data", {}).get("project")
        assert project, "No project data returned after creation"

        # Validate project fields as per test case
        project_id = project.get("id")
        assert project_id, "Created project ID missing"
        assert project.get("title") == project_payload["title"], "Project title mismatch"
        assert project.get("status") == "open", f"Expected project status 'open', got: {project.get('status')}"
        assert project.get("applicationCount") == 0, f"Expected applicationCount 0, got: {project.get('applicationCount')}"

    except Exception:
        traceback.print_exc()
        assert False, "Test failed due to unexpected error"
    finally:
        # Cleanup: delete the created project if exists to keep environment clean
        if token and project_id:
            try:
                delete_resp = session.delete(
                    f"{BASE_URL}/api/company/projects/{project_id}",
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=TIMEOUT
                )
                # Accept both 200 or 204 for deletion success
                if delete_resp.status_code not in (200, 204):
                    print(f"Warning: Failed to delete test project with id {project_id}: {delete_resp.status_code} {delete_resp.text}")
            except Exception:
                print(f"Warning: Exception during cleanup deletion of project id {project_id}")
                traceback.print_exc()


test_create_new_project_with_complete_company_profile()
