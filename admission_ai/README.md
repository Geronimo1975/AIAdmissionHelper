# Medical University Admission AI Platform

An AI-powered medical university admission counseling platform with multi-channel communication and CRM integration.

## Features

- 🤖 AI-powered admission counseling
- 💬 Multi-channel communication (Web, WhatsApp, Voice)
- 📝 Document management and evaluation
- 🎥 Video interviews with AI analysis
- 📊 CRM integration with Salesforce
- 🌐 Multi-language support
- 📅 Automated interview scheduling

## Project Structure

```
admission_ai/
├── requirements.txt      # Project dependencies
├── config/              # Configuration files
├── src/                 # Source code
│   ├── app.py          # Main application
│   ├── auth.py         # Authentication
│   ├── models.py       # Database models
│   ├── database.py     # Database configuration
│   ├── chatbot.py      # AI chatbot
│   ├── whatsapp_bot.py # WhatsApp integration
│   ├── voice_bot.py    # Voice bot
│   └── tests/          # Unit tests
├── templates/          # HTML templates
└── uploads/           # Document storage
```

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
OPENAI_API_KEY=your_key
DATABASE_URL=your_db_url
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
SALESFORCE_API_KEY=your_key
```

3. Run the application:
```bash
python src/app.py
```

4. Run tests:
```bash
pytest
```

## Contributing

1. Follow PEP 8 style guide
2. Write tests for new features
3. Update documentation as needed

## License

MIT License
