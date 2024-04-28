import { openai } from './openai.js'
import readline from 'node:readline'

import saveHistory from './utils/saveHistory.mjs'
import loadHistory from './utils/loadHistory.mjs'
import resetMemoryFile from './utils/resetMemoryFile.mjs'
import formatMessage from './utils/formatMessage.mjs'

// Create a readline interface to read user input from the console
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

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

// [beta] Method to create a new image using the OpenAI API
const newImage = async (message) => {
    // // Create a new image using the OpenAI API, passing the message as the prompt
    const response = await openai.images.generate({
        // Specify the model to use for image generation
        model: 'dall-e-3',
        // Pass the message as the prompt for the image generation
        prompt: message,
    })
    // Extract the image URL from the response and return it
    const imageUrl = response.data[0].url
    // Return the image URL
    return imageUrl
}

const chat = async () => {
    // Log a welcome message to the console
    console.log('The conversation has started. Write "[image] your image prompt", e.g. "[image] dog" to create an image. Write "reset" to start fresh or "exit" to end it.')
    // Method to process the user input and take appropriate actions
    const processUserInput = async (userInput) => {
        switch (userInput.toLowerCase()) {
            case 'exit':
                rl.close()
                break
            case 'reset':
                await resetMemoryFile()
                start()
                break
            default:
                // Check if the user input starts with '[image]' to send an image prompt to the API
                if (userInput.startsWith('[image]')) {
                    const imagePrompt = userInput.slice(7).trim()
                    const responseUrl = await newImage(imagePrompt)
                    console.log(responseUrl, '\n')
                } else {
                    // Otherwise, send the user input to the chat completion API
                    const userMessage = formatMessage(userInput)
                    const response = await newMessage(userMessage)
                    if (response) {
                        console.log(`\n`)
                    }
                }
                start()
        }
    }
    // Method to start the chat interface
    const start = () => {
        rl.question('You: ', (userInput) => processUserInput(userInput))
    }
    // Call the 'start' method to begin the chat interface
    start()
}
// Call the 'chat' method to start the conversation
chat()
