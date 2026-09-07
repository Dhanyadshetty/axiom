"use client";

import { createContext, useContext, useState, useEffect } from 'react';

export type Locale = 'en' | 'de' | 'fr' | 'it' | 'pl' | 'sk' | 'zh' | 'es';

const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
  pl: 'Polski',
  sk: 'Slovenščina',
  zh: '中文',
  es: 'Español',
};

const flagIcons: Record<Locale, string> = {
  en: '🇬🇧',
  de: '🇩🇪',
  fr: '🇫🇷',
  it: '🇮🇹',
  pl: '🇵🇱',
  sk: '🇸🇰',
  zh: '🇨🇳',
  es: '🇪🇸',
};

const LOCALE_STORAGE_KEY = 'preferred-locale';

const translations = {
  en: {
    // Navigation & Header
    'nav.exportResponse': 'Export Response',
    'nav.shareRequest': 'Share Request',
    'nav.languageSwitcher': 'English',
    'nav.togglePanel': 'Toggle details panel',
    
    // Landing page
    'landing.requestBy': 'Request by',
    'landing.startNow': 'Start now',
    'landing.howItWorks': 'How it works',
    'landing.shareColleagues': 'Share with colleagues',
    'landing.saveDraft': 'Save as draft and edit at any time',
    'landing.submitOneClick': 'Submit with one click',
    'landing.dataHandling': 'How is my data handled?',
    'landing.privacyPolicy': 'Privacy Policy',
    'landing.termsOfService': 'Terms of Service',
    
    // Form
    'form.saveDraft': 'Save as draft',
    'form.submitResponse': 'Submit response',
    'form.rejectParticipation': 'Reject participation',
    'form.saveSuccess': 'Draft saved',
    'form.submitSuccess': 'Response submitted successfully',
    'form.rejectSuccess': 'Participation rejected',
    'form.shareSuccess': 'Request shared with the selected people',
    
    // Validation
    'validation.required': 'This field is required',
    'validation.invalidIban': 'Please enter a valid IBAN starting with 2 letters followed by digits.',
    'validation.invalidEmail': 'Please enter a valid email address.',
    'validation.atLeastOneSite': 'Please add at least one site.',
    'validation.completeDocBeforeSubmit': 'Please complete this required document request before submitting your response.',
    
    // Sections
    'section.generalInformation': '1. General Information',
    'section.technicalInformation': '2. Technical Information',
    'section.qualitySystems': '3. Quality Systems',
    
    // Cards
    'card.companyAddress': 'Company address',
    'card.legalDetails': 'Legal details',
    'card.publicAppearance': 'Public appearance',
    'card.otherBasicInformation': 'Other basic information',
    'card.bankConnection': 'Bank connection',
    'card.productLiability': 'Product liability / manufacturer\'s liability',
    'card.productionSalesSites': 'Production and sales Sites',
    'card.contacts': 'Contacts',
    'card.customers': 'Customers',
    'card.annualRevenues': 'Annual revenues in EUR',
    'card.shareRevenue': 'Share Revenue in %',
    'card.mainSuppliers': 'List of Main Suppliers',
    
    // Document requests
    'doc.uploadDocument': 'Upload document',
    'doc.reviewAndConfirm': 'Review and confirm',
    'doc.addAdditionalDocuments': 'Add additional documents',
    'doc.addAdditionalCocDocuments': 'Add additional Code of Conduct documents',
    
    // Share modal
    'share.title': 'Share Request with colleagues',
    'share.subtitle': 'Answer this Request together. Everyone you select gets access through their own link by email.',
    'share.shareWith': 'Share with',
    'share.whoHasAccess': 'Who already has access',
    'share.cancel': 'Cancel',
    'share.share': 'Share',
    'share.goBack': 'Go back',
    'share.searchPlaceholder': 'Search',
    
    // Add contact modal
    'addContact.title': 'Add Contact',
    'addContact.cancel': 'Cancel',
    'addContact.create': 'Create',
    
    // Status pills
    'status.answerPending': 'Answer pending',
    'status.inProgress': 'In progress',
    'status.submitted': 'Submitted',
    'status.rejected': 'Rejected',
    
    // Rejection modal
    'reject.title': 'Reject participation',
    'reject.confirm': 'Are you sure you want to decline this request? You can provide a reason (optional).',
    
    // Email notification (for reference)
    'email.subject': '{requestId}: {assessmentTitle}',
    'email.fillOutRequest': 'Fill out request',
    'email.notRightContact': 'Not the right contact person?',
    'email.forwardRequest': 'Forward request',
    'email.personalizedNote': 'This email contains a personalized request link and cannot be forwarded directly... use the Forward request button... generate a personalized link for each recipient',
    'email.securityNote': 'For security reasons, we will automatically send you a new access link when you reopen the request. All information already entered will remain saved.',
    'email.rejectParticipation': 'If you choose not to participate, click Fill out request then reject your participation',
  },
  de: {
    'nav.exportResponse': 'Antwort exportieren',
    'nav.shareRequest': 'Anfrage teilen',
    'nav.languageSwitcher': 'Deutsch',
    'nav.togglePanel': 'Detailsbereich ausklappen',
    
    'landing.requestBy': 'Anfrage von',
    'landing.startNow': 'Jetzt starten',
    'landing.howItWorks': 'So funktioniert es',
    'landing.shareColleagues': 'Teilen Sie die Anfrage mit Ihren Kollegen',
    'landing.saveDraft': 'Speichern Sie den Entwurf und bearbeiten Sie ihn jederzeit',
    'landing.submitOneClick': 'Senden Sie die Antwort mit einem Klick',
    'landing.dataHandling': 'Wie werden meine Daten behandelt?',
    'landing.privacyPolicy': 'Datenschutzrichtlinie',
    'landing.termsOfService': 'Nutzungsbedingungen',
    
    'form.saveDraft': 'Als Entwurf speichern',
    'form.submitResponse': 'Antwort abschicken',
    'form.rejectParticipation': 'Anfrage ablehnen',
    'form.saveSuccess': 'Entwurf erfolgreich gespeichert',
    'form.submitSuccess': 'Antwort erfolgreich übermittelt',
    'form.rejectSuccess': 'Teilnahme abgelehnt',
    'form.shareSuccess': 'Anfrage mit den ausgewählten Personen geteilt',
    
    'validation.required': 'Dieses Feld ist erforderlich',
    'validation.invalidIban': 'Bitte geben Sie eine gültige IBAN ein, die mit 2 Buchstaben beginnt, gefolgt von Ziffern.',
    'validation.invalidEmail': 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    'validation.atLeastOneSite': 'Bitte fügen Sie mindestens einen Standort hinzu.',
    'validation.completeDocBeforeSubmit': 'Bitte vervollständigen Sie diese erforderliche Dokumentenanfrage, bevor Sie Ihre Antwort einreichen.',
    
    'section.generalInformation': '1. Allgemeine Informationen',
    'section.technicalInformation': '2. Technische Informationen',
    'section.qualitySystems': '3. Qualitätssysteme',
    
    'card.companyAddress': 'Firmenadresse',
    'card.legalDetails': 'Rechtliche Details',
    'card.publicAppearance': 'Öffentliche Erscheinung',
    'card.otherBasicInformation': 'Andere grundlegende Informationen',
    'card.bankConnection': 'Bankverbindung',
    'card.productLiability': 'Produkt- und Herstellerhaftung',
    'card.productionSalesSites': 'Produktions- und Verkaufsstandorte',
    'card.contacts': 'Kontakte',
    'card.customers': 'Kunden',
    'card.annualRevenues': 'Jahresumsätze in EUR',
    'card.shareRevenue': 'Umsatzanteile in %',
    'card.mainSuppliers': 'Liste der Hauptlieferanten',
    
    'doc.uploadDocument': 'Dokument hochladen',
    'doc.reviewAndConfirm': 'Prüfen und bestätigen',
    'doc.addAdditionalDocuments': 'Weiteres Dokument hinzufügen',
    'doc.addAdditionalCocDocuments': 'Zusätzliche Dokumente zum Verhaltenskodex hinzufügen',
    
    'share.title': 'Anfrage mit Kollegen teilen',
    'share.subtitle': 'Beantworten Sie diese Anfrage gemeinsam. Jede ausgewählte Person erhält per E-Mail Zugriff über einen eigenen Link.',
    'share.shareWith': 'Teilen mit',
    'share.whoHasAccess': 'Wer hat bereits Zugriff',
    'share.cancel': 'Abbrechen',
    'share.share': 'Teilen',
    'share.goBack': 'Zurück',
    'share.searchPlaceholder': 'Suchen',
    
    'addContact.title': 'Kontakt hinzufügen',
    'addContact.cancel': 'Abbrechen',
    'addContact.create': 'Erstellen',
    
    'status.answerPending': 'Antwort ausstehend',
    'status.inProgress': 'In Bearbeitung',
    'status.submitted': 'Eingereicht',
    'status.rejected': 'Abgelehnt',
    
    'reject.title': 'Anfrage ablehnen',
    'reject.confirm': 'Möchten Sie wirklich ablehnen? Sie können eine Begründung angeben (optional).',
    
    'email.subject': '{requestId}: {assessmentTitle}',
    'email.fillOutRequest': 'Antworten Sie jetzt',
    'email.notRightContact': 'Nicht der richtige Ansprechpartner?',
    'email.forwardRequest': 'Anfrage weiterleiten',
    'email.personalizedNote': 'Diese E-Mail enthält einen personalisierten Anfrage-Link und kann nicht weitergeleitet werden... verwenden Sie die "Forward request"-Schaltfläche, um einen personalisierten Link für jeden Empfänger zu erstellen.',
    'email.securityNote': 'Aus Sicherheitsgründen erhalten Sie automatisch einen neuen Zugriff-Link, wenn Sie die Anfrage erneut öffnen. Alle bereits eingegebenen Informationen bleiben erhalten.',
    'email.rejectParticipation': 'Wenn Sie nicht teilnehmen möchten, klicken Sie auf "Antworten Sie jetzt" und dann auf "Ablehnen"',
  },
  fr: {
    'nav.exportResponse': 'Exporter la réponse',
    'nav.shareRequest': 'Partager la requête',
    'nav.languageSwitcher': 'Français',
    'nav.togglePanel': 'Basculer le panneau de détails',
    
    'landing.requestBy': 'Requête par',
    'landing.startNow': 'Commencer maintenant',
    'landing.howItWorks': 'Comment ça marche',
    'landing.shareColleagues': 'Partagez la requête avec vos collègues',
    'landing.saveDraft': 'Sauvegarder le brouillon et modifier à tout moment',
    'landing.submitOneClick': 'Soumettre la réponse en un clic',
    'landing.dataHandling': 'Comment mes données sont-elles traitées ?',
    'landing.privacyPolicy': 'Politique de confidentialité',
    'landing.termsOfService': 'Conditions d\'utilisation',
    
    'form.saveDraft': 'Sauvegarder le brouillon',
    'form.submitResponse': 'Envoyer la réponse',
    'form.rejectParticipation': 'Refuser la participation',
    'form.saveSuccess': 'Brouillon sauvegardé avec succès',
    'form.submitSuccess': 'Réponse envoyée avec succès',
    'form.rejectSuccess': 'Participation refusée',
    'form.shareSuccess': 'Requête partagée avec les personnes sélectionnées',
    
    'validation.required': 'Ce champ est requis',
    'validation.invalidIban': 'Veuillez saisir une IBAN valide commençant par 2 lettres suivies de chiffres.',
    'validation.invalidEmail': 'Veuillez saisir une adresse e-mail valide.',
    'validation.atLeastOneSite': 'Veuillez ajouter au moins un site.',
    'validation.completeDocBeforeSubmit': 'Veuillez compléter cette demande de document obligatoire avant de soumettre votre réponse.',
    
    'section.generalInformation': '1. Informations générales',
    'section.technicalInformation': '2. Informations techniques',
    'section.qualitySystems': '3. Systèmes de qualité',
    
    'card.companyAddress': 'Adresse de l\'entreprise',
    'card.legalDetails': 'Détails juridiques',
    'card.publicAppearance': 'Apparence publique',
    'card.otherBasicInformation': 'Autres informations de base',
    'card.bankConnection': 'Connexion bancaire',
    'card.productLiability': 'Responsabilité du produit / du fabricant',
    'card.productionSalesSites': 'Sites de production et de vente',
    'card.contacts': 'Contacts',
    'card.customers': 'Clients',
    'card.annualRevenues': 'Chiffres d\'affaires annuels en EUR',
    'card.shareRevenue': 'Partager les revenus en %',
    'card.mainSuppliers': 'Liste des principaux fournisseurs',
    
    'doc.uploadDocument': 'Télécharger un document',
    'doc.reviewAndConfirm': 'Réviser et confirmer',
    'doc.addAdditionalDocuments': 'Ajouter des documents supplémentaires',
    'doc.addAdditionalCocDocuments': 'Ajouter des documents supplémentaires liés au Code de Conduite',
    
    'share.title': 'Partager la requête avec des collègues',
    'share.subtitle': 'Répondez à cette requête ensemble. Chaque personne sélectionnée obtient un lien personnel lui donnant accès.',
    'share.shareWith': 'Partager avec',
    'share.whoHasAccess': 'Qui a déjà accès',
    'share.cancel': 'Annuler',
    'share.share': 'Partager',
    'share.goBack': 'Retour',
    'share.searchPlaceholder': 'Rechercher',
    
    'addContact.title': 'Ajouter un contact',
    'addContact.cancel': 'Annuler',
    'addContact.create': 'Créer',
    
    'status.answerPending': 'Réponse en attente',
    'status.inProgress': 'En cours',
    'status.submitted': 'Soumis',
    'status.rejected': 'Rejeté',
    
    'reject.title': 'Refuser la participation',
    'reject.confirm': 'Êtes-vous sûr de vouloir refuser ? Vous pouvez fournir une raison (optionnelle).',
    
    'email.subject': '{requestId}: {assessmentTitle}',
    'email.fillOutRequest': 'Remplir la demande',
    'email.notRightContact': 'Pas le bon contact ?',
    'email.forwardRequest': 'Transmettre la demande',
    'email.personalizedNote': 'Cette e-mail contient un lien de requête personnalisé qui ne peut pas être transmis. Utilisez le bouton "Forward request" pour générer un lien personnalisé pour chaque destinataire.',
    'email.securityNote': 'Pour des raisons de sécurité, nous vous enverrons automatiquement un nouveau lien d\'accès lorsque vous rouvrirez la requête. Toutes les informations déjà saisies resteront sauvegardées.',
    'email.rejectParticipation': 'Si vous choisissez de ne pas participer, cliquez sur "Remplir la demande" puis sur "Refuser la participation"',
  },
  it: {
    'nav.exportResponse': 'Esporta risposta',
    'nav.shareRequest': 'Condividi richiesta',
    'nav.languageSwitcher': 'Italiano',
    'nav.togglePanel': 'Attiva/disattiva pannello dettagli',
    
    'landing.requestBy': 'Richiesta di',
    'landing.startNow': 'Inizia ora',
    'landing.howItWorks': 'Come funziona',
    'landing.shareColleagues': 'Condividi la richiesta con i colleghi',
    'landing.saveDraft': 'Salva come bozza e modifica in qualsiasi momento',
    'landing.submitOneClick': 'Invia la risposta con un clic',
    'landing.dataHandling': 'Come vengono gestiti i miei dati?',
    'landing.privacyPolicy': 'Informativa sulla privacy',
    'landing.termsOfService': 'Condizioni di servizio',
    
    'form.saveDraft': 'Salva come bozza',
    'form.submitResponse': 'Invia risposta',
    'form.rejectParticipation': 'Rifiuta partecipazione',
    'form.saveSuccess': 'Bozza salvata con successo',
    'form.submitSuccess': 'Risposta inviata con successo',
    'form.rejectSuccess': 'Partecipazione rifiutata',
    'form.shareSuccess': 'Richiesta condivisa con le persone selezionate',
    
    'validation.required': 'Questo campo è obbligatorio',
    'validation.invalidIban': 'Inserisci un IBAN valido che inizi con 2 lettere seguite da cifre.',
    'validation.invalidEmail': 'Inserisci un indirizzo email valido.',
    'validation.atLeastOneSite': 'Aggiungi almeno un sito.',
    'validation.completeDocBeforeSubmit': 'Completa questa richiesta di documento obbligatoria prima di inviare la risposta.',
    
    'section.generalInformation': '1. Informazioni generali',
    'section.technicalInformation': '2. Informazioni tecniche',
    'section.qualitySystems': '3. Sistemi di qualità',
    
    'card.companyAddress': 'Indirizzo della società',
    'card.legalDetails': 'Dettagli legali',
    'card.publicAppearance': 'Apparenza pubblica',
    'card.otherBasicInformation': 'Altre informazioni di base',
    'card.bankConnection': 'Connessione bancaria',
    'card.productLiability': 'Responsabilità del prodotto / del produttore',
    'card.productionSalesSites': 'Siti di produzione e vendita',
    'card.contacts': 'Contatti',
    'card.customers': 'Clienti',
    'card.annualRevenues': 'Ricavi annuali in EUR',
    'card.shareRevenue': 'Condividere i ricavi in %',
    'card.mainSuppliers': 'Elenco dei principali fornitori',
    
    'doc.uploadDocument': 'Carica documento',
    'doc.reviewAndConfirm': 'Revisiona e conferma',
    'doc.addAdditionalDocuments': 'Aggiungi documenti aggiuntivi',
    'doc.addAdditionalCocDocuments': 'Aggiungi altri documenti relativi al Codice di Condotta',
    
    'share.title': 'Condividi la richiesta con i colleghi',
    'share.subtitle': 'Rispondi insieme a questa richiesta. Chiunque tu selezioni ottiene un proprio link d\'accesso via email.',
    'share.shareWith': 'Condividi con',
    'share.whoHasAccess': 'Chi ha già accesso',
    'share.cancel': 'Annulla',
    'share.share': 'Condividi',
    'share.goBack': 'Torna indietro',
    'share.searchPlaceholder': 'Cerca',
    
    'addContact.title': 'Aggiungi contatto',
    'addContact.cancel': 'Annulla',
    'addContact.create': 'Crea',
    
    'status.answerPending': 'Risposta in sospeso',
    'status.inProgress': 'In corso',
    'status.submitted': 'Inviato',
    'status.rejected': 'Rifiutato',
    
    'reject.title': 'Rifiuta partecipazione',
    'reject.confirm': 'Sei sicuro di voler rifiutare questa richiesta? Puoi fornire una motivazione (opzionale).',
    
    'email.subject': '{requestId}: {assessmentTitle}',
    'email.fillOutRequest': 'Riempi la richiesta',
    'email.notRightContact': 'Non sei il contatto giusto?',
    'email.forwardRequest': 'Inoltra richiesta',
    'email.personalizedNote': 'Questa e-mail contiene un link di richiesta personalizzato e non può essere inoltrata. Utilizza il pulsante "Forward request" per condividere la richiesta con i tuoi colleghi, generando un link personalizzato per ogni destinatario.',
    'email.securityNote': 'Per ragioni di sicurezza, ti invieremo automaticamente un nuovo link di accesso quando riaprirai la richiesta. Tutte le informazioni già inserite rimarranno salvate.',
    'email.rejectParticipation': 'Se scegli di non partecipare, clicca su "Riempi la richiesta" e poi su "Rifiuta partecipazione"',
  },
  pl: {
    'nav.exportResponse': 'Eksportuj odpowiedź',
    'nav.shareRequest': 'Udostępnij prośbę',
    'nav.languageSwitcher': 'Polski',
    'nav.togglePanel': 'Przełącz panel szczegółów',
    
    'landing.requestBy': 'Prośba udostępniona przez',
    'landing.startNow': 'Zacznij teraz',
    'landing.howItWorks': 'Jak to działa',
    'landing.shareColleagues': 'Udostępnij prośbę swoim kolegom',
    'landing.saveDraft': 'Zapisz szkic i edytuj go w dowolnym momencie',
    'landing.submitOneClick': 'Wyślij odpowiedź jednym kliknięciem',
    'landing.dataHandling': 'Jak są traktowane moje dane?',
    'landing.privacyPolicy': 'Polityka prywatności',
    'landing.termsOfService': 'Warunki korzystania',
    
    'form.saveDraft': 'Zapisz jako szkic',
    'form.submitResponse': 'Wyślij odpowiedź',
    'form.rejectParticipation': 'Odmów udział',
    'form.saveSuccess': 'Szkic zapisany pomyślnie',
    'form.submitSuccess': 'Odpowiedź wysłana pomyślnie',
    'form.rejectSuccess': 'Udział odrzucony',
    'form.shareSuccess': 'Prośba udostępniona wybranym osobom',
    
    'validation.required': 'To pole jest wymagane',
    'validation.invalidIban': 'Wprowadź poprawny IBAN zaczynający się od 2 liter, po których nastąpią cyfry.',
    'validation.invalidEmail': 'Wprowadź poprawny adres e-mail.',
    'validation.atLeastOneSite': 'Dodaj co najmniej jedną lokalizację.',
    'validation.completeDocBeforeSubmit': 'Uzupełnij tę wymaganą dokumentację przed wysłaniem odpowiedzi.',
    
    'section.generalInformation': '1. Informacje ogólne',
    'section.technicalInformation': '2. Informacje techniczne',
    'section.qualitySystems': '3. Systemy jakości',
    
    'card.companyAddress': 'Adres firmy',
    'card.legalDetails': 'Informacje prawne',
    'card.publicAppearance': 'Prezentacja publiczna',
    'card.otherBasicInformation': 'Inne informacje podstawowe',
    'card.bankConnection': 'Połączenie bankowe',
    'card.productLiability': 'Odpowiedzialność za produkt / odpowiedzialność producenta',
    'card.productionSalesSites': 'Lokalizacje produkcji i sprzedaży',
    'card.contacts': 'Kontakty',
    'card.customers': 'Klienci',
    'card.annualRevenues': 'Przychody roczne w EUR',
    'card.shareRevenue': 'Udział w przychodach w procentach',
    'card.mainSuppliers': 'Lista głównych dostawców',
    
    'doc.uploadDocument': 'Dodaj dokument',
    'doc.reviewAndConfirm': 'Przejrzyj i zatwierdź',
    'doc.addAdditionalDocuments': 'Dodaj dodatkowe dokumenty',
    'doc.addAdditionalCocDocuments': 'Dodaj dodatkowe dokumenty dotyczące kodeksu postępowania',
    
    'share.title': 'Udostępnij prośbę swoim kolegom',
    'share.subtitle': 'Odpowiedz na tę prośbę razem. Każda wybrana osoba uzyska dostęp poprzez własny link wysłany emailem.',
    'share.shareWith': 'Udostępnij z',
    'share.whoHasAccess': 'Kto już ma dostęp',
    'share.cancel': 'Anuluj',
    'share.share': 'Udostępnij',
    'share.goBack': 'Wróć',
    'share.searchPlaceholder': 'Wyszukaj',
    
    'addContact.title': 'Dodaj kontakt',
    'addContact.cancel': 'Anuluj',
    'addContact.create': 'Utwórz',
    
    'status.answerPending': 'Odpowiedź w toku',
    'status.inProgress': 'W trakcie',
    'status.submitted': 'Wysłane',
    'status.rejected': 'Odmówiono',
    
    'reject.title': 'Odmów udział',
    'reject.confirm': 'Czy jesteś pewien, że chcesz odmówić udziału? Możesz podać powód (opcjonalnie).',
    
    'email.subject': '{requestId}: {assessmentTitle}',
    'email.fillOutRequest': 'Wypełnij prośbę',
    'email.notRightContact': 'Nie jesteś właściwą osobą?',
    'email.forwardRequest': 'Przekaż prośbę',
    'email.personalizedNote': 'Ten e-mail zawiera spersonalizowany link do prośby i nie może być przekazywany. Aby udostępnić prośbę swoim współpracownikom, użyj przycisku „Forward request”, który wygeneruje spersonalizowany link dla każdego odbiorcy, zapewniając im dostęp i umożliwiając im wspólne/współbieżne/współbieżne wypełnianie prośby (last-write-wins lub field-level locking).',
    'email.securityNote': 'Ze względów bezpieczeństwa automatycznie wyślemy Ci nowy link dostępu, gdy ponownie otworzysz prośbę. Wszystkie informacje już wprowadzone zostaną zachowane.',
    'email.rejectParticipation': 'Jeśli zdecydujesz się na nieudział, kliknij „Wypełnij prośbę”, a następnie „Odmów udziału”.',
  },
  sk: {
    'nav.exportResponse': 'Exportovať odpoveď',
    'nav.shareRequest': 'Zdieľať požiadavku',
    'nav.languageSwitcher': 'Slovenščina',
    'nav.togglePanel': 'Prepnúť panel s podrobnosťami',
    
    'landing.requestBy': 'Požiadavka od',
    'landing.startNow': 'Začať teraz',
    'landing.howItWorks': 'Ako to funguje',
    'landing.shareColleagues': 'Zdieľte požiadavku so spolupracníkmi',
    'landing.saveDraft': 'Uložte návrh a upravte ho kedykoľvek',
    'landing.submitOneClick': 'Odoslať odpoveď jedným kliknutím',
    'landing.dataHandling': 'Ako sa spracujú moje údaje?',
    'landing.privacyPolicy': 'Zásady ochrany osobných údajov',
    'landing.termsOfService': 'Podmienky poskytovania',
    
    'form.saveDraft': 'Uložiť návrh',
    'form.submitResponse': 'Odoslať odpoveď',
    'form.rejectParticipation': 'Zamietnuť účasť',
    'form.saveSuccess': 'Návrh bol úspešne uložený',
    'form.submitSuccess': 'Odpoveď bola úspešne odoslaná',
    'form.rejectSuccess': 'Účasť bola zamietnutá',
    'form.shareSuccess': 'Požiadavka bola zdieľaná s vybranými ľuďmi',
    
    'validation.required': 'Toto pole je povinné',
    'validation.invalidIban': 'Prosím, zadajte platný IBAN, ktorý začína 2 písmenami nasledovanými číslicami.',
    'validation.invalidEmail': 'Prosím, zadajte platný e-mail.',
    'validation.atLeastOneSite': 'Prosím, pridajte aspoň jedno sídlo.',
    'validation.completeDocBeforeSubmit': 'Pred odoslaním odpovede doplňte požadované dokumenty.',
    
    'section.generalInformation': '1. Všeobecné informácie',
    'section.technicalInformation': '2. Technické informácie',
    'section.qualitySystems': '3. Systémy kvality',
    
    'card.companyAddress': 'Adresa spoločnosti',
    'card.legalDetails': 'Právne detaily',
    'card.publicAppearance': 'Verejný obraz',
    'card.otherBasicInformation': 'Ďalšie základné informácie',
    'card.bankConnection': 'Bankový spoj',
    'card.productLiability': 'Výrobková / výrobná zodpovednosť',
    'card.productionSalesSites': 'Výrobné a predajné prevádzky',
    'card.contacts': 'Kontakty',
    'card.customers': 'Zákazníci',
    'card.annualRevenues': 'Ročný obrat v EUR',
    'card.shareRevenue': 'Podiel obratu v percentách',
    'card.mainSuppliers': 'Zoznam hlavných dodávateľov',
    
    'doc.uploadDocument': 'Nahrať dokument',
    'doc.reviewAndConfirm': 'Skontrolovať a potvrdiť',
    'doc.addAdditionalDocuments': 'Pridať ďalšie dokumenty',
    'doc.addAdditionalCocDocuments': 'Pridať ďalšie dokumenty týkajúce sa Etického kóexu',
    
    'share.title': 'Zdieľať požiadavku so spolupracníkmi',
    'share.subtitle': 'Spoločne riešte túto požiadavku. Každý, koho vyberiete, získa prístup prostredníctvom vlastného odkazu zaslaného e-mailom.',
    'share.shareWith': 'Zdieľať s',
    'share.whoHasAccess': 'Kto už má prístup',
    'share.cancel': 'Zrušiť',
    'share.share': 'Zdieľať',
    'share.goBack': 'Vrátiť sa',
    'share.searchPlaceholder': 'Vyhľadať',
    
    'addContact.title': 'Pridať kontakt',
    'addContact.cancel': 'Zrušiť',
    'addContact.create': 'Vytvoriť',
    
    'status.answerPending': 'Odpoveď čaká',
    'status.inProgress': 'V procese',
    'status.submitted': 'Odoslaná',
    'status.rejected': 'Zrušená',
    
    'reject.title': 'Zamietnuť účasť',
    'reject.confirm': 'Ste si istý, že chcete zamietnuť? Môžete poskytnúť dôvod (voliteľné).',
    
    'email.subject': '{requestId}: {assessmentTitle}',
    'email.fillOutRequest': 'Vyplniť požiadavku',
    'email.notRightContact': 'Nie ste správna osoba?',
    'email.forwardRequest': 'Poslať ďalej požiadavku',
    'email.personalizedNote': 'Tento e-mail obsahuje personalizovaný odkaz na požiadavku a nemôže byť ďalej zaslaný. Aby ste požiadavku zdieľali kolegom, použite tlačidlo „Forward request“. Toto vytvorí personalizovaný odkaz pre každého príjemcu, ktorý mu umožní prístup a umožní im spoločne/výmenne/výmenne riešiť požiadavku (last-write-wins alebo field-level locking).',
    'email.securityNote': 'Z bezpečnostných dôvodov vám automaticky odošleme nový odkaz na prístup, keď si požiadavku znovu otvoríte. Všetky už zadané informácie zostanú zachované.',
    'email.rejectParticipation': 'Ak sa rozhodnete nezúčastniť, kliknite na „Vyplniť požiadavku“ a potom na „Zamietnuť účasť“.',
  },
  zh: {
    'nav.exportResponse': '导出回复',
    'nav.shareRequest': '分享请求',
    'nav.languageSwitcher': '中文',
    'nav.togglePanel': '切换详情面板',
    
    'landing.requestBy': '请求由',
    'landing.startNow': '立即开始',
    'landing.howItWorks': '工作流程',
    'landing.shareColleagues': '与同事分享请求',
    'landing.saveDraft': '保存草稿并随时编辑',
    'landing.submitOneClick': '一键提交回复',
    'landing.dataHandling': '我的数据如何处理？',
    'landing.privacyPolicy': '隐私政策',
    'landing.termsOfService': '服务条款',
    
    'form.saveDraft': '保存草稿',
    'form.submitResponse': '提交回复',
    'form.rejectParticipation': '拒绝参与',
    'form.saveSuccess': '草稿保存成功',
    'form.submitSuccess': '回复提交成功',
    'form.rejectSuccess': '参与已拒绝',
    'form.shareSuccess': '请求已与选定人员分享',
    
    'validation.required': '此字段为必填项',
    'validation.invalidIban': '请输入有效的IBAN，以2个字母开头，后面是数字。',
    'validation.invalidEmail': '请输入有效的电子邮件地址。',
    'validation.atLeastOneSite': '请至少添加一个地点。',
    'validation.completeDocBeforeSubmit': '请在提交回复前完成所有必需的文档请求。',
    
    'section.generalInformation': '1. 基本信息',
    'section.technicalInformation': '2. 技术信息',
    'section.qualitySystems': '3. 质量体系',
    
    'card.companyAddress': '公司地址',
    'card.legalDetails': '法律详情',
    'card.publicAppearance': '对外形象',
    'card.otherBasicInformation': '其他基本信息',
    'card.bankConnection': '银行连接',
    'card.productLiability': '产品责任/制造商责任',
    'card.productionSalesSites': '生产销售网点',
    'card.contacts': '联系人',
    'card.customers': '客户',
    'card.annualRevenues': '年度收入（欧元）',
    'card.shareRevenue': '收入份额（%）',
    'card.mainSuppliers': '主要供应商列表',
    
    'doc.uploadDocument': '上传文档',
    'doc.reviewAndConfirm': '审查并确认',
    'doc.addAdditionalDocuments': '添加更多文档',
    'doc.addAdditionalCocDocuments': '添加更多与道德规范相关的文档',
    
    'share.title': '与同事分享请求',
    'share.subtitle': '共同完成请求。您选择的每个人都会获得一个专属链接，通过电子邮件访问。',
    'share.shareWith': '分享给',
    'share.whoHasAccess': '谁已经有访问权限',
    'share.cancel': '取消',
    'share.share': '分享',
    'share.goBack': '返回',
    'share.searchPlaceholder': '搜索',
    
    'addContact.title': '添加联系人',
    'addContact.cancel': '取消',
    'addContact.create': '创建',
    
    'status.answerPending': '待回复',
    'status.inProgress': '进行中',
    'status.submitted': '已提交',
    'status.rejected': '已拒绝',
    
    'reject.title': '拒绝参与',
    'reject.confirm': '您确定要拒绝这个请求吗？您可以提供一个原因（可选）。',
    
    'email.subject': '{requestId}: {assessmentTitle}',
    'email.fillOutRequest': '填写请求',
    'email.notRightContact': '不是正确的联系人？',
    'email.forwardRequest': '转发请求',
    'email.personalizedNote': '此邮件包含一个个性化的请求链接，不能直接转发。您可以通过“转发请求”按钮来分享此请求，这将为每个收件人生成一个个性化的链接，授予他们访问权限，并允许他们协作地完成此请求（支持并行写入或字段级锁定）。',
    'email.securityNote': '出于安全考虑，我们将自动在您重新打开请求时给您发送一个新的访问链接。您已经输入的所有信息将继续保留。',
    'email.rejectParticipation': '如果您选择不参与，请点击“填写请求”并然后拒绝您的参与。',
  },
  es: {
    'nav.exportResponse': 'Exportar respuesta',
    'nav.shareRequest': 'Compartir solicitud',
    'nav.languageSwitcher': 'Español',
    'nav.togglePanel': 'Alternar panel de detalles',
    
    'landing.requestBy': 'Solicitud de',
    'landing.startNow': 'Empezar ahora',
    'landing.howItWorks': 'Cómo funciona',
    'landing.shareColleagues': 'Compartir solicitud con colegas',
    'landing.saveDraft': 'Guardar borrador y editar en cualquier momento',
    'landing.submitOneClick': 'Enviar respuesta con un clic',
    'landing.dataHandling': '¿Cómo se gestionan mis datos?',
    'landing.privacyPolicy': 'Política de privacidad',
    'landing.termsOfService': 'Términos de servicio',
    
    'form.saveDraft': 'Guardar borrador',
    'form.submitResponse': 'Enviar respuesta',
    'form.rejectParticipation': 'Rechazar participación',
    'form.saveSuccess': 'Borrador guardado exitosamente',
    'form.submitSuccess': 'Respuesta enviada exitosamente',
    'form.rejectSuccess': 'Participación rechazada',
    'form.shareSuccess': 'Solicitud compartida con las personas seleccionadas',
    
    'validation.required': 'Este campo es obligatorio',
    'validation.invalidIban': 'Por favor, ingrese un IBAN válido que comience con 2 letras seguidas de dígitos.',
    'validation.invalidEmail': 'Por favor, ingrese una dirección de correo electrónico válida.',
    'validation.atLeastOneSite': 'Por favor, agregue al menos un sitio.',
    'validation.completeDocBeforeSubmit': 'Complete esta solicitud de documento obligatoria antes de enviar su respuesta.',
    
    'section.generalInformation': '1. Información general',
    'section.technicalInformation': '2. Información técnica',
    'section.qualitySystems': '3. Sistemas de calidad',
    
    'card.companyAddress': 'Dirección de la empresa',
    'card.legalDetails': 'Detalles legales',
    'card.publicAppearance': 'Apariencia pública',
    'card.otherBasicInformation': 'Otra información básica',
    'card.bankConnection': 'Conexión bancaria',
    'card.productLiability': 'Responsabilidad del producto/del fabricante',
    'card.productionSalesSites': 'Sitios de producción y venta',
    'card.contacts': 'Contactos',
    'card.customers': 'Clientes',
    'card.annualRevenues': 'Ingresos anuales en EUR',
    'card.shareRevenue': 'Compartir ingresos en %',
    'card.mainSuppliers': 'Lista de proveedores principales',
    
    'doc.uploadDocument': 'Subir documento',
    'doc.reviewAndConfirm': 'Revisar y confirmar',
    'doc.addAdditionalDocuments': 'Añadir documentos adicionales',
    'doc.addAdditionalCocDocuments': 'Añadir más documentos relacionados con el Código de Conducta',
    
    'share.title': 'Compartir solicitud con colegas',
    'share.subtitle': 'Responda esta solicitud juntos. Cada persona que seleccione tendrá su propio enlace por correo electrónico.',
    'share.shareWith': 'Compartir con',
    'share.whoHasAccess': 'Quién tiene ya acceso',
    'share.cancel': 'Cancelar',
    'share.share': 'Compartir',
    'share.goBack': 'Volver',
    'share.searchPlaceholder': 'Buscar',
    
    'addContact.title': 'Añadir contacto',
    'addContact.cancel': 'Cancelar',
    'addContact.create': 'Crear',
    
    'status.answerPending': 'Respuesta pendiente',
    'status.inProgress': 'En progreso',
    'status.submitted': 'Enviada',
    'status.rejected': 'Rechazada',
    
    'reject.title': 'Rechazar participación',
    'reject.confirm': '¿Seguro que desea rechazar? Puede proporcionar una razón (opcional).',
    
    'email.subject': '{requestId}: {assessmentTitle}',
    'email.fillOutRequest': 'Llenar solicitud',
    'email.notRightContact': '¿No es el contacto correcto?',
    'email.forwardRequest': 'Reenviar solicitud',
    'email.personalizedNote': 'Este correo contiene un enlace personalizado a la solicitud que no puede ser reenviado. Para compartir la solicitud con sus colegas, use el botón "Reenviar solicitud", que generará un enlace personalizado para cada destinatario, otorgándole acceso y permitiendo respuestas colaborativas (con sistema de última escritura o bloqueo de campos).',
    'email.securityNote': 'Por razones de seguridad, le enviaremos automáticamente un nuevo enlace de acceso cuando reabra la solicitud. Toda la información ya ingresada se mantendrá guardada.',
    'email.rejectParticipation': 'Si elige no participar, haga clic en "Llenar solicitud" y luego en "Rechazar participación".',
  }
};
const i18n = {
  getLocale() {
    return (localStorage.getItem(LOCALE_STORAGE_KEY) as Locale) || 'en';
  },
  
  setLocale(locale: Locale) {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    window.location.reload();
  },
  
  t(key: string, locale?: Locale): string {
    const currentLocale = locale || this.getLocale();
    const keys = key.split('.');
    let value: any = translations[currentLocale];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key} in locale ${currentLocale}`);
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  },
};

export { i18n, localeNames, flagIcons };
