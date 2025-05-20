using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.OpenApi.Models;
using System.Net;
using BCrypt.Net;

// TLS protokolü güncellemesi
System.Net.ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

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
        policy.WithOrigins("http://localhost:3000")
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
    var words = new List<object>();

    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();
    
    // Ana kelime bilgilerini al
    var cmd = new SqlCommand("SELECT * FROM Words WHERE UserId = 1", conn);
    var reader = await cmd.ExecuteReaderAsync();

    while (await reader.ReadAsync())
    {
        var wordId = reader["WordID"];
        var word = new
        {
            Id = wordId,
            Text = reader["EngWordName"].ToString(),
            Translation = reader["TurWordName"].ToString(),
            Picture = reader["Picture"].ToString(),
            Samples = new List<string>()
        };

        // Örnek cümleleri almak için ikinci bir sorgu
        using var sampleCmd = new SqlCommand("SELECT SampleText FROM WordSamples WHERE WordID = @wordId", conn);
        sampleCmd.Parameters.AddWithValue("@wordId", wordId);
        
        using var sampleReader = await sampleCmd.ExecuteReaderAsync();
        while (await sampleReader.ReadAsync())
        {
            word.Samples.Add(sampleReader["SampleText"].ToString());
        }
        await sampleReader.CloseAsync();

        words.Add(word);
    }

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

// Hangi kolonlar geliyor bakalım:
for (int i = 0; i < reader.FieldCount; i++)
{
    Console.WriteLine($"Column {i}: {reader.GetName(i)}");
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

app.MapPost("/api/NewWordRequest", async (HttpContext context) =>
{
    try
    {
        var request = await context.Request.ReadFromJsonAsync<NewWordRequest>();
        if (request is null)
        {
            return Results.BadRequest(new { message = "Veri okunamadı." });
        }

        using var connection = new SqlConnection(configuration.GetConnectionString("DefaultConnection"));
        await connection.OpenAsync();

        var command = new SqlCommand(@"
            INSERT INTO Words (EngWordName, TurWordName, Picture, Pronunciation, UserId)
            OUTPUT INSERTED.Id
            VALUES (@eng, @tur, @pic, @pron, @uid)", connection);

        command.Parameters.AddWithValue("@eng", request.EngWordName);
        command.Parameters.AddWithValue("@tur", request.TurWordName);
        command.Parameters.AddWithValue("@pic", request.Picture ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@pron", request.Pronunciation ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("@uid", request.UserId);

        var wordId = (int)await command.ExecuteScalarAsync();

        // Örnek cümleleri ekle
        foreach (var sample in request.Samples.Where(s => !string.IsNullOrWhiteSpace(s)))
        {
            var sampleCmd = new SqlCommand(@"
                INSERT INTO WordSamples (WordId, SampleText)
                VALUES (@wordId, @sample)", connection);

            sampleCmd.Parameters.AddWithValue("@wordId", wordId);
            sampleCmd.Parameters.AddWithValue("@sample", sample);
            await sampleCmd.ExecuteNonQueryAsync();
        }

        return Results.Ok(new { message = "Kelime başarıyla eklendi!" });
    }
    catch (Exception ex)
    {
        return Results.Problem("Sunucu hatası: " + ex.Message);
    }
});





app.Run();


// === MODELLER ===
public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Email { get; set; }
    public string PasswordHash { get; set; }
}

public class WordDto
{
    public string Text { get; set; }
    public string Translation { get; set; }
    public int UserId { get; set; }
}

public class WordProgress
{
    public int Id { get; set; }
    public string Word { get; set; } = string.Empty;
    public int CorrectCount { get; set; }
    public DateTime LastCorrectDate { get; set; }
}
public class NewWordRequest
{
    public string EngWordName { get; set; }
    public string TurWordName { get; set; }
    public string Picture { get; set; }
    public string? Pronunciation { get; set; }
    public List<string> Samples { get; set; }
    public int UserId { get; set; }
}