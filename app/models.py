import sqlite3

def init_db():
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS master (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            category TEXT,
            description TEXT,
            created_at TEXT,
            extra_field TEXT
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            master_id INTEGER,
            item_name TEXT,
            quantity INTEGER,
            notes TEXT,
            updated_at TEXT,
            FOREIGN KEY (master_id) REFERENCES master (id)
        )
    """)
    conn.commit()
    conn.close()
