    // JavaScript specific to userDetails.html
document.getElementById("logo").addEventListener("click", () => {
    // Decide if logo click should save data or clear it
    // saveCurrentUserDetails(); // Optionally save before navigating
    sessionStorage.clear(); // Or clear all session data for a fresh start
    window.location.href = 'index.html';
});
        
function saveCurrentRTUDetails() {
    const rtuSerialInput = document.getElementById('rtuSerial');
    const contractNoInput = document.getElementById('contractNo');

    if (rtuSerialInput) sessionStorage.setItem('session_rtuSerial', rtuSerialInput.value.trim());
    if (contractNoInput) sessionStorage.setItem('session_contractNo', contractNoInput.value.trim());
}

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

document.addEventListener('DOMContentLoaded', () => {
    // Check if user has come through the previous steps
    const userName = sessionStorage.getItem('session_name');
    const userDesignation = sessionStorage.getItem('session_designation'); // Or any other essential previous data

    if (!sessionStorage.getItem('session_username') || !userName || !userDesignation) { // Check for login and previous step completion
        // showCustomAlert("Please complete login and previous steps first.");
        // setTimeout(() => { window.location.href = './login.html'; }, 1500); 
        window.location.href = './index.html'; 
        return; 
    }
    
    // Load RTU data from sessionStorage
    const rtuSerialInput = document.getElementById('rtuSerial');
    const contractNoInput = document.getElementById('contractNo');

    if (rtuSerialInput) rtuSerialInput.value = sessionStorage.getItem('session_rtuSerial') || '';
    if (contractNoInput) contractNoInput.value = sessionStorage.getItem('session_contractNo') || '';
});

function goBackToUserDetails() {
    saveCurrentRTUDetails(); // Save current RTU details
    // No need to restore userDetails form here, that page's DOMContentLoaded will handle it from sessionStorage
    window.location.href = './userdetail.html'; 
}

function goToBQPage() {
    const rtuSerialInput = document.getElementById("rtuSerial");
    const contractNoInput = document.getElementById("contractNo");

    const rtuSerial = rtuSerialInput ? rtuSerialInput.value.trim() : "";
    const contractNo = contractNoInput ? contractNoInput.value.trim() : "";

    if (!rtuSerial || !contractNo) {
        showCustomAlert("Please fill in RTU Serial No. and Contract No.");
        return;
    }
    saveCurrentRTUDetails(); // Save current RTU details

    window.location.href = './BQ.html'; // Ensure 'bqPage.html' is the correct filename
}
