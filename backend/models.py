from datetime import date, datetime
from decimal import Decimal


def serialize_value(val):
    if isinstance(val, datetime):
        return val.isoformat(sep=' ', timespec='seconds')
    if isinstance(val, date):
        return val.isoformat()
    if isinstance(val, Decimal):
        return float(val)
    return val


def serialize_row(row):
    """Convert a DB row dict to JSON-serializable dict."""
    if row is None:
        return None
    return {key: serialize_value(row[key]) for key in row.keys()}


def as_date_str(value):
    """Normalize DB date/datetime/str to YYYY-MM-DD."""
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    return str(value)[:10]