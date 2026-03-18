import httpx

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

async def send_push_notification(tokens: list, title: str, body: str, data: dict = {}):
    if not tokens:
        return
    
    messages = [
        {
            "to": token,
            "sound": "default",
            "title": title,
            "body": body,
            "data": data,
        }
        for token in tokens if token
    ]
    
    async with httpx.AsyncClient() as client:
        try:
            await client.post(
                EXPO_PUSH_URL,
                json=messages,
                headers={"Content-Type": "application/json"}
            )
        except Exception as e:
            print(f"Push notification error: {e}")
