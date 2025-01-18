from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__, template_folder='../../templates')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        message = request.json.get('message')
        user_id = request.json.get('userId')
        # Chat functionality will be implemented using OpenAI integration
        return jsonify({"message": "Chat endpoint ready"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
