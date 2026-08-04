CREATE TABLE IF NOT EXISTS blogs (
	id SERIAL PRIMARY KEY,
	author TEXT,
	url TEXT NOT NULL,
	title TEXT NOT NULL,
	likes INT DEFAULT 0
);

INSERT INTO blogs (author, url, title)
VALUES
	('Robert C. Martin', 'https://blog.cleancoder.com', 'Clean Code Principles'),
	('Kent C. Dodds', 'https://kentcdodds.com/blog', 'Why Testing Matters');