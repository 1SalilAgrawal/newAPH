// Function to handle navigation clicks and dynamically load content
document.querySelectorAll('#sidebar a').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const contentId = event.target.getAttribute('data-content');
        loadContent(contentId);
    });

    // Hide all buttons by default
    hideAllButtons();
});

// Function to dynamically load content based on the menu item
function loadContent(contentId) {
    const content = document.getElementById("content");

    // Hide all buttons by default
    hideAllButtons();

    if (contentId === 'master') {
        loadScript('/static/master.js', () => {
            console.log('Master script loaded');
            loadMasterContent();

            // Show the button container for the master page
            showButtonContainer();
        });
    } else if (contentId === 'details') {
        loadScript('/static/details.js', () => {
            console.log('Details script loaded');
            loadDetailsContent();

            // Show the button container for the details page
            showButtonContainer();
        });
    } else if (contentId === 'reports') {
        loadScript('/static/reports.js', () => {
            console.log('Reports script loaded');
            loadReportsContent();
        });
    } else if (contentId === 'master_child') {
        loadScript('/static/master_child.js', () => {
            console.log('Master Child script loaded');
            loadMasterChildContent();
        });
    } else {
        content.innerHTML = `<h1>404</h1><p>Content not found.</p>`;
    }
}

// Utility function to dynamically load a JavaScript file
function loadScript(src, callback) {
    if (document.querySelector(`script[src="${src}"]`)) {
        callback();
        return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.body.appendChild(script);
}

// Generic function to fetch and display table records dynamically
async function fetchTableData(tableName) {
    try {
        const response = await fetch(`/api/${tableName}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch records for table ${tableName}: ${response.statusText}`);
        }
        const { columns, data } = await response.json();
        return { columns, data };
    } catch (error) {
        console.error(`Error fetching or rendering table ${tableName}:`, error);
        alert(`Failed to load data for table ${tableName}. Please check the console for details.`);
        return { columns: [], data: [] };
    }
}

// Function to populate an editable table dynamically
function populateEditableTable(columns, data, tableId, saveEndpoint) {
    const tableHead = document.querySelector(`#${tableId} thead`);
    const tableBody = document.querySelector(`#${tableId} tbody`);

    // Clear existing table content
    clearTable(tableHead, tableBody);

    // Populate table headers
    populateTableHeaders(tableHead, columns);

    // Populate table rows
    data.forEach(record => {
        const row = createEditableRow(record, columns);
        tableBody.appendChild(row);
    });

    // Assign save logic for both new and existing rows
    enableSaveButton(tableId, saveEndpoint);

    // Enable adding new rows
    enableAddNewRow(columns, tableId, saveEndpoint);
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

// Helper function to create an editable row
function createEditableRow(record, columns) {
    const row = document.createElement("tr");
    row.dataset.originalData = JSON.stringify(record); // Store original data for comparison

    row.innerHTML = columns.map(col => {
        if (col === "id") {
            // ID column is not editable
            return `<td>${record[col] || ""}</td>`;
        } else {
            // Other columns are editable
            return `<td contenteditable="plaintext-only">${record[col] || ""}</td>`;
        }
    }).join("");

    // Mark row as changed on input
    row.addEventListener("input", () => markRowAsChanged(row));
    return row;
}

// Function to enable adding new rows
function enableAddNewRow(columns, tableId, saveEndpoint) {
    const addButton = document.getElementById("addButton");
    if (!addButton) {
        console.error("Add button not found in the DOM.");
        return;
    }

    const newAddButton = addButton.cloneNode(true);
    addButton.parentNode.replaceChild(newAddButton, addButton);

    newAddButton.addEventListener("click", () => {
        const tableBody = document.querySelector(`#${tableId} tbody`);
        const newRow = createNewRow(columns);
        tableBody.appendChild(newRow);
    });
}

// Helper function to create a new row
function createNewRow(columns) {
    const newRow = document.createElement("tr");
    newRow.innerHTML = columns.map(col => {
        if (col === "id") {
            // Leave the ID column empty for new rows
            return `<td></td>`;
        } else {
            return `<td contenteditable="plaintext-only"></td>`;
        }
    }).join("");
    newRow.classList.add("new");
    return newRow;
}

// Function to mark a row as changed
function markRowAsChanged(row) {
    if (!row.classList.contains("new")) { // Do not mark new rows as changed
        row.classList.add("changed");
    }
}

// Function to enable the save button functionality
function enableSaveButton(tableId, saveEndpoint) {
    const saveButton = document.getElementById("saveButton");
    saveButton.style.display = "";

    const newSaveButton = saveButton.cloneNode(true);
    saveButton.parentNode.replaceChild(newSaveButton, saveButton);

    newSaveButton.addEventListener("click", async () => {
        const tableBody = document.querySelector(`#${tableId} tbody`);

        // Handle new rows
        const newRows = Array.from(tableBody.querySelectorAll("tr.new")); // Only get new rows
        const newData = newRows.map(row => extractRowData(row, tableId));

        // Handle changed rows
        const changedRows = Array.from(tableBody.querySelectorAll("tr.changed")); // Only get changed rows
        const updatedData = changedRows.map(row => extractRowData(row, tableId));

        console.log("New data to save:", newData); // Debugging log
        console.log("Updated data to save:", updatedData); // Debugging log

        try {
            // Save new rows
            for (const record of newData) {
                const response = await fetch(saveEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(record),
                });

                if (!response.ok) {
                    throw new Error(`Failed to save new record: ${response.statusText}`);
                }
            }

            // Save changed rows
            for (const record of updatedData) {
                if (!record.id) {
                    console.error("Missing ID for record:", record);
                    continue; // Skip rows without an ID
                }

                const response = await fetch(`${saveEndpoint}/${record.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(record),
                });

                if (!response.ok) {
                    throw new Error(`Failed to save record with ID ${record.id}: ${response.statusText}`);
                }
            }

            displayMessage("Changes saved successfully!", "success");
            loadContent(getContentIdFromEndpoint(saveEndpoint));
        } catch (error) {
            console.error("Error saving records:", error);
            displayMessage("Failed to save records. Please check the console for details.", "error");
        }
    });
}

// Helper function to extract row data
function extractRowData(row, tableId) {
    const cells = Array.from(row.querySelectorAll("td"));
    const record = {};
    const headers = Array.from(document.querySelectorAll(`#${tableId} thead th`));
    headers.forEach((header, index) => {
        record[header.textContent] = cells[index].textContent.trim();
    });
    return record;
}

// Helper function to derive contentId from saveEndpoint
function getContentIdFromEndpoint(saveEndpoint) {
    return saveEndpoint.split("/").pop();
}

// Function to display a message in the bottom section
function displayMessage(message, type) {
    const messageContainer = document.getElementById("messageContainer");
    if (!messageContainer) {
        console.error("Message container not found in the DOM.");
        return;
    }

    messageContainer.textContent = message;
    messageContainer.className = type === "success" ? "message-success" : "message-error";

    setTimeout(() => {
        messageContainer.textContent = "";
        messageContainer.className = "";
    }, 5000);
}

// Function to hide all buttons
function hideAllButtons() {
    const buttonContainer = document.querySelector(".button-container"); // Target the button container
    if (buttonContainer) {
        buttonContainer.style.display = "none"; // Hide the container
    }
}

// Function to show the button container
function showButtonContainer() {
    const buttonContainer = document.querySelector(".button-container"); // Target the button container
    if (buttonContainer) {
        buttonContainer.style.display = ""; // Show the container
    }
}
