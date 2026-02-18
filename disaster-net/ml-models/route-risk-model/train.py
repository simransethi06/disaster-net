"""
ROUTE RISK MODEL TRAINING SCRIPT
=================================
This script trains a machine learning model to predict route safety risk scores.

SETUP REQUIRED:
1. Install Python 3.8+
2. Install required packages: pip install pandas scikit-learn joblib numpy
3. Prepare dataset.csv with route features
4. Run: python train.py

The trained model will be saved as model.pkl
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib
import os

# ============================================
# CONFIGURATION
# ============================================
DATASET_PATH = 'dataset.csv'
MODEL_PATH = 'model.pkl'
SCALER_PATH = 'scaler.pkl'
TEST_SIZE = 0.2
RANDOM_STATE = 42

def create_sample_dataset():
    """Create a sample dataset if dataset.csv doesn't exist"""
    np.random.seed(42)
    
    # Generate 200 sample routes
    n_samples = 200
    
    data = {
        'distance_km': np.random.uniform(1, 100, n_samples),
        'duration_minutes': np.random.uniform(5, 180, n_samples),
        'num_high_alerts': np.random.randint(0, 5, n_samples),
        'num_medium_alerts': np.random.randint(0, 8, n_samples),
        'num_low_alerts': np.random.randint(0, 10, n_samples),
        'weather_severity': np.random.choice([0, 1, 2, 3], n_samples),  # 0=clear, 1=rain, 2=storm, 3=severe
        'time_of_day': np.random.choice([0, 1, 2], n_samples),  # 0=day, 1=evening, 2=night
        'traffic_level': np.random.choice([0, 1, 2, 3], n_samples),  # 0=light, 1=moderate, 2=heavy, 3=congested
        'road_quality': np.random.choice([0, 1, 2], n_samples),  # 0=good, 1=average, 2=poor
        'population_density': np.random.choice([0, 1, 2], n_samples),  # 0=low, 1=medium, 2=high
    }
    
    df = pd.DataFrame(data)
    
    # Calculate risk score based on features (target variable)
    df['risk_score'] = (
        df['num_high_alerts'] * 30 +
        df['num_medium_alerts'] * 15 +
        df['num_low_alerts'] * 5 +
        df['weather_severity'] * 12 +
        (df['time_of_day'] == 2) * 8 +  # Night time adds risk
        df['traffic_level'] * 5 +
        df['road_quality'] * 8 +
        (df['distance_km'] > 50) * 10 +  # Long distance adds risk
        df['population_density'] * 3 +
        np.random.normal(0, 5, n_samples)  # Add some noise
    ).clip(0, 100)  # Keep between 0-100
    
    df.to_csv(DATASET_PATH, index=False)
    print(f"✓ Sample dataset created: {DATASET_PATH}")
    print(f"  - Total samples: {len(df)}")
    print(f"  - Features: {len(df.columns) - 1}")
    print(f"  - Target: risk_score (0-100)")
    return df

def load_dataset():
    """Load and validate the dataset"""
    if not os.path.exists(DATASET_PATH):
        print(f"⚠️  Dataset not found. Creating sample dataset...")
        return create_sample_dataset()
    
    try:
        df = pd.read_csv(DATASET_PATH)
        
        # Validate required columns
        required_columns = [
            'distance_km', 'duration_minutes', 'num_high_alerts', 
            'num_medium_alerts', 'num_low_alerts', 'weather_severity',
            'time_of_day', 'traffic_level', 'road_quality', 
            'population_density', 'risk_score'
        ]
        
        missing_cols = [col for col in required_columns if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Missing required columns: {missing_cols}")
        
        print(f"✓ Dataset loaded: {len(df)} samples")
        print(f"  - Average risk score: {df['risk_score'].mean():.2f}")
        print(f"  - Risk score range: {df['risk_score'].min():.2f} - {df['risk_score'].max():.2f}")
        
        return df
    except Exception as e:
        print(f"❌ Error loading dataset: {str(e)}")
        raise

def prepare_features(df):
    """Prepare feature matrix and target vector"""
    feature_columns = [
        'distance_km', 'duration_minutes', 'num_high_alerts', 
        'num_medium_alerts', 'num_low_alerts', 'weather_severity',
        'time_of_day', 'traffic_level', 'road_quality', 'population_density'
    ]
    
    X = df[feature_columns]
    y = df['risk_score']
    
    return X, y, feature_columns

def train_model(X_train, y_train):
    """Train the Random Forest Regressor"""
    print("\n🔄 Training model...")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    
    # Train Random Forest Regressor
    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=RANDOM_STATE,
        n_jobs=-1
    )
    
    model.fit(X_train_scaled, y_train)
    
    print("✓ Model trained successfully")
    
    return model, scaler

def evaluate_model(model, scaler, X_test, y_test):
    """Evaluate the trained model"""
    print("\n📊 Evaluating model...")
    
    # Scale test data
    X_test_scaled = scaler.transform(X_test)
    
    # Make predictions
    y_pred = model.predict(X_test_scaled)
    
    # Calculate metrics
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"\n✓ Model Performance:")
    print(f"  - R² Score: {r2:.4f} (higher is better, max 1.0)")
    print(f"  - RMSE: {rmse:.2f} (lower is better)")
    print(f"  - MAE: {mae:.2f} (lower is better)")
    
    if r2 > 0.8:
        print(f"  - Quality: Excellent! ✨")
    elif r2 > 0.6:
        print(f"  - Quality: Good 👍")
    else:
        print(f"  - Quality: Needs improvement (add more data)")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': X_test.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print(f"\n📈 Top 5 Important Features:")
    for idx, row in feature_importance.head(5).iterrows():
        print(f"  {row['feature']:25s}: {row['importance']:.4f}")
    
    return y_pred, {
        'r2': r2,
        'rmse': rmse,
        'mae': mae
    }

def save_model(model, scaler):
    """Save the trained model and scaler"""
    try:
        joblib.dump(model, MODEL_PATH)
        joblib.dump(scaler, SCALER_PATH)
        print(f"\n✓ Model saved: {MODEL_PATH}")
        print(f"✓ Scaler saved: {SCALER_PATH}")
    except Exception as e:
        print(f"❌ Error saving model: {str(e)}")
        raise

def predict_risk(route_data, model, scaler):
    """Test function to predict risk for new route"""
    # Convert to DataFrame
    df = pd.DataFrame([route_data])
    
    # Scale features
    X_scaled = scaler.transform(df)
    
    # Predict
    risk_score = model.predict(X_scaled)[0]
    
    # Determine risk level
    if risk_score >= 70:
        risk_level = 'danger'
    elif risk_score >= 40:
        risk_level = 'moderate'
    else:
        risk_level = 'safe'
    
    return {
        'risk_score': round(risk_score, 2),
        'risk_level': risk_level
    }

def main():
    """Main training pipeline"""
    print("=" * 60)
    print("DISASTERNET - ROUTE RISK MODEL TRAINING")
    print("=" * 60)
    
    try:
        # Load dataset
        df = load_dataset()
        
        # Prepare features
        X, y, feature_columns = prepare_features(df)
        
        # Split into train and test sets
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
        )
        
        print(f"\n📊 Train set: {len(X_train)} samples")
        print(f"📊 Test set: {len(X_test)} samples")
        
        # Train model
        model, scaler = train_model(X_train, y_train)
        
        # Evaluate model
        y_pred, metrics = evaluate_model(model, scaler, X_test, y_test)
        
        # Save model
        save_model(model, scaler)
        
        # Test with sample predictions
        print("\n" + "=" * 60)
        print("SAMPLE PREDICTIONS")
        print("=" * 60)
        
        test_routes = [
            {
                'name': 'Safe Highway Route',
                'distance_km': 25,
                'duration_minutes': 30,
                'num_high_alerts': 0,
                'num_medium_alerts': 0,
                'num_low_alerts': 1,
                'weather_severity': 0,
                'time_of_day': 0,
                'traffic_level': 1,
                'road_quality': 0,
                'population_density': 1
            },
            {
                'name': 'Dangerous Route with Alerts',
                'distance_km': 15,
                'duration_minutes': 45,
                'num_high_alerts': 3,
                'num_medium_alerts': 2,
                'num_low_alerts': 1,
                'weather_severity': 2,
                'time_of_day': 2,
                'traffic_level': 3,
                'road_quality': 2,
                'population_density': 2
            },
            {
                'name': 'Moderate Risk Route',
                'distance_km': 40,
                'duration_minutes': 60,
                'num_high_alerts': 1,
                'num_medium_alerts': 2,
                'num_low_alerts': 3,
                'weather_severity': 1,
                'time_of_day': 1,
                'traffic_level': 2,
                'road_quality': 1,
                'population_density': 1
            }
        ]
        
        for route in test_routes:
            name = route.pop('name')
            prediction = predict_risk(route, model, scaler)
            print(f"\n{name}:")
            print(f"  Risk Score: {prediction['risk_score']}/100")
            print(f"  Risk Level: {prediction['risk_level'].upper()}")
        
        print("\n" + "=" * 60)
        print("✅ TRAINING COMPLETE!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Review the model performance above")
        print("2. If R² score < 0.7, consider adding more training data")
        print("3. Use the trained model in your backend for route risk prediction")
        print(f"4. Model files: {MODEL_PATH}, {SCALER_PATH}")
        
    except Exception as e:
        print(f"\n❌ Training failed: {str(e)}")
        raise

if __name__ == "__main__":
    main()