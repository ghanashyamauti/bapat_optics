import time
from collections import defaultdict, deque
from uuid import uuid4
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

class SecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = 120, window: int = 60):
        super().__init__(app); self.limit = limit; self.window = window; self.hits = defaultdict(deque)

    async def dispatch(self, request, call_next):
        now = time.monotonic(); key = request.client.host if request.client else "unknown"; q = self.hits[key]
        while q and now - q[0] > self.window: q.popleft()
        if len(q) >= self.limit:
            return JSONResponse({"detail": "Too many requests"}, status_code=429, headers={"Retry-After": str(self.window)})
        q.append(now)
        response = await call_next(request)
        response.headers["X-Request-ID"] = str(uuid4())
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response
