import asyncio
import json
import random

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="TrackShift AI Engine")

# Allow frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================
# AI STRATEGY ENGINE
# ==============================

def evaluate_race_strategy(speed, gap, soc, tyre, closing_speed):

    # Overtake probability
    overtake_prob = min(
        99,
        max(
            5,
            int(
                (closing_speed * 3)
                + (soc * 0.4)
                - (gap * 20)
                - ((100 - tyre) * 0.1)
            )
        )
    )

    # Risk calculation
    risk_score = min(
        95,
        max(
            5,
            int(
                (gap * 15)
                + ((100 - tyre) * 0.4)
                - (closing_speed * 0.5)
            )
        )
    )

    # Energy requirement
    energy_req = min(
        80,
        max(
            10,
            int(closing_speed * 1.5)
        )
    )

    # Decision
    if overtake_prob >= 75 and soc > 40 and risk_score < 50:

        action = "ATTACK"
        confidence = random.randint(85, 98)
        deployment = random.randint(60, 90)

    elif overtake_prob < 40 or soc <= 25:

        action = "SAVE"
        confidence = random.randint(75, 92)
        deployment = random.randint(10, 30)

    else:

        action = "HOLD"
        confidence = random.randint(65, 85)
        deployment = random.randint(35, 55)

    # Reasons
    reasons = []

    if closing_speed >= 12:
        reasons.append(f"High closing speed (+{closing_speed} km/h)")
    else:
        reasons.append(f"Low closing speed (+{closing_speed} km/h)")

    if gap <= 0.8:
        reasons.append(f"Close gap ({gap:.2f}s)")
    else:
        reasons.append(f"Large gap ({gap:.2f}s)")

    if soc >= 60:
        reasons.append(f"Healthy energy reserve ({soc}%)")
    else:
        reasons.append(f"Limited energy reserve ({soc}%)")

    if tyre >= 70:
        reasons.append(f"Healthy tyre condition ({tyre}%)")
    else:
        reasons.append(f"Tyre degradation detected ({tyre}%)")

    if risk_score < 30:
        reasons.append("Low risk overtaking window")
    else:
        reasons.append("Elevated overtaking risk")

    return {
        "speed": speed,
        "gap": round(gap, 2),
        "closing_speed": closing_speed,
        "soc": soc,
        "tyre": tyre,

        "overtake_prob": overtake_prob,
        "risk_score": risk_score,
        "energy_req": energy_req,

        "action": action,
        "confidence": confidence,
        "deployment": deployment,

        "reasons": reasons
    }


# ==============================
# WEBSOCKET TELEMETRY
# ==============================

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):

    await websocket.accept()

    speed = 284
    gap = 0.55
    soc = 72
    tyre = 81

    print("Telemetry client connected")

    try:

        while True:

            # Simulate live telemetry
            speed += random.randint(-4, 5)
            speed = max(200, min(330, speed))

            gap += random.uniform(-0.05, 0.04)
            gap = max(0.1, min(2.5, gap))

            soc += random.choice([-1, 0, 0, 1])
            soc = max(10, min(100, soc))

            tyre -= random.uniform(0.01, 0.08)
            tyre = max(20, tyre)

            closing_speed = random.randint(5, 20)

            # AI calculation
            data = evaluate_race_strategy(
                speed,
                gap,
                int(soc),
                int(tyre),
                closing_speed
            )

            # Send JSON to browser
            await websocket.send_text(
                json.dumps(data)
            )

            # Update every 0.5 second
            await asyncio.sleep(0.5)

    except Exception as e:

        print("Telemetry client disconnected:", e)


# ==============================
# START SERVER
# ==============================

# if __name__ == "__main__":

#     import uvicorn

#     uvicorn.run(
#         app,
#         host="127.0.0.1",
#         port=8000,
#         reload=True
#     )