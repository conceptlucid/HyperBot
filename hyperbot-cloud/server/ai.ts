import Anthropic from 'anthropic'
import { fetch } from 'undici'

interface Config {
  apiKeys: {
    openai: string
    anthropic: string
    google: string
    openrouter: string
    mistral: string
    perplexity: string
    cohere: string
    azure: string
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
    openrouter: process.env.OPENROUTER_API_KEY || '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',
    mistral: process.env.MISTRAL_API_KEY || '',
    perplexity: process.env.PERPLEXITY_API_KEY || '',
    cohere: process.env.COHERE_API_KEY || '',
    azure: process.env.AZURE_OPENAI_KEY || ''
  },
  defaultModel: process.env.DEFAULT_MODEL || 'openrouter/meta-llama/Llama-3.2-90B-Vision-Free'
}

// Available models
export const MODELS = {
  // OpenAI
  'openai/gpt-4o': { provider: 'openai', name: 'GPT-4o' },
  'openai/gpt-4o-mini': { provider: 'openai', name: 'GPT-4o Mini' },
  'openai/gpt-4-turbo': { provider: 'openai', name: 'GPT-4 Turbo' },
  'openai/gpt-3.5-turbo': { provider: 'openai', name: 'GPT-3.5 Turbo' },
  
  // Anthropic
  'anthropic/claude-3-5-sonnet': { provider: 'anthropic', name: 'Claude 3.5 Sonnet' },
  'anthropic/claude-3-opus': { provider: 'anthropic', name: 'Claude 3 Opus' },
  'anthropic/claude-3-haiku': { provider: 'anthropic', name: 'Claude 3 Haiku' },
  
  // Google
  'google/gemini-2.0-flash': { provider: 'google', name: 'Gemini 2.0 Flash' },
  'google/gemini-1.5-pro': { provider: 'google', name: 'Gemini 1.5 Pro' },
  'google/gemini-1.5-flash': { provider: 'google', name: 'Gemini 1.5 Flash' },
  
  // OpenRouter (many free models)
  'openrouter/meta-llama/Llama-3.2-90B-Vision-Free': { provider: 'openrouter', name: 'Llama 3.2 90B Vision (Free)' },
  'openrouter/google/gemma-2-9b-it:free': { provider: 'openrouter', name: 'Gemma 2 9B (Free)' },
  'openrouter/mistralai/Mistral-7B-Instruct-v0.2:free': { provider: 'openrouter', name: 'Mistral 7B (Free)' },
  'openrouter/NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO:free': { provider: 'openrouter', name: 'Nous Hermes (Free)' },
  'openrouter/openchat/openchat-7b:free': { provider: 'openrouter', name: 'OpenChat (Free)' },
  
  // Mistral
  'mistral/mistral-large': { provider: 'mistral', name: 'Mistral Large' },
  'mistral/mistral-medium': { provider: 'mistral', name: 'Mistral Medium' },
  'mistral/mistral-small': { provider: 'mistral', name: 'Mistral Small' },
  
  // Perplexity
  'perplexity/sonar-pro': { provider: 'perplexity', name: 'Sonar Pro' },
  'perplexity/sonar-small': { provider: 'perplexity', name: 'Sonar Small' },
  
  // Cohere
  'cohere/command-r-plus': { provider: 'cohere', name: 'Command R+' },
  'cohere/command-r': { provider: 'cohere', name: 'Command R' },
  
  // Azure OpenAI
  'azure/gpt-4o': { provider: 'azure', name: 'Azure GPT-4o' },
  'azure/gpt-35-turbo': { provider: 'azure', name: 'Azure GPT-3.5 Turbo' },
}

const SYSTEM_PROMPT = `You are HyperBot — a helpful AI assistant that works on the user's computer.

## Your Job

The user chats with you naturally. You figure out what they need and do it. Simple.

## How You Help

- Find things — Search files, emails, documents
- Do tasks — Send emails, create events, run commands
- Answer questions — Look up info, summarize, explain
- Automate — Chain actions together

## How You Work

1. Understand what the user wants
2. Break it into steps if needed
3. Do the work quietly
4. Tell them it's done

## Rules

- Be helpful but don't do anything harmful
- If something might be destructive, ask first
- Keep it simple — don't over-explain
- Stay friendly and casual`

export async function chat(messages: Message[], model?: string): Promise<{
  response: string
}> {
  const selectedModel = model || config.defaultModel
  const [provider] = selectedModel.split('/')

  try {
    switch (provider) {
      case 'openrouter':
        return await chatOpenRouter(messages, selectedModel.replace('openrouter/', ''), config.apiKeys.openrouter)
      case 'openai':
        return await chatOpenAI(messages, selectedModel.replace('openai/', ''), config.apiKeys.openai)
      case 'anthropic':
        return await chatAnthropic(messages, selectedModel.replace('anthropic/', ''), config.apiKeys.anthropic)
      case 'google':
        return await chatGoogle(messages, selectedModel.replace('google/', ''), config.apiKeys.google)
      case 'mistral':
        return await chatMistral(messages, selectedModel.replace('mistral/', ''), config.apiKeys.mistral)
      case 'perplexity':
        return await chatPerplexity(messages, selectedModel.replace('perplexity/', ''), config.apiKeys.perplexity)
      case 'cohere':
        return await chatCohere(messages, selectedModel.replace('cohere/', ''), config.apiKeys.cohere)
      case 'azure':
        return await chatAzure(messages, selectedModel.replace('azure/', ''), config.apiKeys.azure)
      default:
        // Default to OpenRouter
        return await chatOpenRouter(messages, 'meta-llama/Llama-3.2-90B-Vision-Free', config.apiKeys.openrouter)
    }
  } catch (error: any) {
    return { response: `Oops: ${error.message}. Try again?` }
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
      model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.filter(m => m.role !== 'system')],
      temperature: 0.7
    })
  })
  
  if (!response.ok) throw new Error(await response.text())
  const data = await response.json()
  return { response: data.choices[0]?.message?.content || 'Got it!' }
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
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.filter(m => m.role !== 'system')],
      temperature: 0.7
    })
  })
  
  const data = await response.json()
  return { response: data.choices[0]?.message?.content || 'Got it!' }
}

async function chatAnthropic(messages: Message[], model: string, apiKey: string) {
  const anthropic = new Anthropic({ apiKey })
  const response = await anthropic.messages.create({
    model: model || 'claude-3-5-sonnet-20241022',
    system: SYSTEM_PROMPT,
    messages: messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
    max_tokens: 2048
  })
  return { response: response.content[0]?.type === 'text' ? response.content[0].text : 'Got it!' }
}

async function chatGoogle(messages: Message[], model: string, apiKey: string) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, parts: [{ text: m.content }] })),
      systemInstruction: { role: 'system', parts: [{ text: SYSTEM_PROMPT }] }
    })
  })
  
  const data = await response.json()
  return { response: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Got it!' }
}

async function chatMistral(messages: Message[], model: string, apiKey: string) {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'mistral-large-latest',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.filter(m => m.role !== 'system')],
      temperature: 0.7
    })
  })
  
  const data = await response.json()
  return { response: data.choices[0]?.message?.content || 'Got it!' }
}

async function chatPerplexity(messages: Message[], model: string, apiKey: string) {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'sonar-pro',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.filter(m => m.role !== 'system')]
    })
  })
  
  const data = await response.json()
  return { response: data.choices[0]?.message?.content || 'Got it!' }
}

async function chatCohere(messages: Message[], model: string, apiKey: string) {
  const response = await fetch('https://api.cohere.ai/v1/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'command-r-plus',
      messages: messages.filter(m => m.role !== 'system'),
      system: SYSTEM_PROMPT
    })
  })
  
  const data = await response.json()
  return { response: data.text || 'Got it!' }
}

async function chatAzure(messages: Message[], model: string, apiKey: string) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT || ''
  const response = await fetch(`${endpoint}/openai/deployments/${model}/chat/completions?api-version=2024-02-15-preview`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.filter(m => m.role !== 'system')],
      temperature: 0.7
    })
  })
  
  const data = await response.json()
  return { response: data.choices[0]?.message?.content || 'Got it!' }
}

export function setApiKey(provider: string, key: string) {
  (config.apiKeys as any)[provider] = key
}

export function getConfig() {
  return {
    models: MODELS,
    available: Object.entries(MODELS).filter(([_, v]) => (config.apiKeys as any)[v.provider]).map(([k, v]) => ({ id: k, ...v })),
    hasOpenAI: !!config.apiKeys.openai,
    hasAnthropic: !!config.apiKeys.anthropic,
    hasGoogle: !!config.apiKeys.google,
    hasOpenRouter: !!config.apiKeys.openrouter,
    hasMistral: !!config.apiKeys.mistral,
    hasPerplexity: !!config.apiKeys.perplexity,
    hasCohere: !!config.apiKeys.cohere,
    hasAzure: !!config.apiKeys.azure,
    defaultModel: config.defaultModel
  }
}
