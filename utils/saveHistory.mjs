import fs from 'node:fs/promises'

// Method to save the chat history to a file
async function saveHistory(history) {
    try {
        // Convert the history object into a string with JSON formatting
        const historyString = JSON.stringify(history, null, 2)
        // Write the string to 'memory.json' with UTF-8 encoding
        await fs.writeFile('memory.json', historyString, 'utf8')
    } catch (error) {
        // If an error occurs during the file write process, log the error
        console.error('Error when saving the history:', error)
    }
}
export default saveHistory
