A machine learning project exploring how to detect fraud in heavily imbalanced data, built on a public Kaggle dataset of 1.3M credit card transactions where only 0.58% are fraudulent. The full pipeline lives in a Jupyter notebook (EDA, preprocessing, feature selection, resampling, hyperparameter tuning, and evaluation), and the trained models ship in a Streamlit app that scores individual transactions and explains each prediction with SHAP.

## Features

- End-to-end notebook pipeline: EDA, preprocessing, feature selection, resampling, tuning, evaluation
- SMOTE + Tomek Links resampling on the training split only, with a time-based train/validation/test split to prevent leakage
- Random Forest, AdaBoost, and XGBoost compared, tuned with Optuna to optimize F1 on the fraud class
- SHAP-driven feature analysis that fed back into feature engineering
- Streamlit app with an interactive fraud checker, per-prediction TreeSHAP waterfall explanations, and EDA/model-comparison charts
- Dockerized deployment that ships model bundles and precomputed aggregates instead of the full dataset

## Implementation details

Exploratory analysis surfaced the patterns the models end up leaning on: fraudulent transactions have a far higher median amount than genuine ones ($396 vs. $47) and cluster in late-night hours. Permutation importance narrowed the feature set to merchant category, log-transformed amount, gender, city population, cardholder age, and hour of day. Three tree-based models (Random Forest, AdaBoost, and XGBoost) were tuned with Optuna to maximize F1 on the fraud class and compared on a held-out test set.

### Class imbalance and leakage-safe evaluation

With 99.4% genuine transactions, a model that never predicts fraud scores 99.4% accuracy, so accuracy is nearly meaningless here. The imbalance is handled with combined SMOTE oversampling and Tomek Links undersampling, applied to the training split only so no synthetic samples leak into evaluation. The train/validation/test split is done by time rather than randomly: the test set is the most recent ~2 months of transactions (150,481 rows, 948 fraud) that the models never saw, mimicking how a fraud model actually gets deployed against future data. On that test set Random Forest reached 0.959 precision / 0.800 recall (F1 0.872) and XGBoost 0.887 / 0.841 (F1 0.863), while AdaBoost fell far behind at 0.379 F1.

### Explaining predictions with SHAP

SHAP is used in both directions: in the notebook, beeswarm plots of TreeSHAP values are compared against XGBoost's built-in importances, which revealed that gender contributed little on its own and motivated engineering a combined gender-age feature. In the Streamlit app, every XGBoost prediction comes with a live waterfall chart of exact TreeSHAP contributions in log-odds, showing which inputs pushed the transaction toward fraud or genuine. The app itself ships only the small serialized model bundles and precomputed EDA aggregates — never the raw CSV — and runs in Docker.
