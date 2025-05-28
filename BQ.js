document.addEventListener('DOMContentLoaded', function() {
    // --- Global variables ---
    let userData = {};
    const serialNumberTracker = {
        usedSerials: new Map(), // Stores serial -> {moduleType, moduleNo}
        checkDuplicate: function(serial) {
            if (!serial) return false;
            return this.usedSerials.has(serial);
        },
        addSerial: function(serial, moduleType, moduleNo) {
            if (serial) this.usedSerials.set(serial, {moduleType, moduleNo});
        },
        getDuplicateLocation: function(serial) {
            const info = this.usedSerials.get(serial);
            return info ? `${info.moduleType} Module ${info.moduleNo}` : null;
        },
        clearAll: function() {
            this.usedSerials.clear();
        }
    };

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
            
            // Module No.
            row.insertCell().textContent = i;
            
            // Part Number (select dropdown)
            const cellPartNo = row.insertCell();
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
            if (partNumbers.length > 0) partNoSelect.value = partNumbers[0];
            cellPartNo.appendChild(partNoSelect);

            // Subrack No.
            const subrackCell = row.insertCell();
            const subrackInput = document.createElement('input');
            subrackInput.type = 'text';
            subrackInput.name = `${moduleType.toLowerCase()}_${i}_subrack`;
            subrackInput.placeholder = 'Enter subrack';
            subrackInput.required = true;
            subrackCell.appendChild(subrackInput);

            // Slot No.
            const slotCell = row.insertCell();
            const slotInput = document.createElement('input');
            slotInput.type = 'text';
            slotInput.name = `${moduleType.toLowerCase()}_${i}_slot`;
            slotInput.placeholder = 'Enter slot';
            slotInput.required = true;
            slotCell.appendChild(slotInput);

            // Serial No. with Scan button
            const serialCell = row.insertCell();
            serialCell.style.display = 'flex';
            serialCell.style.alignItems = 'center';
            serialCell.style.gap = '5px';
            
            const serialInput = document.createElement('input');
            serialInput.type = 'text';
            serialInput.name = `${moduleType.toLowerCase()}_${i}_serial`;
            serialInput.placeholder = 'Enter or Scan serial';
            serialInput.required = true;
            serialInput.style.flex = '1';
            serialInput.style.minWidth = '0';
            serialInput.style.margin = '0';
            serialInput.style.height = '100%';
            serialInput.style.boxSizing = 'border-box';
            serialCell.appendChild(serialInput);
            
            const scanButton = document.createElement('button');
            scanButton.type = 'button';
            scanButton.textContent = 'Scan';
            scanButton.className = 'scan-button';
            scanButton.style.flex = 'none';
            scanButton.style.width = '60px';
            scanButton.style.height = '100%';
            scanButton.style.margin = '0';
            scanButton.style.padding = '0 5px';
            scanButton.style.boxSizing = 'border-box';
            scanButton.style.whiteSpace = 'nowrap';
            
            // Add input validation for serial numbers
            serialInput.addEventListener('input', function() {
                const value = this.value.trim();
                if (value && serialNumberTracker.checkDuplicate(value)) {
                    this.classList.add('duplicate-serial');
                    scanButton.classList.add('error');
                    scanButton.textContent = 'Duplicate!';
                } else {
                    this.classList.remove('duplicate-serial');
                    scanButton.classList.remove('error');
                    scanButton.textContent = 'Scan';
                }
            });

            scanButton.addEventListener('click', function() {
                if (typeof initiateScanForField === 'function') {
                    initiateScanForField(serialInput);
                } else {
                    console.error("initiateScanForField function not available");
                    if (typeof showCustomAlert === 'function') {
                        showCustomAlert("QR scanning functionality not available");
                    }
                }
            });
            serialCell.appendChild(scanButton);

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

    // --- Field Validation Function ---
    function validateAllModuleFields() {
        serialNumberTracker.clearAll();
        const sheets = sheetsContainer.getElementsByClassName('module-sheet');
        let emptyFieldsExist = false;
        let duplicateSerialsExist = false;
        let duplicateDetails = [];

        // First pass: Check for empty fields
        for (const sheet of sheets) {
            const tableRows = sheet.querySelectorAll('tbody tr');
            const moduleType = sheet.querySelector('.sheet-header h3')?.textContent || 'Unknown';

            for (let i = 0; i < tableRows.length; i++) {
                const row = tableRows[i];
                const moduleNo = i + 1;
                
                // Check Part Number (select)
                const partNoSelect = row.querySelector('select');
                if (!partNoSelect?.value) {
                    showCustomAlert(`Please select Part Number for ${moduleType}, Module ${moduleNo}`);
                    partNoSelect?.focus();
                    return false;
                }

                // Check other fields (Subrack, Slot, Serial)
                const inputs = row.querySelectorAll('input[type="text"]');
                for (const input of inputs) {
                    if (!input.value.trim()) {
                        let fieldName = '';
                        if (input.name.includes('subrack')) fieldName = 'Subrack No.';
                        else if (input.name.includes('slot')) fieldName = 'Slot No.';
                        else if (input.name.includes('serial')) fieldName = 'Serial No.';
                        
                        showCustomAlert(`Please fill in ${fieldName} for ${moduleType}, Module ${moduleNo}`);
                        input.focus();
                        return false;
                    }
                }
            }
        }

        // Second pass: Check for duplicate serials
        for (const sheet of sheets) {
            const tableRows = sheet.querySelectorAll('tbody tr');
            const moduleType = sheet.querySelector('.sheet-header h3')?.textContent || 'Unknown';

            for (let i = 0; i < tableRows.length; i++) {
                const row = tableRows[i];
                const moduleNo = i + 1;
                const serialInput = row.querySelector('input[name$="_serial"]');
                const serialValue = serialInput?.value.trim();

                if (serialValue) {
                    if (serialNumberTracker.checkDuplicate(serialValue)) {
                        const duplicateLocation = serialNumberTracker.getDuplicateLocation(serialValue);
                        duplicateDetails.push({
                            serial: serialValue,
                            location1: duplicateLocation,
                            location2: `${moduleType} Module ${moduleNo}`
                        });
                    } else {
                        serialNumberTracker.addSerial(serialValue, moduleType, moduleNo);
                    }
                }
            }
        }

        // Handle duplicates if found
        if (duplicateDetails.length > 0) {
            const duplicateMessages = duplicateDetails.map(d => 
                `Serial ${d.serial} appears in both ${d.location1} and ${d.location2}`
            );
            showCustomAlert(`Duplicate serial numbers found:\n${duplicateMessages.join('\n')}`);
            return false;
        }

        return true;
    }

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
            
            serialNumberTracker.clearAll(); // Clear any previous serial numbers
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
            serialNumberTracker.clearAll();
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
                        return; // Error message already shown by validate function
                    }
                    if (!userData || !userData.rtuSerial) {
                        showCustomAlert("User data became invalid after delay. Please try again.");
                        return;
                    }
                    generatePdfReport(userData);
                }, 350);
            } else {
                if (totalModules > 0) { 
                    if (!validateAllModuleFields()) {
                        return; // Error message already shown by validate function
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
            const imageUrl = 'Icon/GV.png';
            const imageFormat = 'PNG'; 
            const imgWidth = 15;
            const imgHeight = 15;
            const pageHeight = doc.internal.pageSize.getHeight();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 15;
            const xPosition = pageWidth - imgWidth - margin;
            const yPosition = 5;

            const addImageToCurrentPage = () => {
                try {
                    doc.addImage(imageUrl, imageFormat, xPosition, yPosition, imgWidth, imgHeight);
                } catch (imgError) {
                    console.error("Error adding image to page:", imgError);
                }
            };
            
            addImageToCurrentPage();

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
            doc.text('DF1725IED RTU Pre-FAT Report', pageWidth / 2, textStartY, { align: 'center' });
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
            doc.line(margin, lineY, pageWidth - margin, lineY);

            let currentY = lineY + 10;

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
                if (currentY > pageHeight - margin - 10) {
                    doc.addPage();
                    addImageToCurrentPage();
                    currentY = margin + (imgHeight > margin ? imgHeight + 5 : 0) + 10;
                }
                doc.text(info[0], margin, currentY);
                doc.text(info[1], margin + 40, currentY);
                currentY += 7;
            });

            currentY += 10;
            if (currentY > pageHeight - margin - 20) {
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
            
            if (currentY > pageHeight - margin - 50) {
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
                didDrawPage: function(data) {
                    if (data.pageNumber > 1) {
                        addImageToCurrentPage();
                    }
                }
            });

            const moduleSectionStartY = margin + (imgHeight > margin ? imgHeight + 5 : 0) + 10;

            if (diCount > 0) {
                doc.addPage();
                addImageToCurrentPage();
                addModuleSection(doc, 'DI', moduleSectionStartY);
            }
            if (doCount > 0) {
                doc.addPage();
                addImageToCurrentPage();
                addModuleSection(doc, 'DO', moduleSectionStartY);
            }
            if (aiCount > 0) {
                doc.addPage();
                addImageToCurrentPage();
                addModuleSection(doc, 'AI', moduleSectionStartY);
            }
            if (aoCount > 0) {
                doc.addPage();
                addImageToCurrentPage();
                addModuleSection(doc, 'AO', moduleSectionStartY);
            }

            const totalPages = doc.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
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

    // Add CSS for visual feedback
    const style = document.createElement('style');
    style.textContent = `
        .duplicate-serial {
            border: 2px solid red !important;
            background-color: #ffeeee !important;
        }
        .scan-button.error {
            background-color: #ff3333 !important;
            color: white !important;
        }
        input:invalid {
            border-color: #ff9999 !important;
        }
    `;
    document.head.appendChild(style);
});