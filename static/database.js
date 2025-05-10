// Create a global namespace for database-related functions
const Database = {
    async fetchTableData(tableName) {
        try {
            const response = await fetch(`/api/${tableName}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch records for table ${tableName}: ${response.statusText}`);
            }
            const { columns = [], data = [] } = await response.json();
            return { columns, data };
        } catch (error) {
            console.error(`Error fetching or rendering table ${tableName}:`, error);
            alert(`Failed to load data for table ${tableName}. Please check the console for details.`);
            return { columns: [], data: [] };
        }
    },

    async saveNewData(endpoint, data) {
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`Failed to save new data: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error saving new data:", error);
            throw error;
        }
    },

    async updateData(endpoint, id, data) {
        try {
            const response = await fetch(`${endpoint}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`Failed to update data with ID ${id}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error updating data with ID ${id}:`, error);
            throw error;
        }
    },

    async deleteData(endpoint, id) {
        try {
            const response = await fetch(`${endpoint}/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error(`Failed to delete data with ID ${id}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error deleting data with ID ${id}:`, error);
            throw error;
        }
    },
};