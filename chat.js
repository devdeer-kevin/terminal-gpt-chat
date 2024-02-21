import { openai } from './openai.js'
import readline from 'node:readline'
import fs from 'node:fs/promises'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

const formatMessage = (userInput) => ({ role: 'user', content: userInput })

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

// Method to send a new message to the chat completion API
const newMessage = async (message) => {
    // Load the chat history by calling the 'loadHistory' function
    const history = await loadHistory()
    // Create a new chat completion using the OpenAI API, passing the current chat history and the new message
    const stream = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview', // Specify the model to use
        messages: [...history, message], // Combine the history with the new message
        temperature: 1, // Set the temperature for randomness in the response
        stream: true, // Enable streaming of the response
    })

    // Initialize an empty string to accumulate the response content
    let lastResponseContent = ''
    // Asynchronously iterate over the stream of data from the OpenAI API
    for await (const chunk of stream) {
        // Check if the chunk has choices, and if the first choice has a delta with content
        if (chunk.choices && chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content) {
            // Extract the content from the delta
            const content = chunk.choices[0].delta.content
            // Write the content to the standard output (console)
            process.stdout.write(content)
            // Append the content to the 'lastResponseContent' string
            lastResponseContent += content
        }
    }

    // After the stream ends, check if there was any response content
    if (lastResponseContent) {
        // Create a response message object with the role 'assistant' and the accumulated content
        const responseMessage = { role: 'assistant', content: lastResponseContent }
        // Add both the user's message and the assistant's response to the history
        history.push(message, responseMessage)
        // Save the updated history by calling the 'saveHistory' function
        await saveHistory(history)
        // Return the response message object
        return responseMessage
    }
}

// Method to initiate the chat process
const chat = async () => {
    // Logs an initial message to the console to indicate the conversation has started
    console.log('The conversation has started. Write "exit" to end it.')

    // Defines the 'start' function that will be used to initiate each round of conversation
    const start = () => {
        // Prompts the user for input, using 'You: ' as the prompt message
        rl.question('You: ', async (userInput) => {
            // If the user types 'exit', the readline interface is closed and the function returns
            if (userInput.toLowerCase() === 'exit') {
                rl.close()
                return
            }
            // Formats the user input into a message object with 'user' role
            const userMessage = formatMessage(userInput)

            // Sends the formatted message to the OpenAI API and waits for the response
            const response = await newMessage(userMessage)
            // If a response is received, it logs an empty line to the console for readability
            if (response) {
                console.log(`\n`)
            }

            // Calls the 'start' function again to continue the conversation loop
            start()
        })
    }

    // Calls the 'start' function for the first time to begin the conversation
    start()
}

// Calls the 'chat' function to start the entire chat process
chat()
