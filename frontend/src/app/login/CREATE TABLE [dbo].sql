CREATE TABLE [dbo].[Users3] (
    [Id]       INT            IDENTITY (1, 1) NOT NULL,
    [Username] NVARCHAR (100) NULL,
    [Mail]     NVARCHAR (100) NULL,
    [Password] NVARCHAR (100) NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

DROP TABLE IF EXISTS User2;
DROP TABLE IF EXISTS User3;

