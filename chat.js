import { openai } from './openai.js'
import readline from 'node:readline'
import fs from 'node:fs/promises'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

const formatMessage = (userInput) => ({ role: 'user', content: userInput })

async function loadHistory() {
    try {
        const data = await fs.readFile('memory.json', 'utf8')
        return JSON.parse(data)
    } catch (error) {
        console.error('Error when loading the history:', error)
        return [] // Return empty array if file cannot be read
    }
}

async function saveHistory(history) {
    try {
        await fs.writeFile('memory.json', JSON.stringify(history, null, 2), 'utf8')
    } catch (error) {
        console.error('Error when saving the history:', error)
    }
}

const newMessage = async (message) => {
    const history = await loadHistory()
    const stream = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [...history, message],
        temperature: 1,
        stream: true,
    })

    let lastResponseContent = ''
    for await (const chunk of stream) {
        if (chunk.choices && chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content) {
            const content = chunk.choices[0].delta.content
            process.stdout.write(content)
            lastResponseContent += content
        }
    }

    if (lastResponseContent) {
        const responseMessage = { role: 'assistant', content: lastResponseContent }
        history.push(message, responseMessage)
        await saveHistory(history) // Save the updated history
        return responseMessage
    }
}

//
const chat = async () => {
    console.log('The conversation has started. Write "exit" to end it.')
    const history = await loadHistory() // Load the initial history

    const start = () => {
        rl.question('Du: ', async (userInput) => {
            if (userInput.toLowerCase() === 'exit') {
                rl.close()
                return
            }
            const userMessage = formatMessage(userInput)

            const response = await newMessage(userMessage)
            if (response) {
                console.log(`\n`)
            }

            start()
        })
    }

    start()
}

chat()
