document.addEventListener('DOMContentLoaded', () => {
    const jobApplicationForm = document.getElementById('jobApplicationForm');
    const statusCheckForm = document.getElementById('statusCheckForm');

    // --- Function to manage data in Local Storage ---
    function getApplications() {
        const applications = localStorage.getItem('applications');
        return applications ? JSON.parse(applications) : [];
    }

    function saveApplications(applications) {
        localStorage.setItem('applications', JSON.stringify(applications));
    }

    // --- Job Application Form Submission (index.html) ---
    if (jobApplicationForm) {
        jobApplicationForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            const formData = new FormData(jobApplicationForm);
            const applicationData = {};
            for (let [key, value] of formData.entries()) {
                applicationData[key] = value;
            }

            // Generate a simple unique application number (Date + random string)
            const timestamp = new Date().getTime();
            const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
            applicationData.applicationNumber = `APP-<span class="math-inline">\{timestamp\}\-</span>{randomString}`;
            applicationData.status = 'Submitted'; // Initial status

            const applications = getApplications();
            applications.push(applicationData);
            saveApplications(applications);

            // Use the global feedback function from HTML
            window.showFeedbackMessage(
                'responseMessage',
                'fa-check-circle', // Icon for success
                'Application Submitted!',
                `<p>Your application has been submitted successfully!</p><p class="font-bold">Your Application Number: ${applicationData.applicationNumber}</p><p class="text-sm">Please save this number to check your status.</p>`,
                true // isSuccess
            );

            jobApplicationForm.reset(); // Clear the form
        });
    }

    // --- Application Status Check (status.html) ---
    if (statusCheckForm) {
        statusCheckForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const applicationNumberInput = document.getElementById('applicationNumber');
            const appNumberToCheck = applicationNumberInput.value.trim().toUpperCase();

            const applications = getApplications();
            const foundApplication = applications.find(app => app.applicationNumber === appNumberToCheck);

            if (foundApplication) {
                window.showFeedbackMessage(
                    'statusResult', // Use statusResult div for status display
                    'fa-info-circle', // Icon for info
                    'Application Found!',
                    `
                    <p><strong>Application No:</strong> ${foundApplication.applicationNumber}</p>
                    <p><strong>Applicant Name:</strong> ${foundApplication.fullName}</p>
                    <p><strong>Desired Job:</strong> <span class="math-inline">\{foundApplication\.desiredJob\}</p\>