USE [master]
GO
/****** Object:  Database [wordPlayDB]    Script Date: 8.06.2025 18:49:49 ******/
CREATE DATABASE [wordPlayDB]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'wordPlayDB', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\wordPlayDB.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'wordPlayDB_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\wordPlayDB_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [wordPlayDB] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [wordPlayDB].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [wordPlayDB] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [wordPlayDB] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [wordPlayDB] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [wordPlayDB] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [wordPlayDB] SET ARITHABORT OFF 
GO
ALTER DATABASE [wordPlayDB] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [wordPlayDB] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [wordPlayDB] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [wordPlayDB] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [wordPlayDB] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [wordPlayDB] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [wordPlayDB] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [wordPlayDB] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [wordPlayDB] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [wordPlayDB] SET  DISABLE_BROKER 
GO
ALTER DATABASE [wordPlayDB] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [wordPlayDB] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [wordPlayDB] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [wordPlayDB] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [wordPlayDB] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [wordPlayDB] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [wordPlayDB] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [wordPlayDB] SET RECOVERY FULL 
GO
ALTER DATABASE [wordPlayDB] SET  MULTI_USER 
GO
ALTER DATABASE [wordPlayDB] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [wordPlayDB] SET DB_CHAINING OFF 
GO
ALTER DATABASE [wordPlayDB] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [wordPlayDB] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [wordPlayDB] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [wordPlayDB] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'wordPlayDB', N'ON'
GO
ALTER DATABASE [wordPlayDB] SET QUERY_STORE = ON
GO
ALTER DATABASE [wordPlayDB] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [wordPlayDB]
GO
/****** Object:  Table [dbo].[ReviewSchedule]    Script Date: 8.06.2025 18:49:50 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ReviewSchedule](
	[ScheduleId] [int] IDENTITY(1,1) NOT NULL,
	[WordId] [int] NOT NULL,
	[UserId] [int] NOT NULL,
	[ReviewDate] [datetime] NOT NULL,
	[Completed] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[ScheduleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 8.06.2025 18:49:50 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[Username] [nvarchar](100) NOT NULL,
	[Email] [nvarchar](100) NOT NULL,
	[PasswordHash] [nvarchar](255) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserWords]    Script Date: 8.06.2025 18:49:50 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserWords](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[WordId] [int] NOT NULL,
	[CorrectStreak] [int] NULL,
	[NextDueDate] [date] NULL,
	[Status] [varchar](20) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WordProgress]    Script Date: 8.06.2025 18:49:50 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WordProgress](
	[ProgressId] [int] IDENTITY(1,1) NOT NULL,
	[WordId] [int] NOT NULL,
	[UserId] [int] NOT NULL,
	[CorrectCount] [int] NULL,
	[LastCorrectDate] [datetime] NULL,
	[NextReviewDate] [datetime] NULL,
	[Stage] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[ProgressId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Words]    Script Date: 8.06.2025 18:49:50 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Words](
	[WordID] [int] IDENTITY(1,1) NOT NULL,
	[EngWordName] [nvarchar](100) NOT NULL,
	[TurWordName] [nvarchar](100) NOT NULL,
	[Picture] [nvarchar](255) NULL,
	[Pronunciation] [nvarchar](255) NULL,
	[UserId] [int] NOT NULL,
	[Category] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[WordID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WordSamples]    Script Date: 8.06.2025 18:49:50 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WordSamples](
	[WordSampleID] [int] IDENTITY(1,1) NOT NULL,
	[WordID] [int] NOT NULL,
	[SampleText] [nvarchar](500) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[WordSampleID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[Users] ON 

INSERT [dbo].[Users] ([id], [Username], [Email], [PasswordHash]) VALUES (1, N'burakk', N'burakakblt@gmail.com', N'$2a$11$GeGAwogNQ60Czttz5ZEag.I85q.wWywuPxI9Web6SmqPQGN.PFKJC')
INSERT [dbo].[Users] ([id], [Username], [Email], [PasswordHash]) VALUES (2, N'burak123', N'ba0966258@gmail.com', N'$2a$11$0WWDfYf/mX4R1MrsK6ir.O.JndwRIYxAYExiDrvI9XgpBvGy4XF8m')
SET IDENTITY_INSERT [dbo].[Users] OFF
GO
SET IDENTITY_INSERT [dbo].[UserWords] ON 

INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (1, 1, 28, 2, CAST(N'2025-06-12' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (2, 1, 42, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (3, 1, 50, 2, CAST(N'2025-06-15' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (4, 1, 39, 2, CAST(N'2025-06-15' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (5, 1, 10, 2, CAST(N'2025-06-15' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (6, 1, 30, 2, CAST(N'2025-06-12' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (7, 1, 31, 2, CAST(N'2025-06-12' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (8, 1, 19, 2, CAST(N'2025-06-12' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (9, 1, 5, 2, CAST(N'2025-06-15' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (10, 1, 35, 2, CAST(N'2025-06-12' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (11, 1, 9, 2, CAST(N'2025-06-15' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (12, 1, 21, 3, CAST(N'2025-07-08' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (13, 1, 6, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (14, 1, 12, 2, CAST(N'2025-06-15' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (15, 1, 38, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (16, 1, 16, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (17, 1, 44, 2, CAST(N'2025-06-15' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (18, 1, 43, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (19, 1, 40, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (20, 1, 18, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (21, 1, 15, 2, CAST(N'2025-06-15' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (22, 1, 4, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (23, 1, 3, 2, CAST(N'2025-06-15' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (24, 1, 41, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (25, 1, 48, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (26, 1, 49, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (27, 1, 32, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (28, 1, 7, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (29, 1, 36, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (30, 1, 34, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (31, 1, 2, 3, CAST(N'2025-07-08' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (32, 1, 51, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (33, 1, 33, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (34, 1, 14, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (35, 1, 46, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (36, 1, 26, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (37, 1, 22, 2, CAST(N'2025-06-15' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (38, 1, 8, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (39, 1, 24, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (40, 1, 23, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (41, 1, 13, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (42, 1, 25, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (43, 1, 17, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (44, 1, 37, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (45, 1, 11, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (46, 1, 45, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (47, 1, 20, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (48, 1, 47, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (49, 1, 29, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (50, 1, 27, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (51, 1, 53, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (52, 1, 1, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (53, 1, 52, 1, CAST(N'2025-06-09' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (54, 2, 1, 0, CAST(N'2025-06-08' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (55, 2, 37, 0, CAST(N'2025-06-08' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (56, 2, 7, 0, CAST(N'2025-06-08' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (57, 2, 12, 0, CAST(N'2025-06-08' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (58, 2, 27, 0, CAST(N'2025-06-08' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (59, 2, 45, 0, CAST(N'2025-06-08' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (60, 2, 50, 0, CAST(N'2025-06-08' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (61, 2, 26, 0, CAST(N'2025-06-08' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (62, 2, 40, 0, CAST(N'2025-06-08' AS Date), N'learning')
INSERT [dbo].[UserWords] ([Id], [UserId], [WordId], [CorrectStreak], [NextDueDate], [Status]) VALUES (63, 2, 4, 0, CAST(N'2025-06-08' AS Date), N'learning')
SET IDENTITY_INSERT [dbo].[UserWords] OFF
GO
SET IDENTITY_INSERT [dbo].[Words] ON 

INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (1, N'Apple', N'Elma', N'\apple.jpg', N'', 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (2, N'watermelon', N'karpuz', N'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.ufuktarim.com%2Fkarpuz-yetistiriciligi&psig=AOvVaw3tL4yRBBxmsBNLNuJgJYoU&ust=1749204616693000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCNCnu5GF2o0DFQAAAAAdAAAAABAE', N'', 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (3, N'book', N'kitap', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (4, N'table', N'masa', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (5, N'house', N'ev', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (6, N'car', N'araba', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (7, N'cat', N'kedi', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (8, N'dog', N'köpek', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (9, N'bird', N'kuş', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (10, N'tree', N'ağaç', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (11, N'mountain', N'dağ', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (12, N'river', N'nehir', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (13, N'sea', N'deniz', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (14, N'sun', N'güneş', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (15, N'moon', N'ay', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (16, N'star', N'yıldız', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (17, N'child', N'çocuk', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (18, N'father', N'baba', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (19, N'mother', N'anne', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (20, N'friend', N'arkadaş', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (21, N'city', N'şehir', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (22, N'school', N'okul', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (23, N'teacher', N'öğretmen', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (24, N'pen', N'kalem', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (25, N'notebook', N'defter', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (26, N'computer', N'bilgisayar', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (27, N'phone', N'telefon', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (28, N'television', N'televizyon', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (29, N'hand', N'el', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (30, N'eye', N'göz', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (31, N'ear', N'kulak', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (32, N'nose', N'burun', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (33, N'mouth', N'ağız', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (34, N'hair', N'saç', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (35, N'head', N'baş', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (36, N'arm', N'kol', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (37, N'leg', N'bacak', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (38, N'foot', N'ayak', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (39, N'water', N'su', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (40, N'food', N'yemek', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (41, N'breakfast', N'kahvaltı', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (42, N'lunch', N'öğle yemeği', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (43, N'dinner', N'akşam yemeği', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (44, N'flower', N'çiçek', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (45, N'forest', N'orman', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (46, N'road', N'yol', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (47, N'village', N'köy', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (48, N'country', N'ülke', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (49, N'weather', N'hava', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (50, N'rain', N'yağmur', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (51, N'snow', N'kar', NULL, NULL, 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (52, N'watermelon', N'karpuz', N'\indir.jpeg', N'', 1, NULL)
INSERT [dbo].[Words] ([WordID], [EngWordName], [TurWordName], [Picture], [Pronunciation], [UserId], [Category]) VALUES (53, N'apple', N'elma', N'\apple.jpg', N'', 1, NULL)
SET IDENTITY_INSERT [dbo].[Words] OFF
GO
SET IDENTITY_INSERT [dbo].[WordSamples] ON 

INSERT [dbo].[WordSamples] ([WordSampleID], [WordID], [SampleText]) VALUES (1, 1, N'Burak loves eating apples')
INSERT [dbo].[WordSamples] ([WordSampleID], [WordID], [SampleText]) VALUES (2, 2, N'karpuz çok güzel')
INSERT [dbo].[WordSamples] ([WordSampleID], [WordID], [SampleText]) VALUES (3, 52, N'ı love watermelon')
INSERT [dbo].[WordSamples] ([WordSampleID], [WordID], [SampleText]) VALUES (4, 53, N'ı love apple')
SET IDENTITY_INSERT [dbo].[WordSamples] OFF
GO
ALTER TABLE [dbo].[ReviewSchedule] ADD  DEFAULT ((0)) FOR [Completed]
GO
ALTER TABLE [dbo].[UserWords] ADD  DEFAULT ((0)) FOR [CorrectStreak]
GO
ALTER TABLE [dbo].[UserWords] ADD  DEFAULT ('learning') FOR [Status]
GO
ALTER TABLE [dbo].[WordProgress] ADD  DEFAULT ((0)) FOR [CorrectCount]
GO
ALTER TABLE [dbo].[WordProgress] ADD  DEFAULT ((0)) FOR [Stage]
GO
ALTER TABLE [dbo].[Words] ADD  DEFAULT ((0)) FOR [UserId]
GO
ALTER TABLE [dbo].[ReviewSchedule]  WITH CHECK ADD FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[ReviewSchedule]  WITH CHECK ADD FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[ReviewSchedule]  WITH CHECK ADD FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[ReviewSchedule]  WITH CHECK ADD FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[ReviewSchedule]  WITH CHECK ADD FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[ReviewSchedule]  WITH CHECK ADD FOREIGN KEY([WordId])
REFERENCES [dbo].[Words] ([WordID])
GO
ALTER TABLE [dbo].[ReviewSchedule]  WITH CHECK ADD FOREIGN KEY([WordId])
REFERENCES [dbo].[Words] ([WordID])
GO
ALTER TABLE [dbo].[ReviewSchedule]  WITH CHECK ADD FOREIGN KEY([WordId])
REFERENCES [dbo].[Words] ([WordID])
GO
ALTER TABLE [dbo].[ReviewSchedule]  WITH CHECK ADD FOREIGN KEY([WordId])
REFERENCES [dbo].[Words] ([WordID])
GO
ALTER TABLE [dbo].[UserWords]  WITH CHECK ADD FOREIGN KEY([WordId])
REFERENCES [dbo].[Words] ([WordID])
GO
ALTER TABLE [dbo].[WordProgress]  WITH CHECK ADD FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[WordProgress]  WITH CHECK ADD FOREIGN KEY([WordId])
REFERENCES [dbo].[Words] ([WordID])
GO
ALTER TABLE [dbo].[WordSamples]  WITH CHECK ADD FOREIGN KEY([WordID])
REFERENCES [dbo].[Words] ([WordID])
ON DELETE CASCADE
GO
USE [master]
GO
ALTER DATABASE [wordPlayDB] SET  READ_WRITE 
GO
