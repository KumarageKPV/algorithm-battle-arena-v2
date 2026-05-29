namespace AlgorithmBattleArena.Dtos;

public class ImportedProblemDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DifficultyLevel { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int TimeLimit { get; set; }
    public int MemoryLimit { get; set; }
    public string CreatedBy { get; set; } = "admin";
    public string Tags { get; set; } = string.Empty;
    public ImportTestCaseDto[] TestCases { get; set; } = Array.Empty<ImportTestCaseDto>();
    public ImportSolutionDto[] Solutions { get; set; } = Array.Empty<ImportSolutionDto>();
}

public class ImportTestCaseDto
{
    public string InputData { get; set; } = string.Empty;
    public string ExpectedOutput { get; set; } = string.Empty;
    public bool IsSample { get; set; }
}

public class ImportSolutionDto
{
    public string Language { get; set; } = string.Empty;
    public string SolutionText { get; set; } = string.Empty;
}

public class ImportErrorDto
{
    public int Row { get; set; }
    public string Field { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class ImportResultDto
{
    public bool Ok { get; set; }
    public int Inserted { get; set; }
    public string[] Slugs { get; set; } = Array.Empty<string>();
    public ImportErrorDto[] Errors { get; set; } = Array.Empty<ImportErrorDto>();
}
