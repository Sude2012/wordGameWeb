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
    var cmd = new SqlCommand("SELECT * FROM Words WHERE UserId = 1", conn); // Şimdilik sabit kullanıcı
    await conn.OpenAsync();
    var reader = await cmd.ExecuteReaderAsync();

    while (await reader.ReadAsync())
    {
        words.Add(new
        {
            Id = reader["Id"],
            Text = reader["Text"].ToString(),
            Translation = reader["Translation"].ToString()
        });
    }

    return Results.Ok(words);
});

// === WORD POST ===
app.MapPost("/api/addword", async (WordDto data, HttpContext context) =>
{
    if (data == null)
        return Results.BadRequest(new { message = "Geçersiz veri." });

    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    var cmd = new SqlCommand("INSERT INTO Words (Text, Translation, UserId) VALUES (@text, @translation, @userId)", conn);
    cmd.Parameters.AddWithValue("@text", data.Text);
    cmd.Parameters.AddWithValue("@translation", data.Translation);
    cmd.Parameters.AddWithValue("@userId", data.UserId);

    await conn.OpenAsync();
    await cmd.ExecuteNonQueryAsync();
    return Results.Ok(new { message = "Kelime eklendi." });
});

// === WORD PROGRESS GET ===
app.MapGet("/api/word-progress", async (HttpContext context) =>
{
    using var connection = new SqlConnection(configuration.GetConnectionString("DefaultConnection"));
    await connection.OpenAsync();

    var command = new SqlCommand("SELECT * FROM WordProgress", connection);
    var reader = await command.ExecuteReaderAsync();

    var wordList = new List<WordProgress>();
    while (await reader.ReadAsync())
    {
        wordList.Add(new WordProgress
        {
            Id = reader.GetInt32(0),
            Word = reader.GetString(1),
            CorrectCount = reader.GetInt32(2),
            LastCorrectDate = reader.GetDateTime(3)
        });
    }

    return Results.Ok(wordList);
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