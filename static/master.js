// Function to load Master Database content
async function loadMasterContent() {
    const contentTitle = document.getElementById('contentTitle');
    contentTitle.textContent = "Master Database"; // Set the title for the content section

    // Fetch and display master records using the generic fetchTableData function
    const { columns, data } = await fetchTableData("master");

    // Populate the table dynamically and make it editable
    populateEditableTable(columns, data, "contentTable", "/api/master");
}
