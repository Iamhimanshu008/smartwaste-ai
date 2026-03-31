"""
Notification service: save notifications to DB and send Expo push notifications.

All functions are designed to never raise — notification failures must not block
the main request flow.
"""
import json
import traceback
from typing import Optional

import httpx
from sqlalchemy.orm import Session

from models.notification import Notification
from models.user import User

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


def _send_expo_push(token: str, title: str, body: str, data: Optional[dict] = None) -> bool:
    """
    Send a push notification via the Expo Push API (synchronous httpx call).
    Returns True on success, False on failure. Never raises.
    """
    try:
        payload = {
            "to": token,
            "title": title,
            "body": body,
            "sound": "default",
        }
        if data:
            payload["data"] = data

        resp = httpx.post(
            EXPO_PUSH_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10.0,
        )
        resp.raise_for_status()
        return True
    except Exception:
        traceback.print_exc()
        return False


def save_and_send_notification(
    db: Session,
    user_id: int,
    title: str,
    body: str,
    data: Optional[dict] = None,
) -> None:
    """
    Persist a notification record and send a push notification if the user
    has a registered Expo push token.

    This function NEVER raises — all errors are caught and logged.
    """
    try:
        # 1. Save to DB
        notification = Notification(
            user_id=user_id,
            title=title,
            body=body,
            data=json.dumps(data) if data else None,
        )
        db.add(notification)
        db.flush()  # flush so it's visible in the same transaction

        # 2. Look up token and send push
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.expo_push_token:
            _send_expo_push(user.expo_push_token, title, body, data)

    except Exception:
        traceback.print_exc()


def send_push_notification(
    token: str,
    title: str,
    body: str,
    data: Optional[dict] = None,
) -> bool:
    """
    Standalone push send (no DB save). Useful for one-off sends.
    Returns True on success, False on failure. Never raises.
    """
    return _send_expo_push(token, title, body, data)
