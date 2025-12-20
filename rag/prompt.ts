/**
 * This file now focuses purely on the data structure.
 * The behavioral rules are moved to the system message in generate.ts
 * to prevent the model from repeating headers.
 */

export const prompt = `
[DOCUMENT CONTEXT]
{context}

[USER QUERY]
{query}

[ASSISTANT RESPONSE]`;
