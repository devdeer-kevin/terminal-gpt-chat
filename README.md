# Node.js Console Chatbot with OpenAI

This repository contains a Node.js console application designed to facilitate interactive conversations using OpenAI's GPT-4. It leverages the OpenAI API to create dynamic and intelligent responses based on user input, maintaining a conversational history to provide context for each interaction.

## Features

-   **Dynamic Conversation Handling**: Utilizes OpenAI's GPT-4 model for generating responses, streamed in chunks for real-time interaction.
-   **Persistent History**: Conversations are stored and managed, allowing for context-aware interactions.
-   **Customizable Responses**: Easily adaptable script for personalized conversation flows.
-   **Privacy-Focused**: Instructions are provided to ensure conversation data is kept local and private.

## Getting Started

### Prerequisites

-   Node.js installed on your machine.
-   An OpenAI API key.

### Installation

1. Clone the repository to your local machine.
2. Install the necessary dependencies by running `npm install`.
3. Create a `.env` file at the root of your project and add your OpenAI API key as `OPENAI_API_KEY=<Your-API-Key>`.
4. Manually create a file named `memory.json` in the root directory of your project. This file should contain an array with an initial `system` object, for example: `[{"role": "system", "content": "Your system message"}]`. This file is used to locally store the conversation history.
5. Add `memory.json` to your `.gitignore` to ensure privacy and data protection, as this file may contain personal conversation histories.

### Running the Chatbot

Execute `node chat.js` to start the chatbot. Engage in a conversation by typing your messages into the console.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or create an issue for any bugs or enhancements.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
