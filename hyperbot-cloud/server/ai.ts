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
    minimax: string
    kimi: string
    xai: string
    deepseek: string
    together: string
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
    azure: process.env.AZURE_OPENAI_KEY || '',
    minimax: process.env.MINIMAX_API_KEY || '',
    kimi: process.env.KIMI_API_KEY || '',
    xai: process.env.XAI_API_KEY || '',
    deepseek: process.env.DEEPSEEK_API_KEY || '',
    together: process.env.TOGETHER_API_KEY || ''
  },
  defaultModel: process.env.DEFAULT_MODEL || 'openrouter/meta-llama/Llama-3.2-90B-Vision-Free'
}

// Available models - all require API key except OpenRouter free models
export const MODELS = {
  // OpenAI (requires API key)
  'openai/gpt-4o': { provider: 'openai', name: 'GPT-4o', free: false },
  'openai/gpt-4o-mini': { provider: 'openai', name: 'GPT-4o Mini', free: false },
  'openai/gpt-4-turbo': { provider: 'openai', name: 'GPT-4 Turbo', free: false },
  'openai/gpt-4': { provider: 'openai', name: 'GPT-4', free: false },
  'openai/gpt-3.5-turbo': { provider: 'openai', name: 'GPT-3.5 Turbo', free: false },
  
  // Anthropic (requires API key)
  'anthropic/claude-3-5-sonnet': { provider: 'anthropic', name: 'Claude 3.5 Sonnet', free: false },
  'anthropic/claude-3-5-haiku': { provider: 'anthropic', name: 'Claude 3.5 Haiku', free: false },
  'anthropic/claude-3-opus': { provider: 'anthropic', name: 'Claude 3 Opus', free: false },
  'anthropic/claude-3-sonnet': { provider: 'anthropic', name: 'Claude 3 Sonnet', free: false },
  'anthropic/claude-3-haiku': { provider: 'anthropic', name: 'Claude 3 Haiku', free: false },
  
  // Google (requires API key)
  'google/gemini-2.0-flash-exp': { provider: 'google', name: 'Gemini 2.0 Flash Experimental', free: false },
  'google/gemini-2.0-flash': { provider: 'google', name: 'Gemini 2.0 Flash', free: false },
  'google/gemini-1.5-pro': { provider: 'google', name: 'Gemini 1.5 Pro', free: false },
  'google/gemini-1.5-flash': { provider: 'google', name: 'Gemini 1.5 Flash', free: false },
  'google/gemini-1.5-flash-8b': { provider: 'google', name: 'Gemini 1.5 Flash 8B', free: false },
  
  // OpenRouter - FREE models (no API key needed with default key)
  'openrouter/meta-llama/Llama-3.2-90B-Vision-Free': { provider: 'openrouter', name: 'Llama 3.2 90B Vision', free: true },
  'openrouter/meta-llama/Llama-3.2-70B-Free': { provider: 'openrouter', name: 'Llama 3.2 70B', free: true },
  'openrouter/meta-llama/Llama-3.1-70B-Instruct-Free': { provider: 'openrouter', name: 'Llama 3.1 70B', free: true },
  'openrouter/meta-llama/Llama-3.1-8B-Instruct-Free': { provider: 'openrouter', name: 'Llama 3.1 8B', free: true },
  'openrouter/google/gemma-2-27b-it:free': { provider: 'openrouter', name: 'Gemma 2 27B', free: true },
  'openrouter/google/gemma-2-9b-it:free': { provider: 'openrouter', name: 'Gemma 2 9B', free: true },
  'openrouter/mistralai/Mistral-7B-Instruct-v0.2:free': { provider: 'openrouter', name: 'Mistral 7B', free: true },
  'openrouter/NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO:free': { provider: 'openrouter', name: 'Nous Hermes 2', free: true },
  'openrouter/openchat/openchat-7b:free': { provider: 'openrouter', name: 'OpenChat 7B', free: true },
  'openrouter/qwen/Qwen2-72B-Instruct:free': { provider: 'openrouter', name: 'Qwen 2 72B', free: true },
  'openrouter/01-ai/Yi-1.5-34B-Chat:free': { provider: 'openrouter', name: 'Yi 1.5 34B', free: true },
  'openrouter/facebook/llama-3.1-70b-instruct:free': { provider: 'openrouter', name: 'Llama 3.1 70B', free: true },
  // OpenRouter - Premium (requires API key)
  'openrouter/openai/gpt-4o': { provider: 'openrouter', name: 'GPT-4o', free: false },
  'openrouter/openai/gpt-4o-mini': { provider: 'openrouter', name: 'GPT-4o Mini', free: false },
  'openrouter/anthropic/claude-3.5-sonnet': { provider: 'openrouter', name: 'Claude 3.5 Sonnet', free: false },
  'openrouter/google/gemini-1.5-pro': { provider: 'openrouter', name: 'Gemini 1.5 Pro', free: false },
  'openrouter/meta-llama/Llama-3.3-70B-Instruct': { provider: 'openrouter', name: 'Llama 3.3 70B', free: false },
  'openrouter/qwen/Qwen2.5-72B-Instruct': { provider: 'openrouter', name: 'Qwen 2.5 72B', free: false },
  
  // Mistral (requires API key)
  'mistral/mistral-large-latest': { provider: 'mistral', name: 'Mistral Large', free: false },
  'mistral/mistral-medium-latest': { provider: 'mistral', name: 'Mistral Medium', free: false },
  'mistral/mistral-small-latest': { provider: 'mistral', name: 'Mistral Small', free: false },
  'mistral/codestral-latest': { provider: 'mistral', name: 'Codestral', free: false },
  
  // Perplexity (requires API key)
  'perplexity/sonar-pro': { provider: 'perplexity', name: 'Sonar Pro', free: false },
  'perplexity/sonar-small': { provider: 'perplexity', name: 'Sonar Small', free: false },
  'perplexity/sonar-reasoning-pro': { provider: 'perplexity', name: 'Sonar Reasoning Pro', free: false },
  'perplexity/sonar-reasoning': { provider: 'perplexity', name: 'Sonar Reasoning', free: false },
  
  // Cohere (requires API key)
  'cohere/command-r-plus': { provider: 'cohere', name: 'Command R+', free: false },
  'cohere/command-r': { provider: 'cohere', name: 'Command R', free: false },
  'cohere/command': { provider: 'cohere', name: 'Command', free: false },
  
  // Azure OpenAI (requires API key)
  'azure/gpt-4o': { provider: 'azure', name: 'Azure GPT-4o', free: false },
  'azure/gpt-4o-mini': { provider: 'azure', name: 'Azure GPT-4o Mini', free: false },
  'azure/gpt-35-turbo': { provider: 'azure', name: 'Azure GPT-3.5 Turbo', free: false },
  
  // MiniMax (requires API key)
  'minimax/MiniMax-M2.5': { provider: 'minimax', name: 'MiniMax M2.5', free: false },
  'minimax/MiniMax-M2': { provider: 'minimax', name: 'MiniMax M2', free: false },
  'minimax/MiniMax-Text-01': { provider: 'minimax', name: 'MiniMax Text 01', free: false },
  
  // Kimi / Moonshot AI (requires API key)
  'kimi/k2.5': { provider: 'kimi', name: 'Kimi K2.5', free: false },
  'kimi/k2.5-vision': { provider: 'kimi', name: 'Kimi K2.5 Vision', free: false },
  'kimi/k0-math': { provider: 'kimi', name: 'Kimi K0 Math', free: false },
  'kimi/kimi-latest': { provider: 'kimi', name: 'Kimi Latest', free: false },
  
  // xAI (requires API key)
  'xai/grok-2': { provider: 'xai', name: 'Grok 2', free: false },
  'xai/grok-2-vision': { provider: 'xai', name: 'Grok 2 Vision', free: false },
  'xai/grok-beta': { provider: 'xai', name: 'Grok Beta', free: false },
  
  // DeepSeek (requires API key)
  'deepseek/deepseek-chat': { provider: 'deepseek', name: 'DeepSeek Chat', free: false },
  'deepseek/deepseek-coder': { provider: 'deepseek', name: 'DeepSeek Coder', free: false },
  
  // Together AI (requires API key)
  'together/llama-3.3-70b-instruct': { provider: 'together', name: 'Llama 3.3 70B', free: false },
  'together/mixtral-8x22b': { provider: 'together', name: 'Mixtral 8x22B', free: false },
  'together/Qwen-2.5-72B': { provider: 'together', name: 'Qwen 2.5 72B', free: false },
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

export async function chat(messages: Message[], model?: string): Promise<{ response: string }> {
  const selectedModel = model || config.defaultModel
  const [provider] = selectedModel.split('/')

  try {
    switch (provider) {
      case 'openrouter': return await chatOpenRouter(messages, selectedModel.replace('openrouter/', ''), config.apiKeys.openrouter)
      case 'openai': return await chatOpenAI(messages, selectedModel.replace('openai/', ''), config.apiKeys.openai)
      case 'anthropic': return await chatAnthropic(messages, selectedModel.replace('anthropic/', ''), config.apiKeys.anthropic)
      case 'google': return await chatGoogle(messages, selectedModel.replace('google/', ''), config.apiKeys.google)
      case 'mistral': return await chatMistral(messages, selectedModel.replace('mistral/', ''), config.apiKeys.mistral)
      case 'perplexity': return await chatPerplexity(messages, selectedModel.replace('perplexity/', ''), config.apiKeys.perplexity)
      case 'cohere': return await chatCohere(messages, selectedModel.replace('cohere/', ''), config.apiKeys.cohere)
      case 'azure': return await chatAzure(messages, selectedModel.replace('azure/', ''), config.apiKeys.azure)
      case 'minimax': return await chatMiniMax(messages, config.apiKeys.minimax)
      case 'kimi': return await chatKimi(messages, config.apiKeys.kimi)
      case 'xai': return await chatXAI(messages, config.apiKeys.xai)
      case 'deepseek': return await chatDeepSeek(messages, config.apiKeys.deepseek)
      case 'together': return await chatTogether(messages, selectedModel.replace('together/', ''), config.apiKeys.together)
      default: return await chatOpenRouter(messages, 'meta-llama/Llama-3.2-90B-Vision-Free', config.apiKeys.openrouter)
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
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
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
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
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
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
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
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.filter(m => m.role !== 'system')],
      temperature: 0.7
    })
  })
  const data = await response.json()
  return { response: data.choices[0]?.message?.content || 'Got it!' }
}

async function chatMiniMax(messages: Message[], apiKey: string) {
  const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_pro', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'MiniMax-M2.5',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.filter(m => m.role !== 'system')],
      temperature: 0.7
    })
  })
  const data = await response.json()
  return { response: data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.parsed || 'Got it!' }
}

async function chatKimi(messages: Message[], apiKey: string) {
  const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'k2.5',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.filter(m => m.role !== 'system')],
      temperature: 0.7
    })
  })
  const data = await response.json()
  return { response: data.choices[0]?.message?.content || 'Got it!' }
}

async function chatXAI(messages: Message[], apiKey: string) {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'grok-2',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.filter(m => m.role !== 'system')],
      temperature: 0.7
    })
  })
  const data = await response.json()
  return { response: data.choices[0]?.message?.content || 'Got it!' }
}

async function chatDeepSeek(messages: Message[], apiKey: string) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.filter(m => m.role !== 'system')],
      temperature: 0.7
    })
  })
  const data = await response.json()
  return { response: data.choices[0]?.message?.content || 'Got it!' }
}

async function chatTogether(messages: Message[], model: string, apiKey: string) {
  const response = await fetch('https://api.together.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
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
    freeModels: Object.entries(MODELS).filter(([_, v]) => v.free).map(([k, v]) => ({ id: k, ...v })),
    paidModels: Object.entries(MODELS).filter(([_, v]) => !v.free).map(([k, v]) => ({ id: k, ...v })),
    hasOpenAI: !!config.apiKeys.openai,
    hasAnthropic: !!config.apiKeys.anthropic,
    hasGoogle: !!config.apiKeys.google,
    hasOpenRouter: !!config.apiKeys.openrouter,
    hasMistral: !!config.apiKeys.mistral,
    hasPerplexity: !!config.apiKeys.perplexity,
    hasCohere: !!config.apiKeys.cohere,
    hasAzure: !!config.apiKeys.azure,
    hasMiniMax: !!config.apiKeys.minimax,
    hasKimi: !!config.apiKeys.kimi,
    hasXAI: !!config.apiKeys.xai,
    hasDeepSeek: !!config.apiKeys.deepseek,
    hasTogether: !!config.apiKeys.together,
    defaultModel: config.defaultModel
  }
}
