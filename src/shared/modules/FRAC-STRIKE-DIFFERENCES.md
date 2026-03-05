# Différences entre frac-strike 5e et 3e

Après analyse des deux implémentations, les différences sont trop importantes pour fusionner en un module partagé.

## Différences majeures

### Engine (engine.js)
- **Niveaux** : 5e a 3 niveaux, 3e a 4 niveaux
- **Relatifs** : 3e supporte les nombres négatifs (negativePct dans les niveaux 2-4), pas 5e
- **Fonctions** : 3e a smallestPrimeFactor() et système de deck Fisher-Yates, 5e plus simple
- **Structure** : 3e utilise LEVELS objet, 5e utilise array

### Composant principal (FracStrike.jsx)
- **State** : Structure différente (5e: currentNum/currentDen, 3e: fraction object)
- **Logique** : 3e gère les négatifs et la complétion de fractions, 5e plus simple
- **Nombre de fichiers** : ~450 lignes chacun mais logique différente

### Composants UI
- **Chain.jsx** : Affichage différent (5e vs 3e)
- **Fraction.jsx** : Gestion des négatifs en 3e
- **Keypad.jsx** : Boutons et layout différents
- **CompletionInput.jsx** : Logique de validation différente

## Conclusion

**Statut** : Modules séparés maintenus  
**Raison** : Différences pédagogiques (3e introduit les relatifs) et logique métier trop divergente

Refactorisation possible future : extraire uniquement les utilitaires communs (gcd, shuffle) dans shared/utils/
