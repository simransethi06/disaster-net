"""
URGENCY CLASSIFIER TRAINING SCRIPT
===================================
This script trains a machine learning model to classify alert urgency levels.

SETUP REQUIRED:
1. Install Python 3.8+
2. Install required packages: pip install pandas scikit-learn joblib numpy
3. Prepare dataset.csv with columns: text, urgency
4. Run: python train.py

The trained model will be saved as model.pkl
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

# ============================================
# CONFIGURATION
# ============================================
DATASET_PATH = 'dataset.csv'
MODEL_PATH = 'model.pkl'
VECTORIZER_PATH = 'vectorizer.pkl'
TEST_SIZE = 0.2
RANDOM_STATE = 42

def create_sample_dataset():
    """Create a sample dataset if dataset.csv doesn't exist"""
    data = {
        'text': [
            'Fire in building, people trapped, need immediate help',
            'Major earthquake detected, buildings collapsing',
            'Severe flooding in downtown area, roads blocked',
            'Traffic accident on highway, minor injuries',
            'Road closure due to construction work',
            'Power outage in residential area',
            'Storm warning issued for coastal regions',
            'Medical emergency, person unconscious',
            'Gas leak reported, evacuate area immediately',
            'Minor water pipe burst, maintenance required',
            'Tornado spotted, take shelter now',
            'Tree fallen on road, causing delay',
            'Heat wave warning for next week',
            'Lost pet in neighborhood',
            'Community event postponed due to rain',
            'Explosion at industrial site, multiple casualties',
            'Building collapse, search and rescue needed',
            'Tsunami warning, evacuate coastal areas',
            'Chemical spill on highway, area cordoned',
            'Heavy rain causing waterlogging'
        ],
        'urgency': [
            'high', 'high', 'high', 'medium', 'low',
            'low', 'medium', 'high', 'high', 'low',
            'high', 'low', 'medium', 'low', 'low',
            'high', 'high', 'high', 'high', 'medium'
        ]
    }
    
    df = pd.DataFrame(data)
    df.to_csv(DATASET_PATH, index=False)
    print(f"✓ Sample dataset created: {DATASET_PATH}")
    return df

def load_dataset():
    """Load and validate the dataset"""
    if not os.path.exists(DATASET_PATH):
        print(f"⚠️  Dataset not found. Creating sample dataset...")
        return create_sample_dataset()
    
    try:
        df = pd.read_csv(DATASET_PATH)
        
        # Validate required columns
        if 'text' not in df.columns or 'urgency' not in df.columns:
            raise ValueError("Dataset must contain 'text' and 'urgency' columns")
        
        print(f"✓ Dataset loaded: {len(df)} samples")
        print(f"  - High urgency: {len(df[df['urgency'] == 'high'])}")
        print(f"  - Medium urgency: {len(df[df['urgency'] == 'medium'])}")
        print(f"  - Low urgency: {len(df[df['urgency'] == 'low'])}")
        
        return df
    except Exception as e:
        print(f"❌ Error loading dataset: {str(e)}")
        raise

def preprocess_data(df):
    """Preprocess the text data"""
    # Remove any NaN values
    df = df.dropna()
    
    # Convert text to lowercase
    df['text'] = df['text'].str.lower()
    
    # Remove extra whitespace
    df['text'] = df['text'].str.strip()
    
    return df

def train_model(X_train, y_train):
    """Train the Random Forest classifier"""
    print("\n🔄 Training model...")
    
    # Initialize TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(
        max_features=1000,
        ngram_range=(1, 2),
        min_df=1,
        max_df=0.9
    )
    
    # Transform text to TF-IDF features
    X_train_tfidf = vectorizer.fit_transform(X_train)
    
    # Train Random Forest classifier
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=RANDOM_STATE,
        n_jobs=-1
    )
    
    clf.fit(X_train_tfidf, y_train)
    
    print("✓ Model trained successfully")
    
    return clf, vectorizer

def evaluate_model(clf, vectorizer, X_test, y_test):
    """Evaluate the trained model"""
    print("\n📊 Evaluating model...")
    
    # Transform test data
    X_test_tfidf = vectorizer.transform(X_test)
    
    # Make predictions
    y_pred = clf.predict(X_test_tfidf)
    
    # Calculate accuracy
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n✓ Accuracy: {accuracy * 100:.2f}%")
    
    # Print classification report
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    return accuracy

def save_model(clf, vectorizer):
    """Save the trained model and vectorizer"""
    try:
        joblib.dump(clf, MODEL_PATH)
        joblib.dump(vectorizer, VECTORIZER_PATH)
        print(f"\n✓ Model saved: {MODEL_PATH}")
        print(f"✓ Vectorizer saved: {VECTORIZER_PATH}")
    except Exception as e:
        print(f"❌ Error saving model: {str(e)}")
        raise

def predict_urgency(text, clf, vectorizer):
    """Test function to predict urgency of new text"""
    text_tfidf = vectorizer.transform([text.lower()])
    prediction = clf.predict(text_tfidf)[0]
    probabilities = clf.predict_proba(text_tfidf)[0]
    
    return prediction, probabilities

def main():
    """Main training pipeline"""
    print("=" * 60)
    print("DISASTERNET - URGENCY CLASSIFIER TRAINING")
    print("=" * 60)
    
    try:
        # Load dataset
        df = load_dataset()
        
        # Preprocess data
        df = preprocess_data(df)
        
        # Split features and labels
        X = df['text']
        y = df['urgency']
        
        # Split into train and test sets
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
        )
        
        print(f"\n📊 Train set: {len(X_train)} samples")
        print(f"📊 Test set: {len(X_test)} samples")
        
        # Train model
        clf, vectorizer = train_model(X_train, y_train)
        
        # Evaluate model
        accuracy = evaluate_model(clf, vectorizer, X_test, y_test)
        
        # Save model
        save_model(clf, vectorizer)
        
        # Test with sample predictions
        print("\n" + "=" * 60)
        print("SAMPLE PREDICTIONS")
        print("=" * 60)
        
        test_texts = [
            "Building on fire, people trapped!",
            "Traffic jam on highway",
            "Earthquake detected, magnitude 7.0"
        ]
        
        for text in test_texts:
            pred, probs = predict_urgency(text, clf, vectorizer)
            print(f"\nText: '{text}'")
            print(f"Predicted urgency: {pred}")
            print(f"Confidence: {max(probs) * 100:.1f}%")
        
        print("\n" + "=" * 60)
        print("✅ TRAINING COMPLETE!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Review the model performance above")
        print("2. If accuracy is low, add more training data to dataset.csv")
        print("3. Use the trained model in your backend/frontend")
        
    except Exception as e:
        print(f"\n❌ Training failed: {str(e)}")
        raise

if __name__ == "__main__":
    main()