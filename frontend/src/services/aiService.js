import { apiRequest } from "../utils/api.js";

export async function summarizePaper(paper) {
  if (!paper?.title || !paper?.abstract?.trim()) {
    throw new Error("This paper does not include an abstract to summarize.");
  }

  const response = await apiRequest("/v1/papers/summarize", {
    method: "POST",
    body: JSON.stringify({
      title: paper.title,
      abstract: paper.abstract,
      category: paper.category || null,
    }),
  });

  return response.data;
}