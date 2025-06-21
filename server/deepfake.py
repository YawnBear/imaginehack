import requests
import json
import time

dIDAPI = "ZGx0eXgwNEBnbWFpbC5jb20:Ss06R0hEqan93gdM9IhUx"
imageUrl = "https://imaginehack.vercel.app/tun1.png"
textInput = "Greetings! I'm Tun V. T. Sambanthan, a founding father of Malaysia and former MIC president. I am delighted to meet you and share our journey toward unity."

urlGenerate = "https://api.d-id.com/talks"
headers = {
    "accept": "application/json",
    "content-type": "application/json",
    "authorization": f"Basic {dIDAPI}"
}

payload = {
    "source_url": imageUrl,
    "script": {
        "type": "text",
        "input": textInput,
        "provider": {
            "type": "microsoft",
            "voice_id": "en-IN-PrabhatNeural"
        },
        "ssml": False
    },
    "config": {
        "fluent": False
    }
}

response = requests.post(urlGenerate, headers=headers, data=json.dumps(payload))
data = response.json()
talkId = data.get("id")
print("SENDING DATA")
print("Status:", response.status_code)
print("Response:", response.json())
print("RECEIVED DATA")
print("talkid = ", talkId)

videoUrl = None
urlGet = f"https://api.d-id.com/talks/{talkId}"

print("Waiting for video to be ready...")

while True:
    status_response = requests.get(urlGet, headers=headers)
    status_data = status_response.json()
    status = status_data.get("status")
    print("Status:", status)

    if status == "done":
        video_url = status_data.get("result_url")
        audio_url = status_data.get("audio_url")
        break
    elif status == "error":
        print("Error:", status_data)
        break
    # time.sleep(1)



#download video
if video_url:
    video_response = requests.get(video_url, stream=True)
    with open("output.mp4", "wb") as f:
        for chunk in video_response.iter_content(chunk_size=8192):
            f.write(chunk)
    print("Video downloaded as output.mp4")

else:
    print("No video URL found.")

#download audio
if audio_url:
    audio_response = requests.get(audio_url, stream=True)
    with open("output.mp3", "wb") as f:
        for chunk in audio_response.iter_content(chunk_size=8192):
            f.write(chunk)
    print("Audio downloaded as output.mp3")
else:
    print("No audio URL found.")