import sqlite3
import os
from flask import g, current_app

DATABASE = 'health_system.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        # Use config if available (during app context), else fallback
        try:
            db_path = current_app.config.get('DATABASE', DATABASE)
        except RuntimeError:
            db_path = DATABASE
            
        db = g._database = sqlite3.connect(db_path)
        db.row_factory = sqlite3.Row  # Access columns by name
    return db

def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    """Helper for executing queries cleanly."""
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    get_db().commit() # Auto-commit for simplicity in this helper, though usually we might want manual commit
    return (rv[0] if rv else None) if one else rv

def execute_db(query, args=()):
    """Helper for insert/update/delete."""
    db = get_db()
    cur = db.execute(query, args)
    db.commit()
    return cur.lastrowid

