import Supermemory from 'supermemory';
import OpenAI from 'openai';

const client = new Supermemory({
  apiKey: process.env.SUPERMEMORY_API_KEY!
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export async function ragQuery(query: string, org_id: string) {
  // 1. Retrieve relevant memories
  const searchResults = await client.search.memories({
    q: query,
    containerTag: org_id,
    limit: 20,
    threshold: 0.3
  });

  // 2. Build context from retrieved memories
  const context = searchResults.results
    .map(r => r.memory)
    .join('\n\n');

  // 3. Generate response with context
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a company knowledge base assistant. Your role is to provide accurate, helpful information based on the company's documented knowledge and procedures.

        GUIDELINES:
        - Answer ONLY based on the provided context
        - Be concise and direct - keep responses under 100 words
        - Use simple, clear language that anyone can understand
        - If information is missing from context, say "I don't have that information in our knowledge base"
        - For procedures, provide step-by-step instructions
        - For policies, cite the relevant section or document
        - Always prioritize accuracy over completeness

        RESPONSE FORMAT:
        - Start with a direct answer
        - Include relevant details in bullet points if needed
        - End with source reference if applicable

        CONTEXT FROM COMPANY KNOWLEDGE BASE:
        ${context}

        Remember: Only use information from the context above. Do not make assumptions or add external knowledge.`
        },
      {
        role: 'user',
        content: query
      }
    ],
    temperature: 0.5,
  });
  console.log(" rag response", response);
  return response.choices[0].message.content;
}
