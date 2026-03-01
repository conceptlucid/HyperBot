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

const config: Config = {
  apiKeys: {
    openai: process.env.OPENAI_API_KEY || '',
    anthropic: process.env.ANTHROPIC_API_KEY || '',
    google: process.env.GOOGLE_API_KEY || '',
    openrouter: process.env.OPENROUTER_API_KEY || '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'
  },
  defaultModel: process.env.DEFAULT_MODEL || 'openrouter/meta-llama/Llama-3.2-90B-Vision-Free'
}

// This is your personality and instructions
const SYSTEM_PROMPT = `You are HyperBot — a helpful AI assistant that works on the user's computer.

## Your Job

The user chats with you naturally. You figure out what they need and do it. Simple.

## How You Help

- **Find things** — Search files, emails, documents
- **Do tasks** — Send emails, create events, run commands
- **Answer questions** — Look up info, summarize, explain
- **Automate** — Chain actions together

## What You Can Do

You have tools to:
- Take screenshots
- Move/click the mouse
- Type text
- Run terminal commands
- Read/write files
- Get system info

## How You Work

1. Understand what the user wants
2. Break it into steps if needed
3. Do the work quietly
4. Tell them it's done (or ask if needed)

## Rules

- Be helpful but don't do anything harmful
- If something might be destructive, ask first
- Keep it simple — don't over-explain
- Stay friendly and casual
- When you run a command, tell them the result
- If you take a screenshot, describe what you see

## Important

The user just chats with you. They don't type commands. You're the interface between them and the computer.`

export async function chat(messages: Message[], model?: string): Promise<{
  response: string
}> {
  const selectedModel = model || config.defaultModel

  try {
    if (config.apiKeys.openrouter) {
      return await chatOpenRouter(messages, selectedModel.replace('openrouter/', ''), config.apiKeys.openrouter)
    } else if (config.apiKeys.openai) {
      return await chatOpenAI(messages, selectedModel.replace('openai/', ''), config.apiKeys.openai)
    } else if (config.apiKeys.anthropic) {
      return await chatAnthropic(messages, selectedModel.replace('anthropic/', ''), config.apiKeys.anthropic)
    } else {
      return await chatOpenRouter(messages, 'meta-llama/Llama-3.2-90B-Vision-Free', config.apiKeys.openrouter)
    }
  } catch (error: any) {
    return {
      response: `Hmm, something went wrong: ${error.message}. Try again?`
    }
  }
}

async function chatOpenRouter(messages: Message[], model: string, apiKey: string) {
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
    throw new Error(error)
  }

  const data = await response.json()
  return {
    response: data.choices[0]?.message?.content || 'Got it!'
  }
}

async function chatOpenAI(messages: Message[], model: string, apiKey: string) {
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
    response: data.choices[0]?.message?.content || 'Got it!'
  }
}

async function chatAnthropic(messages: Message[], model: string, apiKey: string) {
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
    max_tokens: 2048
  })

  return {
    response: response.content[0]?.type === 'text' ? response.content[0].text : 'Got it!'
  }
}

export function setApiKey(provider: string, key: string) {
  (config.apiKeys as any)[provider] = key
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
