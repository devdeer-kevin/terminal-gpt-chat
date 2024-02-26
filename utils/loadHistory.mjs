import fs from 'node:fs/promises'

// Method to load the chat history from a file
async function loadHistory() {
    try {
        // Attempt to read the 'memory.json' file with UTF-8 encoding
        const data = await fs.readFile('memory.json', 'utf8')
        // Parse the JSON data into an object and return it
        return JSON.parse(data)
    } catch (error) {
        // If an error occurs (e.g., file not found), log the error
        console.error('Error when loading the history:', error)
        // Return an empty array to signify no prior history
        return []
    }
}

export default loadHistory
