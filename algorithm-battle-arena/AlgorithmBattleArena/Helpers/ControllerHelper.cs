using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace AlgorithmBattleArena.Helpers
{
    public static class ControllerHelper
    {
        public static bool IsValidJson(string jsonString)
        {
            try
            {
                JsonDocument.Parse(jsonString);
                return true;
            }
            catch { return false; }
        }

        public static bool ValidateJson<T>(string json, Func<T, bool> predicate, ILogger logger)
        {
            try
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var items = JsonSerializer.Deserialize<T[]>(json, options);
                return items != null && items.All(predicate);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "JSON validation failed: {Json}", json);
                return false;
            }
        }

        public static IActionResult HandleError(Exception ex, string message, ILogger logger)
        {
            logger.LogError(ex, "{Message}: {Error}", message, ex.Message);
            return new ObjectResult(new { message = "An error occurred.", details = ex.Message })
            {
                StatusCode = 500
            };
        }

        public static IActionResult SafeExecute(Func<IActionResult> action, string errorMessage, ILogger logger)
        {
            try
            {
                return action();
            }
            catch (Exception ex)
            {
                return HandleError(ex, errorMessage, logger);
            }
        }

        public static async Task<IActionResult> SafeExecuteAsync(Func<Task<IActionResult>> action, string errorMessage, ILogger logger)
        {
            try
            {
                return await action();
            }
            catch (Exception ex)
            {
                return HandleError(ex, errorMessage, logger);
            }
        }
    }
}
