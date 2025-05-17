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

var app = builder.Build();

app.UseCors("AllowAll");
app.UseSwagger();
app.UseSwaggerUI();

// === SIGNUP ===
// (Senin önceki signup kodun aynı şekilde kalabilir)

// === LOGIN ===
// (Senin önceki login kodun aynı şekilde kalabilir)

// === WORDS GET ===
// Tüm kelimeleri çek (sabit kullanıcı değil, basit örnek)
app.MapGet("/api/words", async () =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    var words = new List<Words>();

    using var conn = new SqlConnection(connectionString);
    var query = "SELECT WordID, EngWordName, TurWordName, Picture, Pronunciation FROM Words";
    using var cmd = new SqlCommand(query, conn);
    await conn.OpenAsync();
    using var reader = await cmd.ExecuteReaderAsync();

    while (await reader.ReadAsync())
    {
        words.Add(new Words
        {
            WordID = reader.GetInt32(0),
            EngWordName = reader.GetString(1),
            TurWordGame = reader.GetString(2),
            Picture = reader.IsDBNull(3) ? null : reader.GetString(3),
            Pronunciation = reader.IsDBNull(4) ? null : reader.GetString(4)
        });
    }

    return Results.Ok(words);
});

// === ADD WORD ===
app.MapPost("/api/addword", async (Words newWord) =>
{
    if (string.IsNullOrEmpty(newWord.EngWordName) || string.IsNullOrEmpty(newWord.TurWordGame))
        return Results.BadRequest(new { message = "Kelimenin İngilizce ve Türkçe isimleri zorunludur." });

    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    var query = @"INSERT INTO Words (EngWordName, TurWordName, Picture, Pronunciation) 
                  VALUES (@EngWordName, @TurWordName, @Picture, @Pronunciation)";
    using var cmd = new SqlCommand(query, conn);

    cmd.Parameters.AddWithValue("@EngWordName", newWord.EngWordName);
    cmd.Parameters.AddWithValue("@TurWordName", newWord.TurWordGame);
    cmd.Parameters.AddWithValue("@Picture", (object?)newWord.Picture ?? DBNull.Value);
    cmd.Parameters.AddWithValue("@Pronunciation", (object?)newWord.Pronunciation ?? DBNull.Value);

    await conn.OpenAsync();
    await cmd.ExecuteNonQueryAsync();

    return Results.Ok(new { message = "Kelime eklendi." });
});

// === WORD SAMPLES GET ===
// Bir kelimenin örneklerini çekmek için: /api/words/{wordId}/samples
app.MapGet("/api/words/{wordId}/samples", async (int wordId) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    var samples = new List<WordSamples>();

    using var conn = new SqlConnection(connectionString);
    var query = "SELECT WordSampleID, WordID, SampleText FROM WordSamples WHERE WordID = @WordID";
    using var cmd = new SqlCommand(query, conn);
    cmd.Parameters.AddWithValue("@WordID", wordId);

    await conn.OpenAsync();
    using var reader = await cmd.ExecuteReaderAsync();

    while (await reader.ReadAsync())
    {
        samples.Add(new WordSamples
        {
            WordSampleID = reader.GetInt32(0),
            WordID = reader.GetInt32(1),
            SampleText = reader.GetString(2)
        });
    }

    return Results.Ok(samples);
});

// === ADD WORD SAMPLE ===
app.MapPost("/api/words/{wordId}/addsample", async (int wordId, WordSamples sample) =>
{
    if (string.IsNullOrEmpty(sample.SampleText))
        return Results.BadRequest(new { message = "Örnek cümle boş olamaz." });

    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    var query = "INSERT INTO WordSamples (WordID, SampleText) VALUES (@WordID, @SampleText)";
    using var cmd = new SqlCommand(query, conn);
    cmd.Parameters.AddWithValue("@WordID", wordId);
    cmd.Parameters.AddWithValue("@SampleText", sample.SampleText);

    await conn.OpenAsync();
    await cmd.ExecuteNonQueryAsync();

    return Results.Ok(new { message = "Kelime örneği eklendi." });
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
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
}

public class Words
{
    public int WordID { get; set; }
    public string EngWordName { get; set; } = string.Empty;
    public string TurWordGame { get; set; } = string.Empty;
    public string? Picture { get; set; }
    public string? Pronunciation { get; set; }
}

public class WordSamples
{
    public int WordSampleID { get; set; }
    public int WordID { get; set; }
    public string SampleText { get; set; } = string.Empty;
}