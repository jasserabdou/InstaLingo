# InstaLingo - Real-time Translation Application

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)

InstaLingo is a powerful web-based translation application that provides real-time language translation with speech recognition and text-to-speech capabilities. Built with a Python Flask backend and a modern JavaScript frontend, it offers a responsive and accessible user experience.

---

## Demo

> **Screenshots:** > ![Screenshot 1](imgs/Screenshot%202025-05-17%20144445.png) > ![Screenshot 2](imgs/Screenshot%202025-05-17%20144617.png)

---

## Features

- **Real-time Translation:** Translate text between 10 languages instantly
- **Speech Recognition:** Speak into your device's microphone for automatic transcription
- **Text-to-Speech:** Listen to translated content with natural pronunciation
- **Language Detection:** Automatically detect the source language
- **Offline Support:** Basic functionality when offline (PWA)
- **Translation History:** View and manage your past translations
- **Responsive Design:** Works on desktop and mobile devices
- **Dark Mode:** Toggle between light and dark themes
- **Keyboard Shortcuts:** Boost productivity with handy shortcuts
- **Accessibility:** Screen reader support and ARIA attributes

---

## Supported Languages

- English, Spanish, French, German, Italian, Chinese, Japanese, Russian, Arabic, Hindi

---

## Project Structure

```
InstaLingo/
├── Backend/
│   ├── app.py                # Flask backend
│   ├── requirements.txt      # Python dependencies
│   └── app.log               # Backend logs
├── Fortend/
│   ├── public/               # Static assets (HTML, icons, manifest)
│   ├── src/                  # React components, hooks, pages, services, utils
│   ├── package.json          # Frontend dependencies
│   └── README.md             # Frontend-specific docs
├── imgs/                     # Screenshots and images
├── run.bat                   # Windows startup script
├── README.md                 # Project documentation
└── ...
```

---

## Technical Architecture

- **Backend:** Python Flask server handling translation requests
- **Translation:** Hugging Face's M2M100 model for high-quality translations
- **Frontend:** Pure JavaScript (React) with no framework dependencies
- **PWA Support:** Service worker for offline capabilities
- **Caching:** Local storage for translation history
- **API Rate Limiting:** Prevents abuse through Flask-Limiter

---

## Installation

### Prerequisites

- Python 3.10.16+
- Node.js & npm (for frontend)

### Backend Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/jasserabdou/Translation-app
   cd InstaLingo/Backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # or
   source venv/bin/activate  # On macOS/Linux
   ```
3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   python app.py
   ```

### Frontend Setup

1. In a new terminal, go to the frontend directory:
   ```bash
   cd ../Fortend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:

   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000` (frontend) and `http://localhost:5000` (backend API).

---

## Usage

### Basic Translation

1. Enter text in the source language area
2. Select source and target languages
3. Translation happens automatically as you type

### Speech Recognition

1. Click the microphone icon next to the source language selector
2. Speak clearly into your device's microphone
3. The recognized text will appear and be translated automatically

### Text-to-Speech

1. After translation, click the speaker icon next to the translated text
2. The translation will be read aloud using your browser's text-to-speech

### Keyboard Shortcuts

- `Ctrl+Enter`: Translate text
- `Ctrl+Shift+C`: Copy translation
- `Ctrl+Shift+X`: Swap languages
- `Ctrl+Shift+S`: Speak translation
- `?`: Show/hide keyboard shortcuts panel

---

## Troubleshooting

- **Port Conflicts:** Ensure ports 3000 (frontend) and 5000 (backend) are free.
- **CORS Issues:** If you encounter CORS errors, check that both servers are running and configured correctly.
- **Model Download:** The first run may take longer as the translation model downloads.
- **Speech Features:** Ensure your browser supports Web Speech API for speech recognition and synthesis.

---

## Development

1. Follow the installation steps above
2. Make changes to the source code in `Backend/` or `Fortend/src/`
3. The development servers will auto-reload on changes

### Adding New Languages

1. Update the `LANGUAGE_MAP` and `DETECTED_LANGUAGE_NAMES` in `Backend/app.py`
2. Ensure the language is supported by the M2M100 model
3. Add UI translations if needed

---

## Contributing

Contributions are welcome! Please submit a Pull Request:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

- [Flask](https://flask.palletsprojects.com/) - The web framework used
- [Hugging Face Transformers](https://huggingface.co/docs/transformers/) - For the M2M100 model
- [Material Icons](https://fonts.google.com/icons) - For UI icons
