import sys
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix
import seaborn as sns

# Charger les données des joueurs et des blessures
players = pd.read_excel('injuryDB.joueurs.xlsx')
injuries = pd.read_excel('1.xlsx')

# Fusionner les deux dataframes sur player_id
data = pd.merge(players, injuries, left_on='name', right_on='player_id')

# Initialiser les encodeurs de labels
position_encoder = LabelEncoder()
team_encoder = LabelEncoder()
nationality_encoder = LabelEncoder()

# Convertir les colonnes catégorielles en numériques
data['position'] = position_encoder.fit_transform(data['position'])
data['team'] = team_encoder.fit_transform(data['team'])
data['nationality'] = nationality_encoder.fit_transform(data['nationality'])
data['type'] = data['type'].astype('category').cat.codes

# Définir les caractéristiques et la cible
features = data[['age', 'position', 'team', 'nationality']]
target = data['type']

# Créer un RandomForestClassifier et l'adapter aux données
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(features, target)

# Vérifier si le nombre d'arguments de ligne de commande est suffisant
if len(sys.argv) == 5:
    try:
        # Convertir les arguments de ligne de commande appropriés en types nécessaires
        position = position_encoder.transform([sys.argv[1]])[0]
        team = team_encoder.transform([sys.argv[2]])[0]
        nationality = nationality_encoder.transform([sys.argv[3]])[0]
        age = int(sys.argv[4])

        # Prédire le type de blessure pour les nouvelles données
        prediction = clf.predict_proba([[age, position, team, nationality]])

        # Afficher la matrice de confusion
        cm = confusion_matrix(target, clf.predict(features))
        plt.figure(figsize=(10,7))
        sns.heatmap(cm, annot=True)
        plt.xlabel('Prédit')
        plt.ylabel('Réel')
        plt.show()

        print(prediction[0][1])  # Imprimer la probabilité de la classe positive

    except ValueError:
        print("Les arguments de ligne de commande ne sont pas valides.")
else:
    print("Veuillez fournir les arguments de ligne de commande nécessaires :")
    print("position du joueur, nom de l'équipe, nationalité du joueur, âge du joueur.")
