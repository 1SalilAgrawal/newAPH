import sqlite3

def reset_database():
    # Connect to the database
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    # Drop existing tables if they exist
    cursor.execute("DROP TABLE IF EXISTS details")
    cursor.execute("DROP TABLE IF EXISTS master")

    # Create the master table
    cursor.execute("""
        CREATE TABLE master (
            accNo INTEGER PRIMARY KEY,
            accName TEXT NOT NULL UNIQUE,
            unit TEXT,
            GSTRate REAL,
            opBal REAL,
            category TEXT,
            subCategory TEXT
        )
    """)

    # Create the details table
    cursor.execute("""
        CREATE TABLE details (
            sNO INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            docType TEXT,
            docNo TEXT,
            partyNo TEXT,
            itemNo TEXT,
            quantity REAL,
            rate REAL,
            amount REAL,
            FOREIGN KEY (partyNo) REFERENCES master (accName),
            FOREIGN KEY (itemNo) REFERENCES master (accName)
        )
    """)

    # Insert sample data into the master table
    master_data = [
        (1, "Party A", "Unit 1", 18.0, 1000.0, "Category 1", "Subcategory A"),
        (2, "Party B", "Unit 2", 12.0, 2000.0, "Category 2", "Subcategory B"),
        (3, "Party C", "Unit 3", 5.0, 1500.0, "Category 1", "Subcategory C"),
        (4, "Party D", "Unit 4", 18.0, 3000.0, "Category 3", "Subcategory D"),
        (5, "Party E", "Unit 5", 28.0, 2500.0, "Category 2", "Subcategory E"),
        (6, "Party F", "Unit 6", 18.0, 1200.0, "Category 1", "Subcategory F"),
        (7, "Party G", "Unit 7", 12.0, 1800.0, "Category 3", "Subcategory G"),
        (8, "Party H", "Unit 8", 5.0, 2200.0, "Category 2", "Subcategory H"),
        (9, "Party I", "Unit 9", 18.0, 1700.0, "Category 1", "Subcategory I"),
        (10, "Party J", "Unit 10", 28.0, 1400.0, "Category 3", "Subcategory J")
    ]
    cursor.executemany("""
        INSERT INTO master (accNo, accName, unit, GSTRate, opBal, category, subCategory)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, master_data)

    # Insert sample data into the details table
    details_data = [
        ("2025-05-01", "Invoice", "INV001", "Party A", "Party B", 10, 100.0, 1000.0),
        ("2025-05-02", "Invoice", "INV002", "Party B", "Party C", 5, 200.0, 1000.0),
        ("2025-05-03", "Invoice", "INV003", "Party C", "Party D", 8, 150.0, 1200.0),
        ("2025-05-04", "Invoice", "INV004", "Party D", "Party E", 12, 250.0, 3000.0),
        ("2025-05-05", "Invoice", "INV005", "Party E", "Party F", 6, 300.0, 1800.0),
        ("2025-05-06", "Invoice", "INV006", "Party F", "Party G", 15, 100.0, 1500.0),
        ("2025-05-07", "Invoice", "INV007", "Party G", "Party H", 10, 120.0, 1200.0),
        ("2025-05-08", "Invoice", "INV008", "Party H", "Party I", 20, 80.0, 1600.0),
        ("2025-05-09", "Invoice", "INV009", "Party I", "Party J", 25, 90.0, 2250.0),
        ("2025-05-10", "Invoice", "INV010", "Party J", "Party A", 30, 70.0, 2100.0),
        ("2025-05-11", "Invoice", "INV011", "Party A", "Party B", 10, 100.0, 1000.0),
        ("2025-05-12", "Invoice", "INV012", "Party B", "Party C", 5, 200.0, 1000.0),
        ("2025-05-13", "Invoice", "INV013", "Party C", "Party D", 8, 150.0, 1200.0),
        ("2025-05-14", "Invoice", "INV014", "Party D", "Party E", 12, 250.0, 3000.0),
        ("2025-05-15", "Invoice", "INV015", "Party E", "Party F", 6, 300.0, 1800.0),
        ("2025-05-16", "Invoice", "INV016", "Party F", "Party G", 15, 100.0, 1500.0),
        ("2025-05-17", "Invoice", "INV017", "Party G", "Party H", 10, 120.0, 1200.0),
        ("2025-05-18", "Invoice", "INV018", "Party H", "Party I", 20, 80.0, 1600.0),
        ("2025-05-19", "Invoice", "INV019", "Party I", "Party J", 25, 90.0, 2250.0),
        ("2025-05-20", "Invoice", "INV020", "Party J", "Party A", 30, 70.0, 2100.0)
    ]
    cursor.executemany("""
        INSERT INTO details (date, docType, docNo, partyNo, itemNo, quantity, rate, amount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, details_data)

    # Commit changes and close the connection
    conn.commit()
    conn.close()
    print("Database reset and populated successfully.")

# Run the script
if __name__ == "__main__":
    reset_database()