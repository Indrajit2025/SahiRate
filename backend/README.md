# SahiRate FastAPI backend

Run from the project root:

```powershell
python -m uvicorn backend.app.main:app --reload --port 8000
```

The API docs are available at `http://127.0.0.1:8000/docs`.

The first startup creates `sahirate.db` and seeds these editable demo prices: BATTERY, DISPLAY, MOTOR, PCB, WIRE, METAL and PLASTIC.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Collector | `collector@sahirate.demo` | `demo123` |
| Recycler | `recycler@sahirate.demo` | `demo123` |
| Authority | `authority@sahirate.demo` | `demo123` |

Set `DATABASE_URL` to a PostgreSQL connection string before deployment. Set a long private `TOKEN_SECRET` too. The SQLite database and default secret are for local prototyping only.
