        // JavaScript specific to userDetails.html
        document.getElementById("logo").addEventListener("click", () => {
            // Decide if logo click should save data or clear it
            // saveCurrentUserDetails(); // Optionally save before navigating
            sessionStorage.clear(); // Or clear all session data for a fresh start
            window.location.href = 'index.html';
        });

        function saveCurrentUserDetails() {
            sessionStorage.setItem('session_name', document.getElementById('name').value.trim());
            sessionStorage.setItem('session_designation', document.getElementById('designation').value.trim());
            sessionStorage.setItem('session_experience', document.getElementById('experience').value.trim());
        }

document.addEventListener('DOMContentLoaded', () => {
    // Check if user has come through the previous steps
    const userName = sessionStorage.getItem('session_name');
    const userDesignation = sessionStorage.getItem('session_designation'); // Or any other essential previous data

    if (!sessionStorage.getItem('session_username')) { // Check for login and previous step completion
        // showCustomAlert("Please complete login and previous steps first.");
        // setTimeout(() => { window.location.href = './login.html'; }, 1500); 
        window.location.href = './index.html'; 
        return; 
    }
    
    const nameInput = document.getElementById('name');
    const designationInput = document.getElementById('designation');
    const experienceInput = document.getElementById('experience');

    // Load data from sessionStorage if it exists and the elements are found
    if (nameInput) {
        nameInput.value = sessionStorage.getItem('session_name') || '';
    }
    if (designationInput) {
        designationInput.value = sessionStorage.getItem('session_designation') || '';
    }
    if (experienceInput) {
        experienceInput.value = sessionStorage.getItem('session_experience') || '';
    }

    
        });

                // --- Utility Functions ---
        function showCustomAlert(message) {
            const existingAlert = document.getElementById('customAlertBox');
            if (existingAlert) existingAlert.remove();
            const messageBox = document.createElement('div');
            messageBox.id = 'customAlertBox';
            messageBox.textContent = message;
            messageBox.style.cssText = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); z-index:1001; text-align: center;";
            document.body.appendChild(messageBox);
            setTimeout(() => messageBox.remove(), 3000);
        }

        function goBackToLogin() {
            saveCurrentUserDetails(); // Save current details before going back
            window.location.href = 'index.html';
        }

        function goToRTUPage() {
            const name = document.getElementById("name").value.trim();
            const designation = document.getElementById("designation").value.trim();
            const experience = document.getElementById("experience").value.trim();

            if (!name || !designation || experience === "") {
                showCustomAlert("Please fill in all user details.");
                return;
            }
            saveCurrentUserDetails(); // Save details before proceeding

            // Navigate to the next page (e.g., rtuInfo.html)
           window.location.href ='rtudetail.html';
        }
