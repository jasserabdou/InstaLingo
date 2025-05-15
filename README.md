# InstaLingo - Real-time Translation Application

InstaLingo is a powerful web-based translation application that provides real-time language translation with speech recognition and text-to-speech capabilities. Built with Python Flask backend and modern JavaScript frontend, it offers a responsive and accessible user experience.

## Features

- **Real-time Translation**: Translate text between 10 languages with minimal delay
- **Speech Recognition**: Speak into your device's microphone and have text automatically transcribed
- **Text-to-Speech**: Listen to translated content with proper pronunciation
- **Language Detection**: Automatically detect the source language
- **Offline Support**: Basic functionality when internet connection is unavailable
- **Translation History**: Keep track of your past translations
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Toggle between light and dark themes
- **Keyboard Shortcuts**: Enhance productivity with keyboard shortcuts
- **Accessibility**: Screen reader support and ARIA attributes

## Supported Languages

- English
- Spanish
- French
- German
- Italian
- Chinese
- Japanese
- Russian
- Arabic
- Hindi

## Installation

### Prerequisites

- Python 3.10.16 installed

### Setup Instructions

1. Clone this repository:

   ```bash
   git clone https://github.com/jasserabdou/Translation-app

   cd translation-app
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:

   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install the required packages:

   ```bash
   pip install -r requirements.txt
   ```

5. Run the application:

   ```bash
   cd translation-app
   python app.py
   ```

   Alternatively, use the provided batch file:

   ```bash
   run.bat
   ```

6. Open your web browser and navigate to `http://localhost:5000`

## Usage

### Basic Translation

1. Enter text in the source language text area
2. Select source and target languages from the dropdown menus
3. Translation happens automatically as you type

### Speech Recognition

1. Click the microphone icon next to the source language selector
2. Speak clearly into your device's microphone
3. The recognized text will appear in the source text area and be translated automatically

### Text-to-Speech

1. After translation is complete, click the speaker icon next to the translated text
2. The translation will be read aloud using the browser's text-to-speech capabilities

### Keyboard Shortcuts

- `Ctrl+Enter`: Translate text
- `Ctrl+Shift+C`: Copy translation
- `Ctrl+Shift+X`: Swap languages
- `Ctrl+Shift+S`: Speak translation
- `?`: Show/hide keyboard shortcuts panel

## Project Structure

```
translation-app/
├── app.py                 # Main Flask application
├── static/
│   ├── icons/             # Application icons
│   ├── manifest.json      # PWA manifest file
│   ├── script.js          # Frontend JavaScript
│   ├── service-worker.js  # Service worker for offline functionality
│   └── style.css          # CSS styles
├── templates/
│   ├── 404.html           # 404 error page
│   ├── 500.html           # 500 error page
│   ├── index.html         # Main application page
│   └── offline.html       # Offline fallback page
└── requirements.txt       # Python dependencies
```

## Technical Architecture

InstaLingo uses a modern web architecture:

- **Backend**: Python Flask server handling translation requests
- **Translation**: Hugging Face's M2M100 model for high-quality translations
- **Frontend**: Pure JavaScript with no framework dependencies
- **PWA Support**: Service worker for offline capabilities
- **Caching**: Local storage for translation history
- **API Rate Limiting**: Prevents abuse through Flask-Limiter

## Development

### Local Development

1. Follow the installation steps above
2. Make changes to the source code
3. The Flask development server will automatically reload

### Adding New Languages

To add support for additional languages:

1. Update the `LANGUAGE_MAP` and `DETECTED_LANGUAGE_NAMES` dictionaries in `app.py`
2. Ensure the language is supported by the M2M100 model
3. Add translations for UI elements if necessary

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Flask](https://flask.palletsprojects.com/) - The web framework used
- [Hugging Face Transformers](https://huggingface.co/docs/transformers/) - For the M2M100 model
- [Material Icons](https://fonts.google.com/icons) - For UI icons
