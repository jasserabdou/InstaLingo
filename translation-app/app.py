from flask import Flask, request, jsonify, render_template, session
from flask_cors import CORS
from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer
from langdetect import detect
import logging
from datetime import datetime
from flask_caching import Cache
import os
import secrets
import traceback

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("app.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", secrets.token_hex(16))

# Configure CORS with less restrictive settings for development
CORS(app)


# Use both IP and session for rate limiting
def get_rate_limit_key():
    return f"{get_remote_address()}:{session.get('session_id', '')}"


session_limiter = Limiter(
    app=app, key_func=get_rate_limit_key, default_limits=["200 per day", "50 per hour"]
)

cache = Cache(config={"CACHE_TYPE": "SimpleCache", "CACHE_DEFAULT_TIMEOUT": 3600})
cache.init_app(app)

# Define model variables but don't load immediately
model_name = "facebook/m2m100_418M"
model = None
tokenizer = None


# Lazy loading function for the model
def load_model():
    """
    Loads the translation model and tokenizer into global variables.

    This function initializes the global `model` and `tokenizer` variables by
    loading a pre-trained translation model and its corresponding tokenizer
    using the specified `model_name`. If the model is already loaded, the
    function does nothing. Logs the loading process and handles any exceptions
    that occur during the loading.

    Raises:
        Exception: If an error occurs while loading the model or tokenizer.
    """
    global model, tokenizer
    if model is None:
        try:
            logger.info(f"Loading model {model_name}...")
            model = M2M100ForConditionalGeneration.from_pretrained(model_name)
            tokenizer = M2M100Tokenizer.from_pretrained(model_name)
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise RuntimeError(f"Failed to load translation model: {str(e)}")


# Validate request parameters
def validate_request(text, source_lang, target_lang):
    """
    Validates the input parameters for a translation request.
    Args:
        text (str): The text to be translated. Must be a non-empty string with a maximum length of 5000 characters.
        source_lang (str): The source language code. Must be either "auto" or a valid language code present in LANGUAGE_MAP.
        target_lang (str): The target language code. Must be a valid language code present in LANGUAGE_MAP.
    Returns:
        list: A list of error messages, if any validation checks fail. Returns an empty list if all inputs are valid.
    """
    errors = []

    # Validate text
    if not text or not isinstance(text, str):
        errors.append("Text is required")
    elif len(text) > 5000:
        errors.append("Text exceeds maximum length of 5000 characters")

    # Validate target language
    if not target_lang or target_lang not in LANGUAGE_MAP:
        errors.append(f"Invalid target language: {target_lang}")

    # Validate source language (if not auto)
    if source_lang != "auto" and source_lang not in LANGUAGE_MAP:
        errors.append(f"Invalid source language: {source_lang}")

    return errors


# Map of language codes for M2M100
LANGUAGE_MAP = {
    "English": "en",
    "Spanish": "es",
    "French": "fr",
    "German": "de",
    "Italian": "it",
    "Chinese": "zh",
    "Japanese": "ja",
    "Russian": "ru",
    "Arabic": "ar",
    "Hindi": "hi",
}

# Human-readable language names for detected language codes
DETECTED_LANGUAGE_NAMES = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "zh-cn": "Chinese",
    "zh-tw": "Chinese",
    "ja": "Japanese",
    "ru": "Russian",
    "ar": "Arabic",
    "hi": "Hindi",
}


@app.route("/")
def index():
    """
    Renders the index page of the application.

    This function serves as the route handler for the main page of the
    translation application. It renders the "index.html" template and
    passes a list of available languages to the template.

    Returns:
        str: The rendered HTML content for the index page.
    """
    return render_template("index.html", languages=LANGUAGE_MAP.keys())


@app.route("/translate", methods=["POST"])
@session_limiter.limit("10/minute")
def translate():
    """
    Handles translation requests by processing input text, detecting the source language (if set to auto),
    and translating the text into the target language using a pre-trained model.
    """
    start_time = datetime.now()

    try:
        data = request.json
        if not data:
            logger.error("No JSON data received in request")
            return jsonify({"error": "No JSON data received"}), 400

        text = data.get("text", "")
        source_lang = data.get("source_lang", "auto")
        target_lang = data.get("target_lang", "English")

        logger.info(
            f"Translation request: {source_lang} -> {target_lang}, text length: {len(text)}"
        )

        # Validate request
        errors = validate_request(text, source_lang, target_lang)
        if errors:
            error_message = "; ".join(errors)
            logger.warning(f"Validation error: {error_message}")
            return jsonify({"error": error_message}), 400

        # Load model if not already loaded
        global model, tokenizer
        if model is None:
            try:
                load_model()
            except Exception as e:
                error_msg = f"Failed to load translation model: {str(e)}"
                logger.error(error_msg)
                return jsonify({"error": error_msg}), 500

        # Convert to M2M100 language codes
        target_lang_code = LANGUAGE_MAP.get(target_lang)
        if not target_lang_code:
            error_msg = f"Unknown target language: {target_lang}"
            logger.error(error_msg)
            return jsonify({"error": error_msg}), 400

        # Auto-detect source language if needed
        try:
            if source_lang == "auto":
                detected_lang_code = detect(text)
                source_lang_code = detected_lang_code
                logger.info(f"Detected language: {detected_lang_code}")
                detected_language_name = DETECTED_LANGUAGE_NAMES.get(
                    detected_lang_code, detected_lang_code
                )
            else:
                source_lang_code = LANGUAGE_MAP.get(source_lang)
                if not source_lang_code:
                    error_msg = f"Unknown source language: {source_lang}"
                    logger.error(error_msg)
                    return jsonify({"error": error_msg}), 400
                detected_language_name = None
        except Exception as e:
            logger.warning(f"Language detection failed: {str(e)}")
            source_lang_code = "en"  # Default to English if detection fails
            detected_language_name = "Unknown (defaulting to English)"

        # Perform translation
        try:
            logger.info(f"Setting source language code to: {source_lang_code}")
            tokenizer.src_lang = source_lang_code

            logger.info(f"Tokenizing input text")
            encoded = tokenizer(text, return_tensors="pt")

            logger.info(
                f"Generating translation with target language: {target_lang_code}"
            )
            generated_tokens = model.generate(
                **encoded,
                forced_bos_token_id=tokenizer.get_lang_id(target_lang_code),
                max_length=128,
            )

            logger.info("Decoding translation")
            translated_text = tokenizer.batch_decode(
                generated_tokens, skip_special_tokens=True
            )[0]

            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            logger.info(f"Translation completed in {processing_time:.2f} seconds")

            return jsonify(
                {
                    "translated_text": translated_text,
                    "detected_language": (
                        detected_language_name if source_lang == "auto" else None
                    ),
                    "processing_time": processing_time,
                }
            )
        except Exception as e:
            error_msg = f"Translation error: {str(e)}"
            logger.error(f"{error_msg}\n{traceback.format_exc()}")
            return jsonify({"error": error_msg}), 500

    except Exception as e:
        error_msg = f"Request processing error: {str(e)}"
        logger.error(f"{error_msg}\n{traceback.format_exc()}")
        return jsonify({"error": error_msg}), 400


@app.route("/keyboard-shortcuts")
def keyboard_shortcuts():
    shortcuts = {
        "Ctrl+Enter": "Translate text",
        "Ctrl+Shift+C": "Copy translation",
        "Ctrl+Shift+X": "Swap languages",
        "Ctrl+Shift+S": "Speak translation",
    }
    return jsonify(shortcuts)


@app.errorhandler(404)
def page_not_found(e):
    """
    Handles 404 errors by rendering a custom 404 error page.

    Args:
        e (Exception): The exception object representing the 404 error.

    Returns:
        tuple: A tuple containing the rendered 404 error page template and the HTTP status code 404.
    """
    return render_template("404.html"), 404


@app.errorhandler(500)
def server_error(e):
    """
    Handles server errors by logging the error and rendering a custom 500 error page.

    Args:
        e (Exception): The exception object representing the server error.

    Returns:
        tuple: A tuple containing the rendered 500 error HTML template and the HTTP status code 500.
    """
    logger.error(f"Server error: {str(e)}")
    return render_template("500.html"), 500


if __name__ == "__main__":
    app.run(debug=True)
