# Prayer Room - Design Document

## Vision

Application iPhone legere et belle, dediee aux chretiens qui veulent structurer leurs temps de priere avec des alarmes recurrentes, des versets bibliques thematiques et un environnement sans distraction.

## V1.0 (TestFlight)

### Alarmes recurrentes
- Intervalle personnalisable : 30 min, 40 min, 1h, 1h30, 2h, ou custom
- Plage horaire optionnelle (ex: 6h-22h)
- Une seule configuration = toutes les alarmes auto-generees

### Audio (3 sources)
1. **Sonneries natives iOS** - sons systeme du telephone
2. **Bibliotheque integree** - selection de musiques worship/louange incluses dans l'app
3. **Import depuis le telephone** - fichiers audio personnels via Document Picker
- L'alarme dure le temps de la musique choisie (ou duree par defaut si sonnerie courte)

### Versets bibliques
- 5 packs integres (~20-30 versets chacun) :
  - Guerison - versets sur la sante et la guerison divine
  - Encouragement - se fortifier, courage, perseverance
  - Prosperite - benedictions financieres, provision
  - Foi - confiance en Dieu, croire sans voir
  - Protection - securite, refuge, delivrance
- Packs telechargeables depuis un CDN
- Creation de packs personnalises par l'utilisateur
- Un verset different affiche a chaque alarme (rotation)

### Mode Focus "Priere"
- Guide integre pour creer un Focus iOS "Priere"
- Bouton dans l'app pour rappeler d'activer le Focus
- Lien direct vers les reglages Focus d'iOS

### Ecrans principaux
1. **Accueil** - liste des alarmes actives, prochaine alarme, verset du moment
2. **Creer/Editer une alarme** - intervalle, source audio, pack de versets, plage horaire
3. **Packs de versets** - packs integres + telechargeables + creation perso
4. **Ecran d'alarme** - s'affiche quand l'alarme sonne : verset biblique + controles
5. **Reglages** - theme sombre/clair, Focus "Priere", don de soutien

### Theme
- Mode sombre (fond noir, accents dores/chauds)
- Mode clair (fond blanc, couleurs douces)
- Bascule dans les reglages

### Don de soutien
- Tip Jar via In-App Purchase Apple (optionnel)
- Ecran accessible au premier lancement et dans les reglages

## V1.1 (Mise a jour)

- **Blocage d'apps** via Screen Time API (FamilyControls)
- **Compte utilisateur** + authentification
- **Synchronisation cloud** (packs, preferences, alarmes)

## Stack technique

| Couche | Techno |
|--------|--------|
| Framework | React Native + Expo (SDK 52+) |
| Navigation | Expo Router |
| Alarmes/Notifications | Expo Notifications |
| Audio | Expo AV |
| Import fichiers | Expo Document Picker |
| Stockage local | AsyncStorage |
| Packs distants | JSON sur CDN (GitHub Pages) |
| Build & distribution | EAS Build + TestFlight |
| In-App Purchase | react-native-iap |
| V1.1 - Screen Time | Module natif Swift (FamilyControls) |
| V1.1 - Backend | Supabase (auth + BDD + storage) |

## Distribution
- TestFlight d'abord (cercle restreint)
- App Store ensuite
- Don optionnel au telechargement (pas obligatoire)

## Hors scope V1
- Android (version ulterieure)
- Activation automatique du DND systeme
