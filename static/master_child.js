async function loadMasterChildContent() {
    const contentTableHead = document.querySelector("#contentTable thead");
    const contentTableBody = document.querySelector("#contentTable tbody");

    // Clear existing rows and headers
    clearTable(contentTableHead, contentTableBody);

    const { columns: masterColumns, data: masterData } = 
                await Database.fetchTableData("master");
    populateTableHeaders(contentTableHead, ["Expand", ...masterColumns]);

    masterData.forEach(record => {
        const masterRow = createMasterRow(record, masterColumns);
        contentTableBody.appendChild(masterRow); // Only append the master row
    });

    // Attach event listeners to expand buttons
    attachExpandButtonListeners();
}

// Helper function to clear table headers and body
function clearTable(tableHead, tableBody) {
    tableHead.innerHTML = "";
    tableBody.innerHTML = "";
}

// Helper function to populate table headers
function populateTableHeaders(tableHead, columns) {
    tableHead.innerHTML = `
        <tr>
            ${columns.map(col => `<th>${col}</th>`).join("")}
        </tr>
    `;
}

// Helper function to create a master row
function createMasterRow(record, columns) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>
            <button class="expand-btn" data-master-id="${record.accName}">+</button>
        </td>
        ${columns.map(col => `<td>${record[col] || ""}</td>`).join("")}
    `;
    return row;
}

// Helper function to create a placeholder row for details
function createDetailPlaceholderRow(colspan) {
    const detailRow = document.createElement("tr");
    detailRow.classList.add("detail-row");
    detailRow.style.display = "none"; // Initially hidden
    detailRow.innerHTML = `
        <td colspan="${colspan + 1}">
            <table class="detail-table">
                <thead>
                    <!-- Detail headers will be dynamically populated -->
                </thead>
                <tbody>
                    <!-- Detail rows will be dynamically populated here -->
                </tbody>
            </table>
        </td>
    `;
    return detailRow;
}

// Helper function to attach event listeners to expand buttons
function attachExpandButtonListeners() {
    document.querySelectorAll(".expand-btn").forEach(button => {
        button.addEventListener("click", async (event) => {
            const masterAccName = event.target.getAttribute("data-master-id");
            const masterRow = event.target.closest("tr");

            // Check if the next sibling is a detail row
            let detailRow = masterRow.nextElementSibling;
            if (detailRow && detailRow.classList.contains("detail-row")) {
                if (detailRow.style.display !== "none") {
                    collapseDetailRow(detailRow, event.target);
                } else {
                    await expandDetailRow(masterAccName, masterRow, event.target);
                }
            } else {
                // Create and expand the detail row if it doesn't exist
                await expandDetailRow(masterAccName, masterRow, event.target);
            }
        });
    });
}

// Helper function to expand a detail row
async function expandDetailRow(masterAccName, masterRow, button) {
    // Check if the detail row already exists
    let detailRow = masterRow.nextElementSibling;
    if (!detailRow || !detailRow.classList.contains("detail-row")) {
        // Use the helper function to create the detail row
        detailRow = createDetailPlaceholderRow(masterRow.children.length);
        masterRow.parentNode.insertBefore(detailRow, masterRow.nextElementSibling);
    }

    // Fetch detail data for the specific masterAccName
    const { columns: detailColumns, data: detailData } = await Database.fetchTableData(`details/${masterAccName}`);

    // Populate the detail table with the filtered data
    populateDetailTable(detailRow, detailColumns, detailData);

    detailRow.style.display = ""; // Show the detail row
    button.textContent = "-"; // Change button to collapse
}

// Helper function to collapse a detail row
function collapseDetailRow(detailRow, button) {
    detailRow.style.display = "none"; // Hide the detail row
    button.textContent = "+"; // Change button to expand
}

// Helper function to create the detail table structure
function createDetailTable(detailRow, masterId) {
    detailRow.innerHTML = `
        <td colspan="100%">
            <table class="detail-table">
                <thead>
                    <!-- Detail headers will be dynamically populated -->
                </thead>
                <tbody>
                    <!-- Detail rows will be dynamically populated -->
                </tbody>
            </table>
        </td>
    `;
}

// Helper function to populate the detail table
function populateDetailTable(detailRow, detailColumns, detailData) {
    const detailTableHead = detailRow.querySelector(".detail-table thead");
    const detailTableBody = detailRow.querySelector(".detail-table tbody");

    // Populate detail table headers
    populateTableHeaders(detailTableHead, detailColumns);

    // Populate detail table rows
    detailTableBody.innerHTML = detailData.map(detail => `
        <tr>
            ${detailColumns.map(col => `<td>${detail[col] || ""}</td>`).join("")}
        </tr>
    `).join("");
}
