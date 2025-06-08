public record User
{
    public int id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
}

public record LoginRequest
{
    public string Email { get; set; }
    public string PasswordHash { get; set; }
}

public record NewWordRequest
{
    public string EngWordName { get; set; }
    public string TurWordName { get; set; }
    public string Picture { get; set; }
    public string Pronunciation { get; set; }
    public int UserId { get; set; }
    public List<string> Samples { get; set; }
}

public class WordProgress
{
    public int id { get; set; }
    public string Word { get; set; }
    public int CorrectCount { get; set; }
    public DateTime LastCorrectDate { get; set; }
}

public class ExamAnswerRequest
{
    public int userId { get; set; }
    public int wordId { get; set; }
    public bool isCorrect { get; set; }
} 