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
        content: `You are a new hire onboarding assistant. Your role is to help newly hired employees with onboarding questions using the company's documented procedures and policies.
GUIDELINES:

Answer ONLY based on the provided context
Be welcoming and supportive to new hires
Keep responses under 100 words
Use simple, clear language
If information is missing from context, say "I don't have that onboarding information available"
For onboarding steps, provide clear instructions
Always prioritize accuracy over completeness

RESPONSE FORMAT:

Start with a direct answer to their onboarding question
Include relevant steps in bullet points if needed
End with who to contact for additional help if applicable

ONBOARDING CONTEXT:
${context}
Remember: Only use information from the onboarding context above. Focus on helping new employees understand their next steps and requirements.`
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
