
import sys
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer


def predict(domain):
 
    content = fetch_and_preprocess(domain)


    with open('trained_model.pkl', 'rb') as f:
        model = pickle.load(f)

 
    features = TfidfVectorizer.transform([content])


    prediction = model.predict(features)

    return prediction

if __name__ == "__main__":
    domain = sys.argv[1]
    prediction = predict(domain)
    print(f"Website {domain} has been predicted to {'not' if prediction == 0 else ''} be in the whitelist")
