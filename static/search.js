function filterTable() {
    const searchValue = document.getElementById('searchBar').value.toLowerCase();
    const rows = document.querySelectorAll('#tableBody tr');
  
    rows.forEach(row => {
      const cells = Array.from(row.cells);
      const rowText = cells.map(cell => cell.textContent.toLowerCase()).join(' ');
      if (rowText.includes(searchValue)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }