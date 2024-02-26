import fs from 'node:fs/promises'

// Method to reset the chat history memory to its initial state
const resetMemoryFile = async () => {
    // Path to memory.json
    const filePath = './memory.json'

    try {
        // Read the file asynchronously with await
        const data = await fs.readFile(filePath, 'utf8')

        // Parse the JSON data
        const memoryData = JSON.parse(data)

        // Keep only the first object in the array
        const newData = memoryData.length > 0 ? [memoryData[0]] : []

        // Remove the placeholder and proceed with writing the updated memory to the file
        await fs.writeFile(filePath, JSON.stringify(newData, null, 2))

        console.log("Memory reset complete! Let's start over - What's next?")
    } catch (err) {
        console.error('An error occured:', err)
    }
}

export default resetMemoryFile
