async function loadMasterChildContent() {
    const { columns: masterColumns, data: masterData } = await fetchTableData("master"); // Fetch master records
    const contentTableHead = document.querySelector("#contentTable thead");
    const contentTableBody = document.querySelector("#contentTable tbody");

    // Clear existing rows and headers
    clearTable(contentTableHead, contentTableBody);

    // Populate master table headers dynamically
    populateTableHeaders(contentTableHead, ["Expand", ...masterColumns]);

    // Populate master rows dynamically
    masterData.forEach(record => {
        const masterRow = createMasterRow(record, masterColumns);
        const detailRow = createDetailPlaceholderRow(masterColumns.length);

        contentTableBody.appendChild(masterRow);
        contentTableBody.appendChild(detailRow);
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
            <button class="expand-btn" data-master-id="${record.id}">+</button>
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
            const masterId = event.target.getAttribute("data-master-id");
            const detailRow = event.target.closest("tr").nextElementSibling;

            if (detailRow.style.display === "none") {
                await expandDetailRow(masterId, detailRow, event.target);
            } else {
                collapseDetailRow(detailRow, event.target);
            }
        });
    });
}

// Helper function to expand a detail row
async function expandDetailRow(masterId, detailRow, button) {
    const { columns: detailColumns, data: detailData } = await fetchTableData(`details/${masterId}`);
    const detailTableHead = detailRow.querySelector(".detail-table thead");
    const detailTableBody = detailRow.querySelector(".detail-table tbody");

    // Populate detail table headers dynamically
    populateTableHeaders(detailTableHead, detailColumns);

    // Populate detail rows dynamically
    detailTableBody.innerHTML = detailData.map(detail => `
        <tr>
            ${detailColumns.map(col => `<td>${detail[col] || ""}</td>`).join("")}
        </tr>
    `).join("");

    detailRow.style.display = ""; // Show the detail row
    button.textContent = "-"; // Change button to collapse
}

// Helper function to collapse a detail row
function collapseDetailRow(detailRow, button) {
    detailRow.style.display = "none"; // Hide the detail row
    button.textContent = "+"; // Change button to expand
}
