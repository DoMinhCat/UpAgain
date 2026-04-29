# Design Spec: CI/CD Setup for UpAgain (DMZ VM)

**Date:** 2026-04-29
**Topic:** Implementation of a CI/CD pipeline using GitHub Self-Hosted Runner to deploy the UpAgain application to a Linux VM in a DMZ.
**Branch:** `arnaud/ci`

## 1. Goal
Automate the deployment process of the UpAgain project. The pipeline should build the application using Docker and ensure the frontend files are accessible via the TrueNAS shared storage (`/mnt/truenas-web/front`), as per the project requirements.

## 2. Architecture

### 2.1 Deployment Strategy: Self-Hosted Runner
- **Why:** The VM is in a DMZ with Cloudflare (via `cloudflared`). A self-hosted runner avoids opening inbound ports.
- **Workflow:**
    1. GitHub triggers the job on a push to `arnaud/ci`.
    2. The Runner on the VM receives the job.
    3. The Runner executes the deployment script.

### 2.2 Containerization: Full Docker
- The application will be managed via `docker-compose`.
- Images will be built locally on the VM by the Runner to ensure the latest code is used.

### 2.3 Storage & Persistence (TrueNAS)
- The frontend `dist` directory must be reflected in `/mnt/truenas-web/front`.
- The backend `.env` file is managed locally on the VM at `/mnt/truenas-web/back/.env` and mounted into the container.

## 3. Implementation Details

### 3.1 GitHub Workflow (`.github/workflows/deploy.yml`)
- **Trigger:** `push` on `arnaud/ci`.
- **Steps:**
    1. **Checkout:** Get the latest code.
    2. **Env Check:** Verify presence of `.env` files (or copy them from a secure local location if missing).
    3. **Docker Build & Up:** Run `docker-compose up -d --build`.
    4. **NAS Sync:** Copy the frontend build artifacts from the container/local build dir to `/mnt/truenas-web/front`.

### 3.2 Docker Configuration
- **`docker-compose.yml`:** 
    - Update `back` and `front` services to use `build: ./back` and `build: ./front`.
    - Maintain volume mapping for `/mnt/truenas-web/back/.env`.
    - Maintain volume mapping for `/mnt/truenas-web/front`.

### 3.3 Security
- No secrets in the repository.
- Use GitHub Secrets only if environment variables need to be injected during the build phase (not required currently as they are local to the VM).

## 4. Success Criteria
- [ ] Pushing to `arnaud/ci` triggers the GitHub Action.
- [ ] The build completes successfully on the VM.
- [ ] Containers are restarted with the new code.
- [ ] The website is accessible via Cloudflare.
- [ ] `/mnt/truenas-web/front` contains the latest frontend build.

## 5. Next Steps (Implementation Plan)
1. Manual setup of the GitHub Runner on the VM.
2. Modification of `docker-compose.yml` to support local builds.
3. Creation of the `.github/workflows/deploy.yml` file.
4. Testing the pipeline with a dummy commit.
