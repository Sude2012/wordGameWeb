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
            {
                var userInfoCmd = new SqlCommand("SELECT id, Username FROM Users WHERE Email = @Email", conn);
                userInfoCmd.Parameters.AddWithValue("@Email", request.Email);
                var reader = await userInfoCmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    int userId = reader.GetInt32(0);
                    string username = reader.GetString(1);
                    return Results.Ok(new { message = "Giriş başarılı!", username, email = request.Email, userId });
                }
                // fallback
                return Results.Ok(new { message = "Giriş başarılı!", username = "Kullanıcı", email = request.Email });
            }
            else
            {
                return Results.Json(new { message = "Şifre yanlış." }, statusCode: StatusCodes.Status401Unauthorized);
            }
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

    var command = new SqlCommand("SELECT id, Word, CorrectCount, LastCorrectDate FROM WordProgress", connection);
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
            id = reader.GetInt32(reader.GetOrdinal("id")),
            Word = reader.GetString(reader.GetOrdinal("Word")),
            CorrectCount = reader.GetInt32(reader.GetOrdinal("CorrectCount")),
            LastCorrectDate = reader.GetDateTime(reader.GetOrdinal("LastCorrectDate"))
        });
    }

    return Results.Ok(wordList);
});

// === EXAM MODULE ENDPOINTS ===

// Günlük sorulacak kelimeleri getirir (tekrar zamanı gelen + yeni atanmış)
app.MapGet("/api/exam/words", async (int userId) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();
    var today = DateTime.Today;
    var newWordLimit = 10;
    var result = new List<dynamic>();

    // 1. Tekrar zamanı gelen kelimeler
    var dueWordsQuery = @"
        SELECT TOP (@Limit) w.WordID, w.EngWordName, w.TurWordName, uw.CorrectStreak, uw.Status
        FROM UserWords uw
        INNER JOIN Words w ON uw.WordId = w.WordId
        WHERE uw.UserId = @UserId AND uw.Status = 'learning' AND uw.NextDueDate <= @Today
        ORDER BY uw.NextDueDate ASC
    ";
    var dueWords = new List<dynamic>();
    using (var cmd = new SqlCommand(dueWordsQuery, conn))
    {
        cmd.Parameters.AddWithValue("@Limit", newWordLimit);
        cmd.Parameters.AddWithValue("@UserId", userId);
        cmd.Parameters.AddWithValue("@Today", today);
        using (var reader = await cmd.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                dueWords.Add(new
                {
                    wordId = reader.GetInt32(0),
                    eng = reader.GetString(1),
                    tur = reader.GetString(2),
                    streak = reader.GetInt32(3),
                    status = reader.GetString(4)
                });
            }
        }
    }
    int eksikYeniKelimeSayisi = newWordLimit - dueWords.Count;
    if (eksikYeniKelimeSayisi < 0) eksikYeniKelimeSayisi = 0;

    // 2. Daha önce bu kullanıcıya hiç atanmamış yeni kelimeler
    var newWordsQuery = @"
        SELECT TOP (@Limit) w.WordID, w.EngWordName, w.TurWordName
        FROM Words w
        LEFT JOIN UserWords uw ON uw.UserId = @UserId AND uw.WordId = w.WordId
        WHERE uw.WordId IS NULL
        ORDER BY NEWID()
    ";
    var newWords = new List<dynamic>();
    using (var cmd = new SqlCommand(newWordsQuery, conn))
    {
        cmd.Parameters.AddWithValue("@Limit", eksikYeniKelimeSayisi);
        cmd.Parameters.AddWithValue("@UserId", userId);
        using (var reader = await cmd.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                newWords.Add(new
                {
                    wordId = reader.GetInt32(0),
                    eng = reader.GetString(1),
                    tur = reader.GetString(2),
                    streak = 0,
                    status = "learning"
                });
            }
        }
    }
    // 3. Yeni kelimeleri UserWords tablosuna ekle
    foreach (var nw in newWords)
    {
        var insertCmd = new SqlCommand(@"
            INSERT INTO UserWords (UserId, WordId, CorrectStreak, NextDueDate, Status)
            VALUES (@UserId, @WordId, 0, @NextDueDate, 'learning')
        ", conn);
        insertCmd.Parameters.AddWithValue("@UserId", userId);
        insertCmd.Parameters.AddWithValue("@WordId", nw.wordId);
        insertCmd.Parameters.AddWithValue("@NextDueDate", today);
        await insertCmd.ExecuteNonQueryAsync();
    }
    // 4. Sonuç olarak, tekrar zamanı gelenler + yeni eklenen kelimeleri birleştir ve dön
    var todayWords = new List<dynamic>();
    todayWords.AddRange(dueWords);
    todayWords.AddRange(newWords);
    return Results.Ok(todayWords);
});

// Cevap kaydeder ve kelime ilerlemesini günceller
app.MapPost("/api/exam/answer", async (ExamAnswerRequest req) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();
    // Mevcut streak ve status'u çek
    var cmd = new SqlCommand(@"
        SELECT CorrectStreak, Status FROM UserWords WHERE UserId = @UserId AND WordId = @WordId
    ", conn);
    cmd.Parameters.AddWithValue("@UserId", req.userId);
    cmd.Parameters.AddWithValue("@WordId", req.wordId);
    var reader = await cmd.ExecuteReaderAsync();
    if (!reader.HasRows) return Results.NotFound();
    await reader.ReadAsync();
    int streak = reader.GetInt32(0);
    string status = reader.GetString(1);
    await reader.CloseAsync();
    if (status == "learned")
        return Results.Ok(new { message = "Kelime zaten öğrenildi." });
    int newStreak = req.isCorrect ? streak + 1 : 0;
    DateTime nextDueDate = DateTime.Today;
    string newStatus = status;
    var intervals = new[] { 1, 7, 30, 90, 180, 365 };
    if (req.isCorrect)
    {
        if (newStreak < 6)
            nextDueDate = DateTime.Today.AddDays(intervals[newStreak - 1]);
        else
        {
            newStatus = "learned";
            nextDueDate = DateTime.MaxValue;
        }
    }
    else
    {
        newStreak = 0;
        nextDueDate = DateTime.Today;
    }
    var updateCmd = new SqlCommand(@"
        UPDATE UserWords
        SET CorrectStreak = @streak, NextDueDate = @due, Status = @status
        WHERE UserId = @userId AND WordId = @wordId
    ", conn);
    updateCmd.Parameters.AddWithValue("@streak", newStreak);
    updateCmd.Parameters.AddWithValue("@due", nextDueDate);
    updateCmd.Parameters.AddWithValue("@status", newStatus);
    updateCmd.Parameters.AddWithValue("@userId", req.userId);
    updateCmd.Parameters.AddWithValue("@wordId", req.wordId);
    await updateCmd.ExecuteNonQueryAsync();
    return Results.Ok(new { CorrectStreak = newStreak, Status = newStatus, NextDueDate = nextDueDate });
});

// === USER INFO ===
app.MapGet("/api/user-info", async (string email) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var cmd = new SqlCommand("SELECT Username, Email FROM Users WHERE Email = @Email", conn);
    cmd.Parameters.AddWithValue("@Email", email);
    
    var reader = await cmd.ExecuteReaderAsync();
    if (await reader.ReadAsync())
    {
        return Results.Ok(new
        {
            username = reader.GetString(0),
            email = reader.GetString(1)
        });
    }
    
    return Results.NotFound(new { message = "Kullanıcı bulunamadı." });
});

// === USER WORDS ===
app.MapGet("/api/userwords/all", async (string email) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var cmd = new SqlCommand(@"
        SELECT w.WordID, w.EngWordName, w.TurWordName, uw.Status, uw.CorrectStreak
        FROM Words w
        INNER JOIN UserWords uw ON w.WordID = uw.WordID
        INNER JOIN Users u ON uw.UserID = u.id
        WHERE u.Email = @Email
    ", conn);
    cmd.Parameters.AddWithValue("@Email", email);
    
    var reader = await cmd.ExecuteReaderAsync();
    var words = new List<dynamic>();
    
    while (await reader.ReadAsync())
    {
        words.Add(new
        {
            wordId = reader.GetInt32(0),
            EngWordName = reader.GetString(1),
            TurWordName = reader.GetString(2),
            status = reader.GetString(3),
            streak = reader.GetInt32(4)
        });
    }
    
    return Results.Ok(words);
});

// === USER ANALYSIS REPORT ===
app.MapGet("/api/userwords/report", async (string email) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var cmd = new SqlCommand(@"
        SELECT ISNULL(w.Category, 'Diğer') AS Category, 
               COUNT(*) AS Total,
               SUM(CASE WHEN uw.Status = 'learned' THEN 1 ELSE 0 END) AS Learned
        FROM Words w
        INNER JOIN UserWords uw ON w.WordID = uw.WordID
        INNER JOIN Users u ON uw.UserID = u.id
        WHERE u.Email = @Email
        GROUP BY w.Category
    ", conn);
    cmd.Parameters.AddWithValue("@Email", email);

    var reader = await cmd.ExecuteReaderAsync();
    var report = new List<dynamic>();

    while (await reader.ReadAsync())
    {
        var category = reader.IsDBNull(0) ? "Diğer" : reader.GetString(0);
        var total = reader.GetInt32(1);
        var learned = reader.GetInt32(2);
        var percent = total > 0 ? (int)Math.Round((double)learned * 100 / total) : 0;
        report.Add(new
        {
            category,
            total,
            learned,
            percent
        });
    }

    return Results.Ok(report);
});

// === RESET PASSWORD ===
app.MapPost("/api/reset-password", async (HttpContext context) =>
{
    var data = await context.Request.ReadFromJsonAsync<Dictionary<string, string>>();
    var email = data["email"];
    var oldPassword = data["oldPassword"];
    var newPassword = data["newPassword"];
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();
    // Eski şifreyi kontrol et
    var cmd = new SqlCommand("SELECT PasswordHash FROM Users WHERE Email = @Email", conn);
    cmd.Parameters.AddWithValue("@Email", email);
    var result = await cmd.ExecuteScalarAsync();
    if (result == null)
        return Results.BadRequest(new { message = "Kullanıcı bulunamadı." });
    var storedHash = result.ToString();
    var isValid = BCrypt.Net.BCrypt.Verify(oldPassword, storedHash);
    if (!isValid)
        return Results.BadRequest(new { message = "Eski şifre yanlış." });
    // Yeni şifreyi hash'le ve güncelle
    var newHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
    var updateCmd = new SqlCommand("UPDATE Users SET PasswordHash = @NewHash WHERE Email = @Email", conn);
    updateCmd.Parameters.AddWithValue("@NewHash", newHash);
    updateCmd.Parameters.AddWithValue("@Email", email);
    await updateCmd.ExecuteNonQueryAsync();
    return Results.Ok(new { message = "Şifre başarıyla güncellendi." });
});
app.Run();

