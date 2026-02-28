import Anthropic from 'anthropic'

interface Config {
  apiKeys: {
    openai: string
    anthropic: string
    google: string
    openrouter: string
  }
  defaultModel: string
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface Command {
  tool: string
  args: Record<string, any>
}

const config: Config = {
  apiKeys: {
    openai: process.env.OPENAI_API_KEY || '',
    anthropic: process.env.ANTHROPIC_API_KEY || '',
    google: process.env.GOOGLE_API_KEY || '',
    openrouter: process.env.OPENROUTER_API_KEY || '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'
  },
  defaultModel: process.env.DEFAULT_MODEL || 'openrouter/meta-llama/Llama-3.2-90B-Vision-Free'
}

const SYSTEM_PROMPT = `You are HyperBot, an AI assistant that helps control a remote computer.

You have access to these tools:
- screen.capture: Take a screenshot
- mouse.move x, y: Move mouse
- mouse.click button: Click (left, right, middle)
- keyboard.type text: Type text
- keyboard.hotkey keys: Press hotkey (e.g., "ctrl+c")
- terminal.run command: Run a terminal command
- files.read path: Read a file
- files.list path: List files in directory
- system.info: Get system information

When the user asks you to do something on the computer:
1. First explain what you're going to do
2. Run the appropriate command(s)
3. Report the result

Always be helpful and concise.`

export async function chat(messages: Message[], model?: string): Promise<{
  response: string
  commands?: Command[]
}> {
  const selectedModel = model || config.defaultModel
  const [provider, modelName] = selectedModel.split('/')

  try {
    if (provider === 'openrouter' && config.apiKeys.openrouter) {
      return await chatOpenRouter(messages, modelName || 'meta-llama/Llama-3.2-90B-Vision-Free', config.apiKeys.openrouter)
    } else if (provider === 'openai' && config.apiKeys.openai) {
      return await chatOpenAI(messages, modelName || 'gpt-4o', config.apiKeys.openai)
    } else if (provider === 'anthropic' && config.apiKeys.anthropic) {
      return await chatAnthropic(messages, modelName || 'claude-3-5-sonnet-20241022', config.apiKeys.anthropic)
    } else {
      // Default to OpenRouter with free model
      return await chatOpenRouter(messages, 'meta-llama/Llama-3.2-90B-Vision-Free', config.apiKeys.openrouter)
    }
  } catch (error: any) {
    return {
      response: `Error: ${error.message}`
    }
  }
}

async function chatOpenRouter(messages: Message[], model: string, apiKey: string): Promise<{
  response: string
  commands?: Command[]
}> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://hyperbot.com',
      'X-Title': 'HyperBot'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.filter(m => m.role !== 'system')
      ],
      temperature: 0.7
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter error: ${error}`)
  }

  const data = await response.json()
  return {
    response: data.choices[0]?.message?.content || 'No response'
  }
}

async function chatOpenAI(messages: Message[], model: string, apiKey: string): Promise<{
  response: string
  commands?: Command[]
}> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.filter(m => m.role !== 'system')
      ],
      temperature: 0.7
    })
  })

  const data = await response.json()
  return {
    response: data.choices[0]?.message?.content || 'No response'
  }
}

async function chatAnthropic(messages: Message[], model: string, apiKey: string): Promise<{
  response: string
  commands?: Command[]
}> {
  const anthropic = new Anthropic({ apiKey })
  
  const formattedMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'user' ? 'user' as const : 'assistant' as const,
      content: m.content
    }))

  const response = await anthropic.messages.create({
    model: model || 'claude-3-5-sonnet-20241022',
    system: SYSTEM_PROMPT,
    messages: formattedMessages,
    max_tokens: 1024
  })

  return {
    response: response.content[0]?.type === 'text' ? response.content[0].text : 'No response'
  }
}

export function setApiKey(provider: 'openai' | 'anthropic' | 'google' | 'openrouter', key: string) {
  config.apiKeys[provider] = key
}

export function getConfig() {
  return {
    hasOpenAI: !!config.apiKeys.openai,
    hasAnthropic: !!config.apiKeys.anthropic,
    hasGoogle: !!config.apiKeys.google,
    hasOpenRouter: !!config.apiKeys.openrouter,
    defaultModel: config.defaultModel
  }
}
