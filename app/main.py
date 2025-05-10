from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import sqlite3
import os

app = FastAPI()

# Serve static files (e.g., CSS, JS, images) from the "static" directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Serve the index.html file at the root URL
@app.get("/")
def read_root():
    """Serve the index.html file."""
    index_path = os.path.join(os.path.dirname(__file__), "../static/index.html")
    return FileResponse(index_path)

# Helper function to get database connection
def get_db_connection():
    """Establish a connection to the SQLite database."""
    db_path = os.path.join(os.path.dirname(__file__), "../database.db")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

# Endpoint to fetch both column names and data from a specified table
@app.get("/api/{table_name}")
def get_table_data_with_columns(table_name: str):
    """Fetch both column names and all records from the specified table."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the table exists
        cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' does not exist.")

        # Fetch all records and column names
        cursor.execute(f"SELECT * FROM {table_name}")
        records = cursor.fetchall()
        column_names = [description[0] for description in cursor.description]  # Get column names
        conn.close()

        # Return both column names and data
        return {"columns": column_names, "data": [dict(record) for record in records]}
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

# Generic endpoint to update a record in any table
@app.put("/api/{table_name}/{record_id}")
async def update_record(table_name: str, record_id: int, request: Request):
    """Update a record in the specified table."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the table exists
        cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' does not exist.")

        # Get the updated data from the request body
        updated_data = await request.json()
        print("Updated data received:", updated_data)  # Debugging log

        # Build the SQL query dynamically
        columns = ", ".join([f"{key} = ?" for key in updated_data.keys()])
        values = list(updated_data.values())
        values.append(record_id)  # Add the record ID to the values list

        query = f"UPDATE {table_name} SET {columns} WHERE id = ?"
        print("Generated SQL query:", query)  # Debugging log
        print("Values:", values)  # Debugging log

        cursor.execute(query, values)
        conn.commit()
        conn.close()

        return {"message": f"Record with ID {record_id} in table '{table_name}' updated successfully."}
    except sqlite3.Error as e:
        print("Database error:", e)  # Debugging log
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@app.post("/api/{table_name}")
async def add_record(table_name: str, request: Request):
    """Add a new record to the specified table."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the table exists
        cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' does not exist.")

        # Get the new data from the request body
        new_data = await request.json()
        print("New data received:", new_data)  # Debugging log

        # Exclude the 'id' column if it is auto-incremented
        if "id" in new_data and not new_data["id"]:
            del new_data["id"]

        # Build the SQL query dynamically
        columns = ", ".join(new_data.keys())
        placeholders = ", ".join(["?" for _ in new_data.values()])
        values = list(new_data.values())

        query = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"

        cursor.execute(query, values)
        conn.commit()
        conn.close()

        return {"message": f"New record added to table '{table_name}' successfully."}
    except sqlite3.Error as e:
        print("Database error:", e)  # Log the error
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@app.get("/api/details/{master_id}")
def get_details(master_id: int):
    """Fetch both column names and detail records for a given master record ID."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch detail records for the given master ID
        cursor.execute("SELECT * FROM details WHERE master_id = ?", (master_id,))
        records = cursor.fetchall()
        column_names = [description[0] for description in cursor.description]  # Get column names
        conn.close()

        # Return both column names and data
        return {"columns": column_names, "data": [dict(record) for record in records]}
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")