using AlgorithmBattleArena.Dtos;

namespace AlgorithmBattleArena.Exceptions;

public class ImportException : Exception
{
    public List<ImportErrorDto> Errors { get; }

    public ImportException(List<ImportErrorDto> errors) : base("Import validation failed")
    {
        Errors = errors;
    }

    public ImportException(string message, List<ImportErrorDto> errors) : base(message)
    {
        Errors = errors;
    }
}
