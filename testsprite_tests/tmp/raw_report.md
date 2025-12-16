
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** phase2.1
- **Date:** 2025-12-14
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001
- **Test Name:** student registration with valid data and college id upload
- **Test Code:** [TC001_student_registration_with_valid_data_and_college_id_upload.py](./TC001_student_registration_with_valid_data_and_college_id_upload.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 45, in <module>
  File "<string>", line 32, in test_student_registration_with_college_id_upload
AssertionError: Expected status code 200 but got 400, response: {"success":false,"message":"Please fill all fields and upload College ID","stack":"Error: Please fill all fields and upload College ID\n    at removeFileAndThrowError (D:\\seribro\\phase4.5\\phase4.5\\phase2.1\\seribro-backend\\backend\\controllers\\authController.js:24:9)\n    at D:\\seribro\\phase4.5\\phase4.5\\phase2.1\\seribro-backend\\backend\\controllers\\authController.js:36:12\n    at asyncUtilWrap (D:\\seribro\\phase4.5\\phase4.5\\phase2.1\\seribro-backend\\node_modules\\express-async-handler\\index.js:3:20)\n    at Layer.handleRequest (D:\\seribro\\phase4.5\\phase4.5\\phase2.1\\seribro-backend\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\seribro\\phase4.5\\phase4.5\\phase2.1\\seribro-backend\\node_modules\\router\\lib\\route.js:157:13)\n    at done (D:\\seribro\\phase4.5\\phase4.5\\phase2.1\\seribro-backend\\node_modules\\multer\\lib\\make-middleware.js:59:7)\n    at indicateDone (D:\\seribro\\phase4.5\\phase4.5\\phase2.1\\seribro-backend\\node_modules\\multer\\lib\\make-middleware.js:63:68)\n    at D:\\seribro\\phase4.5\\phase4.5\\phase2.1\\seribro-backend\\node_modules\\multer\\lib\\make-middleware.js:176:11\n    at WriteStream.<anonymous> (D:\\seribro\\phase4.5\\phase4.5\\phase2.1\\seribro-backend\\node_modules\\multer\\storage\\disk.js:43:9)\n    at WriteStream.emit (node:events:530:35)"}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a50db638-45fc-48da-989b-f3dad76f9b7d/5ac0410b-a8e7-4355-886f-57b4a9f6f58b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002
- **Test Name:** company registration with valid data and verification document upload
- **Test Code:** [TC002_company_registration_with_valid_data_and_verification_document_upload.py](./TC002_company_registration_with_valid_data_and_verification_document_upload.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 77, in <module>
  File "<string>", line 33, in test_company_registration_with_verification_document_upload
AssertionError: Expected 200, got 400

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a50db638-45fc-48da-989b-f3dad76f9b7d/4a7b6241-8f67-4d24-95b5-313510e162f9
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003
- **Test Name:** send otp to valid email
- **Test Code:** [TC003_send_otp_to_valid_email.py](./TC003_send_otp_to_valid_email.py)
- **Test Error:** Traceback (most recent call last):
  File "<string>", line 14, in test_send_otp_to_valid_email
  File "/var/task/requests/models.py", line 1024, in raise_for_status
    raise HTTPError(http_error_msg, response=self)
requests.exceptions.HTTPError: 404 Client Error: Not Found for url: http://localhost:7000/api/auth/send-otp

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 24, in <module>
  File "<string>", line 22, in test_send_otp_to_valid_email
AssertionError: Request failed: 404 Client Error: Not Found for url: http://localhost:7000/api/auth/send-otp

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a50db638-45fc-48da-989b-f3dad76f9b7d/43b0e15f-bd67-4bad-9308-c7d40152eff8
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004
- **Test Name:** verify otp with correct email and otp
- **Test Code:** [TC004_verify_otp_with_correct_email_and_otp.py](./TC004_verify_otp_with_correct_email_and_otp.py)
- **Test Error:** Traceback (most recent call last):
  File "<string>", line 19, in test_verify_otp_with_correct_email_and_otp
  File "/var/task/requests/models.py", line 1024, in raise_for_status
    raise HTTPError(http_error_msg, response=self)
requests.exceptions.HTTPError: 400 Client Error: Bad Request for url: http://localhost:7000/api/auth/verify-otp

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 27, in <module>
  File "<string>", line 25, in test_verify_otp_with_correct_email_and_otp
AssertionError: Request failed: 400 Client Error: Bad Request for url: http://localhost:7000/api/auth/verify-otp

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a50db638-45fc-48da-989b-f3dad76f9b7d/468d2409-0581-401b-9c00-4df78484c08f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005
- **Test Name:** login with valid credentials and role
- **Test Code:** [TC005_login_with_valid_credentials_and_role.py](./TC005_login_with_valid_credentials_and_role.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 50, in <module>
  File "<string>", line 36, in test_login_with_valid_credentials_and_role
AssertionError: Login not successful for role student

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a50db638-45fc-48da-989b-f3dad76f9b7d/1ca0655a-ada0-484a-9772-75bb835b233b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006
- **Test Name:** logout and clear jwt cookie
- **Test Code:** [TC006_logout_and_clear_jwt_cookie.py](./TC006_logout_and_clear_jwt_cookie.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 43, in <module>
  File "<string>", line 20, in test_logout_and_clear_jwt_cookie
AssertionError: Login response missing success true

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a50db638-45fc-48da-989b-f3dad76f9b7d/00d442f0-d81a-494b-b489-b9a64f3ca172
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007
- **Test Name:** get student profile with valid token
- **Test Code:** [TC007_get_student_profile_with_valid_token.py](./TC007_get_student_profile_with_valid_token.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 70, in <module>
  File "<string>", line 28, in test_get_student_profile_with_valid_token
AssertionError: Login should be successful

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a50db638-45fc-48da-989b-f3dad76f9b7d/caa473fc-1401-41c5-acf3-b75a3a31ca32
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008
- **Test Name:** create new project with complete company profile
- **Test Code:** [TC008_create_new_project_with_complete_company_profile.py](./TC008_create_new_project_with_complete_company_profile.py)
- **Test Error:** Traceback (most recent call last):
  File "<string>", line 30, in test_create_new_project_with_complete_company_profile
AssertionError: Login failed: {'_id': '6925ae2378a36dbc3b9d37c0', 'email': 'afmahetar2006@gmail.com', 'role': 'student', 'emailVerified': True, 'profileCompleted': False, 'message': 'Login successful'}

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 130, in <module>
  File "<string>", line 112, in test_create_new_project_with_complete_company_profile
AssertionError: Test failed due to unexpected error

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a50db638-45fc-48da-989b-f3dad76f9b7d/bb8265b5-4d64-4a7e-b9f8-ee481213be71
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009
- **Test Name:** apply to project with complete student profile and valid proposal
- **Test Code:** [TC009_apply_to_project_with_complete_student_profile_and_valid_proposal.py](./TC009_apply_to_project_with_complete_student_profile_and_valid_proposal.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 98, in <module>
  File "<string>", line 30, in test_apply_to_project_with_complete_student_profile_and_valid_proposal
AssertionError

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a50db638-45fc-48da-989b-f3dad76f9b7d/abc6e203-3180-4741-8c37-de331708129b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010
- **Test Name:** accept student application and update project status
- **Test Code:** [TC010_accept_student_application_and_update_project_status.py](./TC010_accept_student_application_and_update_project_status.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 353, in <module>
  File "<string>", line 243, in test_accept_student_application_and_update_project_status
  File "<string>", line 21, in login
  File "/var/task/requests/models.py", line 1024, in raise_for_status
    raise HTTPError(http_error_msg, response=self)
requests.exceptions.HTTPError: 401 Client Error: Unauthorized for url: http://localhost:7000/api/auth/login

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a50db638-45fc-48da-989b-f3dad76f9b7d/f3a5ac0d-f392-496a-a77a-41fcb288d3fa
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **0.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---