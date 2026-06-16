

INSERT INTO users (username, password)
VALUES ('admin', '$2a$10$YdZSL1S9NoS5Z8KXWkxyBuOMRbT19Rg3cclZV6sgmXYlgvrhGXxGK')
ON CONFLICT (username) DO NOTHING;