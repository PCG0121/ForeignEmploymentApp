document.addEventListener('DOMContentLoaded', () => {
    const applicationsTableBody = document.getElementById('applicationsTableBody');
    const adminSearchInput = document.getElementById('adminSearch');
    const statusFilterSelect = document.getElementById('statusFilter');
    const noApplicationsMessage = document.getElementById('noApplicationsMessage');

    // Function to get applications from Local Storage
    function getApplications() {
        const applications = localStorage.getItem('applications');
        return applications ? JSON.parse(applications) : [];
    }

    // Function to save applications to Local Storage
    function saveApplications(applications) {
        localStorage.setItem('applications', JSON.stringify(applications));
    }

    // Function to display applications in the table
    function displayApplications() {
        const applications = getApplications();
        const searchTerm = adminSearchInput.value.toLowerCase();
        const filterStatus = statusFilterSelect.value;

        applicationsTableBody.innerHTML = ''; // Clear existing rows

        const filteredApplications = applications.filter(app => {
            const matchesSearch = app.applicationNumber.toLowerCase().includes(searchTerm) ||
                                  app.fullName.toLowerCase().includes(searchTerm) ||
                                  app.email.toLowerCase().includes(searchTerm);
            const matchesStatus = filterStatus === '' || app.status === filterStatus;
            return matchesSearch && matchesStatus;
        });

        if (filteredApplications.length === 0) {
            noApplicationsMessage.classList.remove('hidden');
        } else {
            noApplicationsMessage.classList.add('hidden');
            filteredApplications.forEach(app => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-blue-50 transition duration-150 ease-in-out';

                // Determine status badge color
                let statusBadgeClasses = '';
                switch (app.status) {
                    case 'Submitted':
                        statusBadgeClasses = 'bg-blue-100 text-blue-800';
                        break;
                    case 'Under Review':
                        statusBadgeClasses = 'bg-yellow-100 text-yellow-800';
                        break;
                    case 'Approved':
                        statusBadgeClasses = 'bg-green-100 text-green-800';
                        break;
                    case 'Rejected':
                        statusBadgeClasses = 'bg-red-100 text-red-800';
                        break;
                    default:
                        statusBadgeClasses = 'bg-gray-100 text-gray-800';
                }

                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${app.applicationNumber}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${app.fullName}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${app.desiredJob}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeClasses}">
                            ${app.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <select class="status-select p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2" data-id="${app.applicationNumber}">
                            <option value="Submitted" ${app.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
                            <option value="Under Review" ${app.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                            <option value="Approved" ${app.status === 'Approved' ? 'selected' : ''}>Approved</option>
                            <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                        <button class="view-details-btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-md text-xs mr-2 transition duration-150 ease-in-out" data-id="${app.applicationNumber}" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="delete-btn bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-md text-xs transition duration-150 ease-in-out" data-id="${app.applicationNumber}" title="Delete Application">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                applicationsTableBody.appendChild(row);
            });
        }
    }

    // Event Listeners for Search and Filter
    if (adminSearchInput) {
        adminSearchInput.addEventListener('keyup', displayApplications);
    }
    if (statusFilterSelect) {
        statusFilterSelect.addEventListener('change', displayApplications);
    }

    // Event Listener for Status Change, View Details, and Delete Buttons
    applicationsTableBody.addEventListener('change', (event) => {
        if (event.target.classList.contains('status-select')) {
            const appNumberToUpdate = event.target.dataset.id;
            const newStatus = event.target.value;
            let applications = getApplications();
            const appIndex = applications.findIndex(app => app.applicationNumber === appNumberToUpdate);
            if (appIndex !== -1) {
                applications[appIndex].status = newStatus;
                saveApplications(applications);
                displayApplications(); // Re-render to update badge color
            }
        }
    });

    applicationsTableBody.addEventListener('click', (event) => {
        if (event.target.closest('.delete-btn')) {
            const appNumberToDelete = event.target.closest('.delete-btn').dataset.id;
            if (confirm(`Are you sure you want to delete application ${appNumberToDelete}?`)) {
                let applications = getApplications();
                applications = applications.filter(app => app.applicationNumber !== appNumberToDelete);
                saveApplications(applications);
                displayApplications(); // Re-render the table
                console.log(`Application ${appNumberToDelete} deleted.`);
            }
        } else if (event.target.closest('.view-details-btn')) {
            const appNumberToView = event.target.closest('.view-details-btn').dataset.id;
            const applications = getApplications();
            const app = applications.find(app => app.applicationNumber === appNumberToView);
            if (app) {
                // Using a more prominent alert for details
                const detailsHtml = `
                    <h3 class="text-xl font-bold text-blue-700 mb-4">Application Details:</h3>
                    <p><strong>App No:</strong> <span class="font-semibold text-gray-900">${app.applicationNumber}</span></p>
                    <p><strong>Name:</strong> ${app.fullName}</p>
                    <p><strong>Email:</strong> ${app.email}</p>
                    <p><strong>Phone:</strong> ${app.phone}</p>
                    <p><strong>NIC:</strong> ${app.nic}</p>
                    <p><strong>Desired Job:</strong> ${app.desiredJob}</p>
                    <p><strong>Desired Country:</strong> ${app.desiredCountry}</p>
                    <p><strong>Experience:</strong> ${app.experience || 'N/A'}</p>
                    <p><strong>Education:</strong> ${app.education || 'N/A'}</p>
                    <p><strong>Status:</strong> <span class="font-bold text-blue-600">${app.status}</span></p>
                `;
                // Use the global feedback function from main.js (or create a local one if main.js isn't linked)
                // For admin, a simple alert is fine, but for consistency, you could integrate a modal.
                // For now, this uses a browser alert:
                alert(detailsHtml.replace(/<[^>]*>/g, '')); // Strips HTML tags for a cleaner alert
            }
        }
    });

    // Initial display of applications when the page loads
    displayApplications();
});