export interface Message {
    role: "user" | "assistant"
    content: string
  }
  
  export interface ChatRequestDTO {
    model: string
    messages: {
      role: string
      content: string
    }[]
    temperature: number
  }
  
  export interface ChatResponseDTO {
    choices: {
      message: {
        content: string
      }
    }[]
  }
  
  