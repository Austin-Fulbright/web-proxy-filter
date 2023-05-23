import nltk
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import pickle
import requests
from bs4 import BeautifulSoup
import re
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from nltk.tokenize import word_tokenize
import string



nltk.download('punkt')
nltk.download('stopwords')

def fetch_content(domain):
    print("--------")
    print(domain)
    if not domain.startswith(('http://', 'https://')):
        domain = 'http://' + domain
    response = requests.get(domain)

    soup = BeautifulSoup(response.text, 'html.parser')
    for script in soup(["script", "style"]):  
        script.extract()

    text = soup.get_text()  

   
    text = re.sub('\s+', ' ', text)

    return text


def preprocess(content):

    content = content.lower()
    
    content = content.translate(str.maketrans('', '', string.punctuation))
    
    tokenized_content = word_tokenize(content)
    

    stop_words = set(stopwords.words('english'))
    tokenized_content = [word for word in tokenized_content if word not in stop_words]
    

    porter = PorterStemmer()
    tokenized_content = [porter.stem(word) for word in tokenized_content]
    

    return ' '.join(tokenized_content)

def read_domains_from_file(filename):
    with open(filename, 'r') as f:
        return [line.strip() for line in f]

whitelist_domains = read_domains_from_file('../whitelist.txt')
blacklist_domains = read_domains_from_file('../blacklist.txt')


whitelist_content = [preprocess(fetch_content(domain)) for domain in whitelist_domains]
blacklist_content = [preprocess(fetch_content(domain)) for domain in blacklist_domains]


labels = [1]*len(whitelist_content) + [0]*len(blacklist_content)


all_content = whitelist_content + blacklist_content


vectorizer = CountVectorizer()
features = vectorizer.fit_transform(all_content)



features_train, features_test, labels_train, labels_test = train_test_split(features, labels, test_size=0.2, random_state=1)


model = MultinomialNB()
model.fit(features_train, labels_train)


predictions = model.predict(features_test)
print(classification_report(labels_test, predictions))


with open('trained_model.pkl', 'wb') as f:
    pickle.dump(model, f)

with open('vectorizer.pkl', 'wb') as f:
    pickle.dump(vectorizer, f)
