        // Global user data to retain between pages
        let userData = {
            username: '',
            password: '',
            name: '',
            designation: '',
            experience: '',
            rtuSerial: '',
            contractNo: ''
        };

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

        // JavaScript specific to login.html
        document.getElementById("logo").addEventListener("click", () => {
            // Clear any session data if you want a full reset on logo click
            sessionStorage.clear();
            window.location.href = 'index.html'; // Or just stay, or reload
        });

        function goToUserDetails() {
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!username || !password) {
                showCustomAlert("Please enter Username and Password.");
                return;
            }

            // Store data that might be needed globally or on the next page
            // For example, you might store the username or a "loggedIn" status
            sessionStorage.setItem('session_username', username);
            // If you had other global data from your original 'userData' object that
            // should be initialized or carried over, set them in sessionStorage here.
            // e.g., sessionStorage.setItem('session_name', ''); // Initialize for next page

            // Navigate to the user details page
            window.location.href = 'userdetail.html';
        }

        // Pre-fill login fields if navigating back
        document.addEventListener('DOMContentLoaded', () => {
            const usernameInput = document.getElementById('username'); // Get the element first

            // Check if the element was actually found AND if there's a session_username
            if (usernameInput && sessionStorage.getItem('session_username')) {
                usernameInput.value = sessionStorage.getItem('session_username');
            }
            // You might choose not to pre-fill the password for security.
        });


        // Logo click returns to Login page
        document.getElementById("logo").addEventListener("click", () => {
            // Clear all user data & reset pages to login
            userData = {
                username: '',
                password: '',
                name: '',
                designation: '',
                experience: '',
                rtuSerial: '',
                contractNo: ''
            };

            // Clear input fields on all pages
            document.querySelectorAll("input").forEach(input => input.value = "");
            document.querySelectorAll("textarea").forEach(textarea => textarea.value = "");
            document.querySelectorAll("select").forEach(select => select.selectedIndex = 0);

            // Clear sheets container
            document.getElementById("sheetsContainer").innerHTML = "";

            showPage('loginPage');
        });
