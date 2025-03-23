To backup the database:

```bash
docker run --rm -v notetime_sqlite-data:/data -v $(pwd):/backup alpine sh -c "cp /data/notetime.db /backup/notetime-backup.db"
```

To restore from a backup:

```bash
docker run --rm -v notetime_sqlite-data:/data -v $(pwd):/backup alpine sh -c "cp /backup/notetime-backup.db /data/notetime.db"
```

Environment Variables
Backend

PORT: The port the API server runs on (default: 8080)
DB_PATH: Path to the SQLite database file (default: /app/data/notetime.db)
GO_ENV: Environment (development/production)

Frontend

REACT_APP_API_URL: URL of the backend API