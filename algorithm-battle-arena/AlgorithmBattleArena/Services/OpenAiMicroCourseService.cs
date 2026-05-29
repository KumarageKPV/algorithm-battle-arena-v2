using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Repositories;

namespace AlgorithmBattleArena.Services
{
    public class OpenAiMicroCourseService : IMicroCourseService
    {
        private readonly IProblemRepository _problemRepository;
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        private readonly ILogger<OpenAiMicroCourseService> _logger;

        public OpenAiMicroCourseService(IProblemRepository problemRepository, IHttpClientFactory httpClientFactory, ILogger<OpenAiMicroCourseService> logger)
        {
            _problemRepository = problemRepository;
            _httpClient = httpClientFactory.CreateClient();
            _apiKey = (Environment.GetEnvironmentVariable("OPENAI_API_KEY") ?? string.Empty).Trim();
            _logger = logger;
            _logger.LogInformation("OpenAiMicroCourseService initialized. OPENAI_API_KEY present: {HasKey}", !string.IsNullOrWhiteSpace(_apiKey));
        }

        public async Task<object?> GenerateMicroCourseAsync(int problemId, MicroCourseRequestDto request, string userId)
        {
            var problem = await _problemRepository.GetProblem(problemId);
            if (problem == null)
                return null;

            if (string.IsNullOrWhiteSpace(_apiKey))
            {
                _logger.LogError("OPENAI_API_KEY is not configured. Cannot generate micro-course.");
                throw new InvalidOperationException("OpenAI API key not configured.");
            }

            // Build prompt
            string systemPrompt = "You are a concise tutor. Return ONLY valid JSON with fields: summary, steps, disclaimer. Steps is array of objects with: title, durationSec, content, example, resources. Keep content brief. Do NOT include solution code.";
            string userPrompt = $"Problem Title: {problem.Title}\nDescription: {problem.Description}\nLanguage: {request?.Language ?? "general"}\nTimeLimitSeconds: {request?.TimeLimitSeconds ?? 0}\nRemainingSec: {request?.RemainingSec ?? 0}\nCreate 3-4 learning steps with examples and resources. Return only JSON. Do not include the solution.";

            var payload = new
            {
                model = "gpt-4o-mini",
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userPrompt }
                },
                max_tokens = 800
            };

            var requestJson = JsonSerializer.Serialize(payload);
            var httpReq = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
            httpReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            httpReq.Content = new StringContent(requestJson, Encoding.UTF8, "application/json");

            var res = await _httpClient.SendAsync(httpReq);
            if (!res.IsSuccessStatusCode)
            {
                var errorContent = await res.Content.ReadAsStringAsync();
                _logger.LogError("OpenAI API request failed with status {StatusCode}: {ErrorContent}", res.StatusCode, errorContent);
                return null;
            }

            using var stream = await res.Content.ReadAsStreamAsync();
            using var doc = await JsonDocument.ParseAsync(stream);

            try
            {
                var content = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
                if (string.IsNullOrWhiteSpace(content))
                {
                    _logger.LogWarning("OpenAI returned empty content");
                    return null;
                }

                _logger.LogDebug("OpenAI response content: {Content}", content);

                // Clean content - remove markdown code fences if present and try to extract first JSON block
                var cleanContent = content.Trim();
                if (cleanContent.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
                    cleanContent = cleanContent.Substring(7);
                if (cleanContent.StartsWith("```"))
                    cleanContent = cleanContent.Substring(3);
                if (cleanContent.EndsWith("```"))
                    cleanContent = cleanContent.Substring(0, cleanContent.Length - 3);
                cleanContent = cleanContent.Trim();

                // If the model returned extra text around the JSON, try to extract the first JSON object/array
                string ExtractFirstJson(string s)
                {
                    int objStart = s.IndexOf('{');
                    int arrStart = s.IndexOf('[');
                    int start = -1;
                    char openChar = '\0';
                    if (objStart >= 0 && (arrStart == -1 || objStart < arrStart))
                    {
                        start = objStart; openChar = '{';
                    }
                    else if (arrStart >= 0)
                    {
                        start = arrStart; openChar = '[';
                    }

                    if (start == -1)
                        return s; // nothing to extract

                    int depth = 0;
                    for (int i = start; i < s.Length; i++)
                    {
                        if (s[i] == openChar) depth++;
                        else if (openChar == '{' && s[i] == '}') depth--;
                        else if (openChar == '[' && s[i] == ']') depth--;

                        if (depth == 0)
                        {
                            return s.Substring(start, i - start + 1);
                        }
                    }

                    return s; // fallback - incomplete JSON
                }

                var candidate = ExtractFirstJson(cleanContent).Trim();

                // Try parsing the candidate - attempt generic object then fallback to JsonDocument for debugging
                try
                {
                    var parsed = JsonSerializer.Deserialize<object>(candidate);
                    return parsed;
                }
                catch (JsonException jex)
                {
                    _logger.LogWarning(jex, "Failed to parse candidate JSON from OpenAI response. Candidate length: {Len}. Candidate preview: {Preview}", candidate?.Length ?? 0, candidate?.Substring(0, Math.Min(200, candidate.Length)) ?? "");
                    // Give a more lenient parse attempt using JsonDocument to provide clearer error if it fails
                    try
                    {
                        if (string.IsNullOrWhiteSpace(candidate))
                        {
                            _logger.LogWarning("Candidate JSON is empty after extraction.");
                            return null;
                        }

                        using var dbgDoc = JsonDocument.Parse(candidate);
                        return JsonSerializer.Deserialize<object>(dbgDoc.RootElement.GetRawText());
                    }
                    catch (Exception inner)
                    {
                        _logger.LogError(inner, "Second parse attempt also failed. Returning null.");
                        return null;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parsing OpenAI response");

                return null;
            }
        }
    }
}
