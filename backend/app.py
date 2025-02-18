from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
import speech_recognition as sr
from googletrans import Translator, LANGUAGES
from gtts import gTTS
import os

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize translator
translator = Translator()

@app.route('/')
def home():
    return "Speech-to-Speech Translation Server is Running!"

# Speech-to-Text route
@app.route('/speech-to-text', methods=['POST'])
def speech_to_text():
    try:
        # Get audio file from the request
        audio_file = request.files['file']
        recognizer = sr.Recognizer()

        with sr.AudioFile(audio_file) as source:
            audio = recognizer.record(source)
            text = recognizer.recognize_google(audio)
        
        return jsonify({"text": text})

    except Exception as e:
        return jsonify({"error": str(e)})

# Translation route
@app.route('/translate', methods=['POST'])
def translate_text():
    data = request.json
    text = data.get('text')
    target_lang = data.get('target_lang')

    try:
        translated = translator.translate(text, dest=target_lang).text
        return jsonify({"translated_text": translated})
    
    except Exception as e:
        return jsonify({"error": str(e)})

# Text-to-Speech route
@app.route('/text-to-speech', methods=['POST'])
def text_to_speech():
    data = request.json
    text = data.get('text')
    language = data.get('language')

    try:
        tts = gTTS(text=text, lang=language)
        tts.save("output.mp3")
        return jsonify({"audio_url": "output.mp3"})

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
