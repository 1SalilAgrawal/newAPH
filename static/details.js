// Function to load Details Database content
async function loadDetailsContent() {
    const contentTitle = document.getElementById('contentTitle');
    contentTitle.textContent = "Details Database"; // Set the title for the content section

    // Fetch and display details records using the generic fetchTableData function
    const { columns, data } = await Database.fetchTableData("details");

    // Populate the table dynamically and make it editable
    populateEditableTable(columns, data, "contentTable", "/api/details");

    // Show the button container for the details page
    showButtonContainer();
}