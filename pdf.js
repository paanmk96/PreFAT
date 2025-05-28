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
                showCustomAlert("Error: Could not add company logo to the page. Check image path and format.");
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
            didDrawPage: function (data) {
                if (data.pageNumber > 1 || !data.doc.internal.getCurrentPageInfo().pageContext.isFirstPageAddedByMe) {
                    data.doc.internal.getCurrentPageInfo().pageContext.isFirstPageAddedByMe = false;
                }
            }
        });

        const moduleSectionStartY = margin + (imgHeight > margin ? imgHeight + 5 : 0) + 10;

        if (diCount > 0) {
            doc.addPage();
            doc.internal.getCurrentPageInfo().pageContext.isFirstPageAddedByMe = true;
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