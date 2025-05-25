using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.OpenApi.Models;
using System.Net;
using BCrypt.Net;

// TLS protokolü güncellemesi kaldırıldı (artık gerekli değil)

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "WordPlay API", Version = "v1" });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Geçici hafızada word progress listesi
builder.Services.AddSingleton<List<WordProgress>>();

var app = builder.Build();

app.UseCors("AllowAll");
app.UseSwagger();
app.UseSwaggerUI();

// === SIGNUP ===
app.MapPost("/api/signup", async (User user) =>
{
    if (string.IsNullOrEmpty(user.Username) || string.IsNullOrEmpty(user.Email) || string.IsNullOrEmpty(user.PasswordHash))
        return Results.BadRequest(new { message = "Tüm alanlar doldurulmalıdır." });

    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    try
    {
        await conn.OpenAsync();

        var checkQuery = "SELECT COUNT(*) FROM Users WHERE Email = @Email";
        using var checkCmd = new SqlCommand(checkQuery, conn);
        checkCmd.Parameters.AddWithValue("@Email", user.Email);
        int exists = (int)await checkCmd.ExecuteScalarAsync();

        if (exists > 0)
            return Results.BadRequest(new { message = "Bu e-posta zaten kayıtlı." });

        var insertQuery = "INSERT INTO WordPlayDB.dbo.Users (Username, Email, PasswordHash) VALUES (@Username, @Email, @PasswordHash)";
        using var cmd = new SqlCommand(insertQuery, conn);
        cmd.Parameters.AddWithValue("@Username", user.Username);
        cmd.Parameters.AddWithValue("@Email", user.Email);
        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
        cmd.Parameters.AddWithValue("@PasswordHash", hashedPassword);

        await cmd.ExecuteNonQueryAsync();
        return Results.Ok(new { message = "Kayıt başarılı!" });
    }
    catch (SqlException ex)
    {
        return Results.BadRequest(new { message = $"Sunucu hatası: {ex.Message}, lütfen tekrar deneyin." });
    }
});

// === LOGIN ===
app.MapPost("/api/login", async (LoginRequest request) =>
{
    if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.PasswordHash))
        return Results.BadRequest(new { message = "Email ve şifre zorunludur." });

    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    var query = "SELECT PasswordHash FROM Users WHERE Email = @Email";
    using var cmd = new SqlCommand(query, conn);
    cmd.Parameters.AddWithValue("@Email", request.Email);

    try
    {
        await conn.OpenAsync();
        var result = await cmd.ExecuteScalarAsync();

        if (result != null)
        {
            var storedHash = result.ToString();
            var isValid = BCrypt.Net.BCrypt.Verify(request.PasswordHash, storedHash);
            if (isValid)
                return Results.Ok(new { message = "Giriş başarılı!" });
            else
               return Results.Json(new { message = "Şifre yanlış." }, statusCode: StatusCodes.Status401Unauthorized);
        }

        return Results.NotFound(new { message = "Kullanıcı bulunamadı." });
    }
    catch (SqlException ex)
    {
        return Results.BadRequest(new { message = $"Sunucu hatası: {ex.Message}, lütfen tekrar deneyin." });
    }
});

// === WORD GET ===
app.MapGet("/api/words", async (HttpContext context) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    var words = new List<dynamic>();

    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    // Ana kelimeleri al
    var cmdWords = new SqlCommand("SELECT WordID, EngWordName, TurWordName, Picture FROM Words WHERE UserId = 1", conn);
    var reader = await cmdWords.ExecuteReaderAsync();

    var wordDict = new Dictionary<int, dynamic>();

    while (await reader.ReadAsync())
    {
        var wordId = (int)reader["WordID"];
        var word = new
        {
            Id = wordId,
            Text = reader["EngWordName"].ToString(),
            Translation = reader["TurWordName"].ToString(),
            Picture = reader["Picture"].ToString(),
            Samples = new List<string>()
        };
        wordDict.Add(wordId, word);
    }
    await reader.CloseAsync();

    // Tüm örnek cümleleri al (tek sorgu)
    var cmdSamples = new SqlCommand("SELECT WordID, SampleText FROM WordSamples WHERE WordID IN (" + string.Join(",", wordDict.Keys) + ")", conn);
    var sampleReader = await cmdSamples.ExecuteReaderAsync();

    while (await sampleReader.ReadAsync())
    {
        var wordId = (int)sampleReader["WordID"];
        var sampleText = sampleReader["SampleText"].ToString();
        if (wordDict.ContainsKey(wordId))
        {
            wordDict[wordId].Samples.Add(sampleText);
        }
    }
    await sampleReader.CloseAsync();

    words = wordDict.Values.ToList();

    return Results.Ok(words);
});

// === WORD POST ===
app.MapPost("/api/add-full-word", async (NewWordRequest request, IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");

    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var transaction = conn.BeginTransaction();

    try
    {
        // 1. Words tablosuna ekle
        var wordCmd = new SqlCommand(@"
            INSERT INTO Words (EngWordName, TurWordName, Picture, Pronunciation, UserId) 
            OUTPUT INSERTED.WordID
            VALUES (@eng, @tur, @pic, @pron, @userId)", conn, transaction);

        wordCmd.Parameters.AddWithValue("@eng", request.EngWordName);
        wordCmd.Parameters.AddWithValue("@tur", request.TurWordName);
        wordCmd.Parameters.AddWithValue("@pic", request.Picture);
        wordCmd.Parameters.AddWithValue("@pron", request.Pronunciation ?? (object)DBNull.Value);
        wordCmd.Parameters.AddWithValue("@userId", request.UserId);

        int wordId = (int)await wordCmd.ExecuteScalarAsync();

        // 2. WordSamples tablosuna örnek cümleleri ekle
        foreach (var sample in request.Samples)
        {
            var sampleCmd = new SqlCommand("INSERT INTO WordSamples (WordID, SampleText) VALUES (@wordId, @text)", conn, transaction);
            sampleCmd.Parameters.AddWithValue("@wordId", wordId);
            sampleCmd.Parameters.AddWithValue("@text", sample);
            await sampleCmd.ExecuteNonQueryAsync();
        }

        await transaction.CommitAsync();
        return Results.Ok(new { message = "Kelime ve örnek cümleler başarıyla eklendi." });
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        return Results.BadRequest(new { message = $"Hata: {ex.Message}" });
    }
});

// === WORD PROGRESS GET ===
app.MapGet("/api/word-progress", async (HttpContext context) =>
{
    using var connection = new SqlConnection(configuration.GetConnectionString("DefaultConnection"));
    await connection.OpenAsync();

    var command = new SqlCommand("SELECT Id, Word, CorrectCount, LastCorrectDate FROM WordProgress", connection);
    var reader = await command.ExecuteReaderAsync();

    if (!reader.HasRows)
    {
        return Results.NotFound(new { message = "Kayıt bulunamadı." });
    }

    var wordList = new List<WordProgress>();
    while (await reader.ReadAsync())
    {
        wordList.Add(new WordProgress
        {
            Id = reader.GetInt32(reader.GetOrdinal("Id")),
            Word = reader.GetString(reader.GetOrdinal("Word")),
            CorrectCount = reader.GetInt32(reader.GetOrdinal("CorrectCount")),
            LastCorrectDate = reader.GetDateTime(reader.GetOrdinal("LastCorrectDate"))
        });
    }

    return Results.Ok(wordList);
});

// === 6 Adım Ezberleme Modülü ===

// 1. Günlük yeni kelimeleri UserWords tablosuna ekle
app.MapPost("/api/userwords/add-daily-new", async (AddDailyNewWordsRequest request) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");

    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var query = @"
        INSERT INTO UserWords (UserId, WordId, CorrectStreak, NextDueDate, Status)
        SELECT TOP (@newWordCount) @userId, w.WordID, 0, CAST(GETDATE() AS DATE), 'learning'
        FROM Words w
        WHERE w.UserId = @userId AND w.WordID NOT IN (
            SELECT WordId FROM UserWords WHERE UserId = @userId
        )
        ORDER BY w.WordID
    ";

    using var cmd = new SqlCommand(query, conn);
    cmd.Parameters.AddWithValue("@userId", request.UserId);
    cmd.Parameters.AddWithValue("@newWordCount", request.NewWordCount);

    int rowsAffected = await cmd.ExecuteNonQueryAsync();

    return Results.Ok(new { message = $"{rowsAffected} adet yeni kelime eklendi." });
});

// 2. Tekrar edilmesi gereken kelimeleri getir
app.MapGet("/api/userwords/due-words/{userId:int}", async (int userId) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");

    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var query = @"
        SELECT uw.Id, uw.UserId, uw.WordId, uw.CorrectStreak, uw.NextDueDate, uw.Status, 
               w.EngWordName, w.TurWordName, w.Picture
        FROM UserWords uw
        JOIN Words w ON uw.WordId = w.WordID
        WHERE uw.UserId = @userId AND uw.NextDueDate <= CAST(GETDATE() AS DATE)
        ORDER BY uw.NextDueDate
    ";

    using var cmd = new SqlCommand(query, conn);
    cmd.Parameters.AddWithValue("@userId", userId);

    var reader = await cmd.ExecuteReaderAsync();

    var dueWords = new List<UserWordDto>();

    while (await reader.ReadAsync())
    {
        dueWords.Add(new UserWordDto
        {
            Id = reader.GetInt32(reader.GetOrdinal("Id")),
            UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
            WordId = reader.GetInt32(reader.GetOrdinal("WordId")),
            CorrectStreak = reader.GetInt32(reader.GetOrdinal("CorrectStreak")),
            NextDueDate = reader.GetDateTime(reader.GetOrdinal("NextDueDate")),
            Status = reader.GetString(reader.GetOrdinal("Status")),
            EngWordName = reader.GetString(reader.GetOrdinal("EngWordName")),
            TurWordName = reader.GetString(reader.GetOrdinal("TurWordName")),
            Picture = reader.IsDBNull(reader.GetOrdinal("Picture")) ? null : reader.GetString(reader.GetOrdinal("Picture"))
        });
    }

    return Results.Ok(dueWords);
});
//Ayarlar Endopointi
app.MapGet("/api/user-info", async (HttpContext context) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");

    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    var cmd = new SqlCommand("SELECT Username, Email, JoinDate FROM Users WHERE UserId = @id", connection);
    cmd.Parameters.AddWithValue("@id", 1); // örnek kullanıcı
    var reader = await cmd.ExecuteReaderAsync();

    if (await reader.ReadAsync())
    {
        var user = new
        {
            username = reader["Username"].ToString(),
            email = reader["Email"].ToString(),
            joinDate = Convert.ToDateTime(reader["JoinDate"]).ToString("yyyy-MM-dd")
        };
        return Results.Ok(user);
    }

    return Results.NotFound();
});



app.Run();


// === Model Sınıfları ===

public record User
{
    public int Id { get; set; }
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
    public int Id { get; set; }
    public string Word { get; set; }
    public int CorrectCount { get; set; }
    public DateTime LastCorrectDate { get; set; }
}

public record AddDailyNewWordsRequest(int UserId, int NewWordCount);

public class UserWordDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int WordId { get; set; }
    public int CorrectStreak { get; set; }
    public DateTime NextDueDate { get; set; }
    public string Status { get; set; }
    public string EngWordName { get; set; }
    public string TurWordName { get; set; }
    public string Picture { get; set; }
}