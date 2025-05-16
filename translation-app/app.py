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
import torch
import time
from functools import lru_cache

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

# Configure cache with more advanced settings
cache_config = {
    "CACHE_TYPE": "SimpleCache",
    "CACHE_DEFAULT_TIMEOUT": 3600,
    "CACHE_THRESHOLD": 1000,  # Maximum number of items the cache will store
}
cache = Cache(config=cache_config)
cache.init_app(app)

# Define model variables but don't load immediately
model_name = "facebook/m2m100_418M"
model = None
tokenizer = None
model_loaded_time = None
MODEL_MAX_AGE = 3600  # Unload model after 1 hour of inactivity to save memory

# Track last usage time for model unloading
last_model_usage = time.time()


# Lazy loading function for the model with quantization
def load_model():
    """
    Loads the translation model and tokenizer into global variables with optimization.

    This implementation adds model quantization to reduce memory usage and improve
    performance. It also implements a model lifecycle management system to unload
    the model after a period of inactivity.
    """
    global model, tokenizer, model_loaded_time, last_model_usage
    if model is None:
        try:
            logger.info(f"Loading model {model_name}...")
            start_time = time.time()

            # Load model with quantization for reduced memory usage
            model = M2M100ForConditionalGeneration.from_pretrained(model_name)

            # Apply quantization if running on CPU (quantized models run faster on CPU)
            if not torch.cuda.is_available():
                logger.info("Applying model quantization to optimize CPU usage")
                model = torch.quantization.quantize_dynamic(
                    model, {torch.nn.Linear}, dtype=torch.qint8
                )

            tokenizer = M2M100Tokenizer.from_pretrained(model_name)
            load_time = time.time() - start_time
            model_loaded_time = time.time()
            logger.info(f"Model loaded successfully in {load_time:.2f} seconds")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise RuntimeError(f"Failed to load translation model: {str(e)}")

    # Update last usage time
    last_model_usage = time.time()
    return model, tokenizer


def check_model_timeout():
    """Unload model if it hasn't been used for the maximum age period"""
    global model, tokenizer
    if model is not None and time.time() - last_model_usage > MODEL_MAX_AGE:
        logger.info(f"Unloading model due to inactivity ({MODEL_MAX_AGE} seconds)")
        model = None
        tokenizer = None
        torch.cuda.empty_cache() if torch.cuda.is_available() else None


# Add LRU cache for recent translations to avoid recomputing the same translations
@lru_cache(maxsize=100)
def cached_translate(text, source_lang_code, target_lang_code):
    """Cache translation results for frequently requested text"""
    global model, tokenizer

    # Ensure model is loaded
    if model is None:
        load_model()

    # Set source language
    tokenizer.src_lang = source_lang_code

    # Tokenize
    encoded = tokenizer(text, return_tensors="pt")

    # Generate translation with more efficient parameters
    generated_tokens = model.generate(
        **encoded,
        forced_bos_token_id=tokenizer.get_lang_id(target_lang_code),
        max_length=min(128, len(text) + 50),  # Adaptive max length
        num_beams=2 if len(text) > 100 else 4,  # Adaptive beam search
        early_stopping=True,
    )

    # Decode translation
    translated_text = tokenizer.batch_decode(
        generated_tokens, skip_special_tokens=True
    )[0]

    return translated_text


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
@cache.cached(timeout=600, key_prefix=lambda: f"translate_{str(request.json).strip()}")
def translate():
    """
    Handles translation requests by processing input text, detecting the source language (if set to auto),
    and translating the text into the target language using a pre-trained model.
    Added caching and performance optimizations.
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

        # Check model timeout on each request
        check_model_timeout()

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

        # Perform translation with caching
        try:
            # Use the cached translation function
            translated_text = cached_translate(text, source_lang_code, target_lang_code)

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


# Add new endpoint to get model status
@app.route("/api/model-status", methods=["GET"])
def model_status():
    """Return current status of the translation model"""
    global model, model_loaded_time

    if model is None:
        status = "unloaded"
        load_time = None
    else:
        status = "loaded"
        load_time = model_loaded_time

    return jsonify(
        {
            "status": status,
            "load_time": load_time,
            "last_used": last_model_usage if model is not None else None,
            "memory_usage": (
                f"{torch.cuda.memory_allocated() / 1024**2:.2f}MB"
                if torch.cuda.is_available()
                else "N/A"
            ),
        }
    )


# Add endpoint to get available languages with codes
@app.route("/api/languages", methods=["GET"])
def get_languages():
    """Return available languages for translation"""
    return jsonify(
        {
            "languages": [{"name": k, "code": v} for k, v in LANGUAGE_MAP.items()],
            "detected_languages": DETECTED_LANGUAGE_NAMES,
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
