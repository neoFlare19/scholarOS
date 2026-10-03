# AI Paper Summarization

## Endpoint

`POST /api/v1/papers/summarize` requires Sanctum authentication and accepts a paper title, abstract, and optional category:

```json
{
  "title": "Paper title",
  "abstract": "The paper abstract...",
  "category": "Research area"
}
```

The response `data` contains `summary`, `keyFindings` (string array), `mainContribution`, and `keywords` (string array). An abstract is required so the model can ground its output in the paper rather than infer findings from a title alone.

## Provider Configuration

Set these variables in the backend environment:

- `SCHOLAROS_AI_BASE_URL`: OpenAI-compatible API base URL (default `https://api.openai.com/v1`)
- `SCHOLAROS_AI_API_KEY`: provider API key
- `SCHOLAROS_AI_MODEL`: chat-completions model (default `gpt-4o-mini`)

The provider call runs in `PaperSummarizationService`; credentials remain on the backend. Without an API key the endpoint returns `503` rather than fabricated content. Invalid provider responses and upstream errors are also returned as actionable API errors.
