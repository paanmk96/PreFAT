document.addEventListener('DOMContentLoaded', function() {
    // --- Global userData variable for this scope ---
    let userData = {};

    // --- Initial Setup for logo click ---
    const logoElement = document.getElementById("logo");
    if (logoElement) {
        logoElement.addEventListener("click", () => {
            sessionStorage.clear();
            window.location.href = 'index.html';
        });
    }

    // --- Function to load user data from session storage ---
    function loadUserData() {
        const nameInput = document.getElementById('name');
        const designationInput = document.getElementById('designation');
        const experienceInput = document.getElementById('experience');

        if (nameInput) nameInput.value = sessionStorage.getItem('session_name') || '';
        if (designationInput) designationInput.value = sessionStorage.getItem('session_designation') || '';
        if (experienceInput) experienceInput.value = sessionStorage.getItem('session_experience') || '';

        const sessionUsername = sessionStorage.getItem('session_username');
        const sessionRtuSerial = sessionStorage.getItem('session_rtuSerial');
        const sessionName = sessionStorage.getItem('session_name');
        const sessionDesignation = sessionStorage.getItem('session_designation');
        const sessionExperience = sessionStorage.getItem('session_experience');
        const sessionContractNo = sessionStorage.getItem('session_contractNo');

        if (!sessionUsername || !sessionRtuSerial) {
            showCustomAlert("Essential session data missing. Redirecting to login.");
            setTimeout(() => { window.location.href = './index.html'; }, 2000);
            return false;
        }

        userData = {
            username: sessionUsername,
            rtuSerial: sessionRtuSerial,
            name: sessionName || 'N/A',
            designation: sessionDesignation || 'N/A',
            experience: sessionExperience || '0',
            contractNo: sessionContractNo || 'N/A'
        };
        console.log("User data loaded:", userData);
        return true;
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

    // --- Session Storage and Data Persistence ---
    function saveCurrentBQCounts() {
        const diCountInput = document.getElementById('diCount');
        const doCountInput = document.getElementById('doCount');
        const aiCountInput = document.getElementById('aiCount');
        const aoCountInput = document.getElementById('aoCount');

        if (diCountInput) sessionStorage.setItem('session_diCount', diCountInput.value);
        if (doCountInput) sessionStorage.setItem('session_doCount', doCountInput.value);
        if (aiCountInput) sessionStorage.setItem('session_aiCount', aiCountInput.value);
        if (aoCountInput) sessionStorage.setItem('session_aoCount', aoCountInput.value);
    }

    function loadBQCounts() {
        const diCountInput = document.getElementById('diCount');
        const doCountInput = document.getElementById('doCount');
        const aiCountInput = document.getElementById('aiCount');
        const aoCountInput = document.getElementById('aoCount');

        if (diCountInput) diCountInput.value = sessionStorage.getItem('session_diCount') || '0';
        if (doCountInput) doCountInput.value = sessionStorage.getItem('session_doCount') || '0';
        if (aiCountInput) aiCountInput.value = sessionStorage.getItem('session_aiCount') || '0';
        if (aoCountInput) aoCountInput.value = sessionStorage.getItem('session_aoCount') || '0';

        const generateBtnEl = document.getElementById('generateBtn');
        if (generateBtnEl && (
            (diCountInput && parseInt(diCountInput.value) > 0) ||
            (doCountInput && parseInt(doCountInput.value) > 0) ||
            (aiCountInput && parseInt(aiCountInput.value) > 0) ||
            (aoCountInput && parseInt(aoCountInput.value) > 0)
        )) {
            // generateBtnEl.click(); // Uncomment if you want to auto-generate on load
        }
    }
    // --- Dynamic Sheet Creation Functions ---
function createModuleSheetBase(count, moduleType, partNumbers) {
    const container = document.createElement('div');
    container.className = 'module-sheet';
    const headerDiv = document.createElement('div');
    headerDiv.className = 'sheet-header';
    const h3 = document.createElement('h3');
    h3.textContent = `${moduleType.toUpperCase()} Modules (${count})`;
    const label = document.createElement('span');
    label.className = `module-type ${moduleType.toLowerCase()}`;
    label.textContent = moduleType.toUpperCase();
    headerDiv.appendChild(h3);
    headerDiv.appendChild(label);
    container.appendChild(headerDiv);
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Module No.', 'Part Number', 'Subrack No.', 'Slot No.', 'Serial No.'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    for (let i = 1; i <= count; i++) {
        const row = document.createElement('tr');
        row.insertCell().textContent = i; // Module No. cell
        const cellPartNo = row.insertCell(); // Part Number cell
        const partNoSelect = document.createElement('select');
        partNoSelect.name = `${moduleType.toLowerCase()}_${i}_part_no`;
        const placeholderOption = document.createElement('option');
        placeholderOption.value = "";
        placeholderOption.textContent = "-- Select Part --";
        partNoSelect.appendChild(placeholderOption);
        partNumbers.forEach(part => {
            const option = document.createElement('option');
            option.value = part;
            option.textContent = part;
            partNoSelect.appendChild(option);
        });

        //Pre-Fill with the first part Number (changed from second part in your original)
        if (partNumbers.length > 0) {
            partNoSelect.value = partNumbers[0];
        }
        cellPartNo.appendChild(partNoSelect);

        // Subrack, Slot, Serial No. cells
        ['subrack', 'slot', 'serial'].forEach(fieldName => {
            const cell = row.insertCell();
            const input = document.createElement('input');
            input.type = 'text';
            input.name = `${moduleType.toLowerCase()}_${i}_${fieldName}`;
            // Modify placeholder for serial to indicate scanning is possible
            if (fieldName === 'serial') {
                input.placeholder = `Enter or Scan serial`;
            } else {
                input.placeholder = `Enter ${fieldName.replace('_', ' ')}`;
            }
            cell.appendChild(input);

            // --- MODIFICATION: Add Scan Button for 'serial' field ---
            if (fieldName === 'serial') {
                const scanButton = document.createElement('button');
                scanButton.type = 'button'; // Important to prevent form submission if inside a <form>
                scanButton.textContent = 'Scan';
                scanButton.className = 'scan-qr-button'; // For styling if needed
                scanButton.style.marginLeft = '5px';    // Optional styling for spacing

                // Add event listener to this specific button to scan for the 'input' field
                scanButton.addEventListener('click', function() {
                    // Ensure 'initiateScanForField' is defined and accessible in your script
                    if (typeof initiateScanForField === 'function') {
                        initiateScanForField(input); // 'input' is the serial number text field
                    } else {
                        console.error("initiateScanForField function is not defined.");
                        // You might want to use your showCustomAlert here too
                        if(typeof showCustomAlert === 'function') {
                            showCustomAlert("Error: QR Scan function not ready.");
                        }
                    }
                });
                cell.appendChild(scanButton); // Add the button to the same cell as the serial input
            }
            // --- END OF MODIFICATION ---
        });
        tbody.appendChild(row);
    }
    table.appendChild(tbody);
    container.appendChild(table);
    return container;
}

    function createDISheet(count) { return createModuleSheetBase(count, 'DI', ['DI-32-24V', 'DI-16-24V-A']); }
    function createDOSheet(count) { return createModuleSheetBase(count, 'DO', ['CO-16-A', 'CO-8-A']); }
    function createAISheet(count) { return createModuleSheetBase(count, 'AI', ['DCAI-8-A']); }
    function createAOSheet(count) { return createModuleSheetBase(count, 'AO', ['AO-2']); }

    // --- Initialize Page ---
    if (!loadUserData()) {
        return;
    }
    loadBQCounts();

    // --- Get DOM Elements for Event Listeners ---
    const generateBtn = document.getElementById('generateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const backBtn = document.getElementById('backBtn');
    const submitBtn = document.getElementById('submitBtn');
    const sheetsContainer = document.getElementById('sheetsContainer');

    // --- Event Listeners ---
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            saveCurrentBQCounts();
            const diCount = parseInt(document.getElementById('diCount')?.value) || 0;
            const doCount = parseInt(document.getElementById('doCount')?.value) || 0;
            const aiCount = parseInt(document.getElementById('aiCount')?.value) || 0;
            const aoCount = parseInt(document.getElementById('aoCount')?.value) || 0;
            const totalCount = diCount + doCount + aiCount + aoCount;
            if (totalCount === 0) {
                showCustomAlert('Please enter at least one module count to generate sheets.');
                return;
            }
            if (sheetsContainer) sheetsContainer.innerHTML = "";
            if (diCount > 0 && sheetsContainer) sheetsContainer.appendChild(createDISheet(diCount));
            if (doCount > 0 && sheetsContainer) sheetsContainer.appendChild(createDOSheet(doCount));
            if (aiCount > 0 && sheetsContainer) sheetsContainer.appendChild(createAISheet(aiCount));
            if (aoCount > 0 && sheetsContainer) sheetsContainer.appendChild(createAOSheet(aoCount));
        });
    }
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (sheetsContainer) sheetsContainer.innerHTML = "";
            ['diCount','doCount','aiCount','aoCount'].forEach(id => {
                const inputEl = document.getElementById(id);
                if (inputEl) inputEl.value = '0';
            });
            saveCurrentBQCounts();
        });
    }
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            saveCurrentBQCounts();
            window.location.href = './rtudetail.html';
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            saveCurrentBQCounts();
            const diCount = parseInt(document.getElementById('diCount')?.value) || 0;
            const doCount = parseInt(document.getElementById('doCount')?.value) || 0;
            const aiCount = parseInt(document.getElementById('aiCount')?.value) || 0;
            const aoCount = parseInt(document.getElementById('aoCount')?.value) || 0;
            const totalModules = diCount + doCount + aiCount + aoCount;

            if (totalModules === 0) {
                showCustomAlert("Please enter module quantities and generate sheets before submitting.");
                return;
            }
            if (!userData || !userData.rtuSerial) {
                showCustomAlert("User data is missing. Cannot generate report. Please log in again.");
                if (!loadUserData()){ return; }
            }
            
            function validateAllModuleFields() {
                if (totalModules === 0) return true;
                if (!sheetsContainer || sheetsContainer.children.length === 0) {
                    console.warn("validateAllModuleFields: Sheets container empty or not found when modules are expected.");
                    return false;
                }
                const sheets = sheetsContainer.getElementsByClassName('module-sheet');
                for (const sheet of sheets) {
                    const tableRows = sheet.querySelectorAll('tbody tr');
                    for (const row of tableRows) {
                        const selectElement = row.querySelector('select');
                        const inputElements = row.querySelectorAll('input[type="text"]');
                        if (selectElement && !selectElement.value) return false;
                        for (const input of inputElements) {
                            if (!input.value.trim()) return false;
                        }
                    }
                }
                return true;
            }

            const sheetsAreMissingOrEmpty = !sheetsContainer || (sheetsContainer.children.length === 0 && totalModules > 0);

            if (sheetsAreMissingOrEmpty) {
                if (generateBtn) {
                    generateBtn.click();
                } else {
                    showCustomAlert("Error: Generate button not found. Cannot create sheets.");
                    return;
                }
                setTimeout(() => {
                    if (!validateAllModuleFields()) {
                        showCustomAlert("Please fill in all module details (Part No., Subrack, Slot, Serial) for all items.");
                        return;
                    }
                    if (!userData || !userData.rtuSerial) {
                         showCustomAlert("User data became invalid after delay. Please try again."); return;
                    }
                    generatePdfReport(userData);
                }, 350);
            } else {
                if (totalModules > 0) { 
                    if (!validateAllModuleFields()) {
                        showCustomAlert("Please fill in all module details (Part No., Subrack, Slot, Serial) for all items.");
                        return;
                    }
                }
                generatePdfReport(userData);
            }
        });
    }

    // --- PDF Generation Functions ---
    function generatePdfReport(currentUserData) {
        try {
            if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
                showCustomAlert("Error: jsPDF library not found. Please check HTML includes.");
                return;
            }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            if (typeof doc.autoTable !== 'function') {
                showCustomAlert("Error: jsPDF-AutoTable plugin not found. Please check HTML includes.");
                return;
            }

            // --- Image Setup ---
            const imageUrl = 'Icon/GV.png'; // IMPORTANT: Ensure this path is correct relative to your HTML file.
            const imageFormat = 'PNG'; 
            const imgWidth = 15;
            const imgHeight = 15;
            const pageHeight = doc.internal.pageSize.getHeight();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 15;
            const xPosition = pageWidth - imgWidth - margin;
            const yPosition = 5;

            // Helper to add image, to be called on new pages
            const addImageToCurrentPage = () => {
                try { // Add try-catch specifically for addImage if issues persist
                    doc.addImage(imageUrl, imageFormat, xPosition, yPosition, imgWidth, imgHeight);
                } catch (imgError) {
                    console.error("Error adding image to page:", imgError);
                    showCustomAlert("Error: Could not add company logo to the page. Check image path and format.");
                }
            };
            
            addImageToCurrentPage(); // Add image to the first page

            // --- Document Properties ---
            doc.setProperties({
                title: `RTU Pre-FAT Report - ${currentUserData.rtuSerial}`,
                subject: 'RTU Module Configuration',
                author: currentUserData.username,
                keywords: 'RTU, FAT, Report',
                creator: 'RTU Pre-FAT Tool'
            });

            // --- PDF Content ---
            let textStartY = margin; 
            if ((yPosition + imgHeight + 5) > textStartY) {
                 textStartY = yPosition + imgHeight + 5; 
            }

            doc.setFontSize(20);
            doc.setTextColor(40);
            doc.setFont(undefined, 'bold');
            doc.text('DF1725IED RTU Pre-FAT Report', pageWidth / 2, textStartY, { align: 'center' }); // Use pageWidth for centering
            doc.setFont(undefined, 'normal');

            const subtitleY1 = textStartY + 10;
            const subtitleY2 = subtitleY1 + 7;

            doc.setFontSize(14);
            doc.setTextColor(40);
            doc.setFont(undefined, 'bold');
            doc.text(`RTU Serial No.: ${currentUserData.rtuSerial}`, pageWidth / 2, subtitleY1, { align: 'center' });
            doc.text(`Contract No.: ${currentUserData.contractNo}`, pageWidth / 2, subtitleY2, { align: 'center' });
            doc.setFont(undefined, 'normal');

            const lineY = subtitleY2 + 10; 
            doc.setDrawColor(40);
            doc.setLineWidth(0.5);
            doc.line(margin, lineY, pageWidth - margin, lineY); // Use margin for line extent

            let currentY = lineY + 10; // Initialize currentY for drawing content

            doc.setFontSize(14);
            doc.setTextColor(40);
            doc.setFont(undefined, 'bold');
            doc.text('Tester Information', margin, currentY);
            doc.setFont(undefined, 'normal');
            
            currentY += 10;

            const userInfo = [
                ['Name:', currentUserData.name],
                ['Designation:', currentUserData.designation],
                ['Experience:', `${currentUserData.experience} years`],
                ['Date:', new Date().toLocaleDateString()]
            ];

            doc.setFontSize(12);
            doc.setTextColor(40);
            userInfo.forEach(info => {
                if (currentY > pageHeight - margin - 10) { // Check for page bottom before drawing text
                    doc.addPage();
                    addImageToCurrentPage(); // Add image to new page
                    currentY = margin + (imgHeight > margin ? imgHeight + 5 : 0) + 10; // Reset Y, consider image height
                }
                doc.text(info[0], margin, currentY);
                doc.text(info[1], margin + 40, currentY); // Adjusted X for value
                currentY += 7;
            });

            currentY += 10;
            if (currentY > pageHeight - margin - 20) {  // Check before BoQ title
                doc.addPage();
                addImageToCurrentPage();
                currentY = margin + (imgHeight > margin ? imgHeight + 5 : 0) + 10;
            }
            doc.setFontSize(14);
            doc.setTextColor(40);
            doc.setFont(undefined, 'bold');
            doc.text('Bill of Quantity', margin, currentY);
            doc.setFont(undefined, 'normal');
            currentY += 5;

            const diCount = parseInt(document.getElementById('diCount')?.value) || 0;
            const doCount = parseInt(document.getElementById('doCount')?.value) || 0;
            const aiCount = parseInt(document.getElementById('aiCount')?.value) || 0;
            const aoCount = parseInt(document.getElementById('aoCount')?.value) || 0;

            const moduleSummary = [
                ['Module Type', 'Quantity'],
                ['DI Modules', diCount],
                ['DO Modules', doCount],
                ['AI Modules', aiCount],
                ['AO Modules', aoCount],
                ['Total Modules', diCount + doCount + aiCount + aoCount]
            ];
            
            if (currentY > pageHeight - margin - 50) { // Check space for table
                 doc.addPage();
                 addImageToCurrentPage();
                 currentY = margin + (imgHeight > margin ? imgHeight + 5 : 0) + 10;
            }
            doc.autoTable({
                startY: currentY,
                head: [moduleSummary[0]],
                body: moduleSummary.slice(1),
                margin: { left: margin, right: margin },
                styles: { fontSize: 12, cellPadding: 3, lineWidth: 0.1, lineColor: [0,0,0], textColor: [0,0,0] },
                alternateRowStyles: { fillColor: [255, 255, 255] },
                headStyles: { fillColor: [211, 211, 211], textColor: [0, 0, 0], fontStyle: 'bold' },
                tableLineWidth: 0.1,
                tableLineColor: [0,0,0],
                didDrawPage: function (data) { // Hook for pages auto-added by autoTable
                    if (data.pageNumber > 1 || !data.doc.internal.getCurrentPageInfo().pageContext.isFirstPageAddedByMe) {
                         // Avoid re-adding to the very first page if already added.
                         // This logic can get complex; a simpler way is to add to all pages in final loop if needed.
                         // For now, focused on pages explicitly added by doc.addPage() below.
                        // addImageToCurrentPage(); // Add image to pages generated by AutoTable spanning
                    }
                    data.doc.internal.getCurrentPageInfo().pageContext.isFirstPageAddedByMe = false; // Reset flag
                }
            });
            // currentY = doc.lastAutoTable.finalY + 10; // Update currentY if more content follows on this page

            // Module Sections
            const moduleSectionStartY = margin + (imgHeight > margin ? imgHeight + 5 : 0) + 10; // Consistent startY for new pages

            if (diCount > 0) {
                doc.addPage();
                doc.internal.getCurrentPageInfo().pageContext.isFirstPageAddedByMe = true; // Flag for autoTable hook
                addImageToCurrentPage();
                addModuleSection(doc, 'DI', moduleSectionStartY);
            }
            if (doCount > 0) {
                doc.addPage();
                doc.internal.getCurrentPageInfo().pageContext.isFirstPageAddedByMe = true;
                addImageToCurrentPage();
                addModuleSection(doc, 'DO', moduleSectionStartY);
            }
            if (aiCount > 0) {
                doc.addPage();
                doc.internal.getCurrentPageInfo().pageContext.isFirstPageAddedByMe = true;
                addImageToCurrentPage();
                addModuleSection(doc, 'AI', moduleSectionStartY);
            }
            if (aoCount > 0) {
                doc.addPage();
                doc.internal.getCurrentPageInfo().pageContext.isFirstPageAddedByMe = true;
                addImageToCurrentPage();
                addModuleSection(doc, 'AO', moduleSectionStartY);
            }

            const totalPages = doc.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                // If image wasn't added by other means (e.g. by autoTable hook for its own new pages)
                // you could add it here. But for simplicity, relying on explicit adds for now.
                // if (i > 1 && !doc.internal.getCurrentPageInfo().pageContext.isFirstPageAddedByMe) {
                //    addImageToCurrentPage(); // Could add here if logic ensures it's not duplicated
                // }
                updatePageFooter(doc, i, totalPages, currentUserData);
            }
            
            doc.save(`DF1725IED RTU PreFAT Report ${currentUserData.contractNo}-${currentUserData.rtuSerial}.pdf`);
            showCustomAlert("PDF report generated successfully!");

        } catch (error) {
            console.error("Error generating PDF:", error);
            showCustomAlert("Failed to generate PDF. Check console. Error: " + error.message);
        }
    }

    function addModuleSection(doc, moduleType, startY) {
        const prefix = moduleType.toLowerCase();
        const countInput = document.getElementById(`${prefix}Count`);
        const count = countInput ? (parseInt(countInput.value) || 0) : 0;

        doc.setFillColor(255,255,255);
        doc.rect(15, startY, doc.internal.pageSize.getWidth() - 30, 8, 'F');
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text(`${moduleType.toUpperCase()} Modules Detail`, doc.internal.pageSize.getWidth() / 2, startY + 5.5, { align: 'center' });
        doc.setFont(undefined, 'normal');

        const headers = ['Module No.', 'Part Number', 'Subrack No.', 'Slot No.', 'Serial No.'];
        const body = [];
        for (let i = 1; i <= count; i++) {
            const partNoSelect = document.querySelector(`select[name="${prefix}_${i}_part_no"]`);
            const subrackInput = document.querySelector(`input[name="${prefix}_${i}_subrack"]`);
            const slotInput = document.querySelector(`input[name="${prefix}_${i}_slot"]`);
            const serialInput = document.querySelector(`input[name="${prefix}_${i}_serial"]`);
            body.push([
                i,
                partNoSelect ? partNoSelect.value : 'N/A',
                subrackInput ? subrackInput.value : 'N/A',
                slotInput ? slotInput.value : 'N/A',
                serialInput ? serialInput.value : 'N/A'
            ]);
        }

        doc.autoTable({
            startY: startY + 12,
            head: [headers],
            body: body,
            margin: { left: 15, right: 15 },
            styles: { fontSize: 10, textColor: [0,0,0], cellPadding: 2, overflow: 'linebreak', lineWidth: 0.1, lineColor: [0,0,0], halign: 'center' },
            headStyles: { fillColor: getModuleColor(moduleType), textColor: [0,0,0], fontSize: 10, halign: 'center' },
            alternateRowStyles: { fillColor: [255, 255, 255] },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1
        });
    }

    function updatePageFooter(doc, pageNumber, totalPages, currentUserData) {
        doc.setFontSize(8);
        doc.setTextColor(150);
        const pageText = `Page ${pageNumber} of ${totalPages}`;
        const infoText = `RTU Serial No: ${currentUserData.rtuSerial} | Contract No: ${currentUserData.contractNo}`;
        const generatedText = `Generated by ${currentUserData.name} on ${new Date().toLocaleString()}`;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.text(pageText, pageWidth / 2, pageHeight - 15, { align: 'center' });
        doc.text(infoText, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(generatedText, pageWidth / 2, pageHeight - 5, { align: 'center' });
    }

    function getModuleColor(moduleType) {
        switch(moduleType.toUpperCase()) {
            case 'DI': return [52, 152, 219];
            case 'DO': return [46, 204, 113];
            case 'AI': return [241, 196, 15];
            case 'AO': return [231, 76, 60];
            default: return [149, 165, 166];
        }
    }
});