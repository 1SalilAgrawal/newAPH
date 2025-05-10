// Function to load Reports content
function loadReportsContent() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h1>Reports</h1>
        <p>Reports will be dynamically loaded here.</p>
    `;
    fetchReports(); // Fetch and display reports
}

// Function to fetch and display reports
async function fetchReports() {
    try {
        const response = await fetch("/api/reports");
        if (!response.ok) {
            throw new Error(`Failed to fetch reports: ${response.statusText}`);
        }
        const reports = await response.json();
        console.log("Reports fetched:", reports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        alert("Failed to load reports. Please check the console for details.");
    }
}