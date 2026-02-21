# AFP Caption Engine v8.11

Moteur exécutable du protocole de légendes AFP (Agence France-Presse).

## 🚀 Fonctionnalités

- ✅ **Protocole compilé** - Version 8.11 complète en format exécutable
- ✅ **Mode général** - Checklist 13 points pour toutes les légendes
- ✅ **Mode sports** - Checklist 10 points + templates automatiques
- ✅ **Mode template** - Génération de templates non-sports
- ✅ **Commandes intégrées** - on/off, sport on/out, check, 2, etc.
- ✅ **Attribution L/R** - Gestion automatique des positions
- ✅ **Recherche contexte** - Commande `check` simulée
- ✅ **Interface web** - Utilisation intuitive

## 📋 Commandes principales

| Commande | Description |
|----------|-------------|
| `on YYYY-MM-DD` | Active une session avec date |
| `off` | Désactive la session |
| `sport on [date]` | Active le mode sports |
| `sport status` | Affiche le statut mode sports |
| `match [A] vs [B]` | Génère template match |
| `training [team]` | Génère template entraînement |
| `presser [team]` | Génère template conf presse |
| `template` | Active le mode template |
| `out` | Sort du mode actuel |
| `check` | Recherche contexte en ligne |
| `2 [texte]` | Traduction brute fidèle |
| `change` | Régénère avec date session |
| `reset` | Reset tous les états |
| `help` | Affiche l'aide |

## 🎯 Checklist générale (13 points)

1. **PERSONNES** - Qualité AVANT le nom pour chaque personne
2. **ORGANISATIONS** - Descripteur présent pour chaque organisation
3. **ENTREPRISES** - Minuscules (sauf acronymes IBM, SNCF)
4. **ATTRIBUTION L/R** - Compter et appliquer la règle
5. **VERBE** - Présent et conjugué correctement
6. **SPORT** - Nom explicite si contexte sportif
7. **STADE** - Recherche automatique, tiret si défunt
8. **ÉCHAUFFEMENT** - "takes part in warm-up" (jamais "pictured")
9. **PRÉCISION RÉGIONALE** - À préserver (eastern France)
10. **PARTIS POLITIQUES** - Jamais traduits + abréviation
11. **STRUCTURE** - Lieu + date à la fin
12. **FORMAT DATE** - "Month Day, Year" (sans jour)
13. **ASCII** - Tirets -, apostrophes ', guillemets "

## ⚽ Mode sports - Checklist 10 points

1. Nom du sport explicite
2. Format possessif: [Club]'s [player]
3. Attribution spécifique
4. Qualité avant nom
5. Stade officiel + dash si défunt
6. Compétition officielle
7. Échauffement: "takes part in warm-up"
8. Célébrations: "his team's Xth goal"
9. Structure: location + date à la fin
10. Numéros maillots préservés (#10)

## 📝 Mode template non-sports

- Commence toujours par `xxxxxx`
- Date session par défaut
- Pas de noms de non-photographiés
- Contexte judiciaire: "arrives at courthouse"
- Conférences presse: lien avec prochain match

## 🔧 Installation

1. Clonez le repository
2. Ouvrez `index.html` dans un navigateur
3. Commencez par `on 2026-02-21` pour activer une session

```bash
git clone https://github.com/votre-compte/afp-caption-engine
cd afp-caption-engine
# Ouvrez index.html