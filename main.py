import asyncio
import json
import random
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Energy & Overtake AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Decision Engine Logic
def evaluate_race_strategy(speed, gap, soc, tyre, closing_speed):
    """
    Constrained ML / Optimizer Logic:
    - Calculates Overtake Opportunity, Risk Score, and Energy Demand.
    - Decides ACTION: ATTACK, HOLD, or SAVE.
    """
    overtake_prob = min(99, max(10, int((closing_speed * 3) + (soc * 0.4) - (gap * 20))))
    risk_score = min(90, max(5, int((gap * 15) + (100 - tyre) * 0.3)))
    energy_req = min(80, max(10, int(closing_speed * 1.5)))

    # Decision Matrix
    if overtake_prob >= 75 and soc > 40:
        action = "ATTACK"  # Full screen glows RED
        confidence = random.randint(85, 98)
        deployment = random.randint(60, 90)
    elif overtake_prob < 40 or soc <= 25:
        action = "SAVE"    # Full screen glows GREEN
        confidence = random.randint(70, 90)
        deployment = random.randint(10, 30)
    else:
        action = "HOLD"    # Full screen glows YELLOW
        confidence = random.randint(60, 80)
        deployment = random.randint(35, 55)

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
        "deployment": deployment
    }

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    # Starting Baseline Variables
    speed = 280
    gap = 0.55
    soc = 72
    tyre = 81
    
    try:
        while True:
            # Simulate dynamic telemetry changes every 0.5 seconds
            speed = max(200, min(330, speed + random.randint(-4, 5)))
            gap = max(0.1, min(2.5, gap + random.uniform(-0.05, 0.04)))
            soc = max(10, min(100, soc + random.choice([-1, 0, 1])))
            tyre = max(20, tyre - 0.01)
            closing_speed = random.randint(5, 20)

            # Compute AI Decision
            telemetry_data = evaluate_race_strategy(
                speed, gap, int(soc), int(tyre), closing_speed
            )

            # Send real-time payload to dashboard UI
            await websocket.send_text(json.dumps(telemetry_data))
            await asyncio.sleep(0.5) # 0.5-second interval stream
            
    except Exception as e:
        print(f"Client Disconnected: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)