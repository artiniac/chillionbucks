# Optional family accounts and cross-device saves

Proposed September 21, 2026, in response to Artin's account question. Not deployed or configured.

## Player experience

Guest play remains immediate. A grown-up can choose Save across devices, sign in with Google, and create separate kid profiles with a nickname and icon. Children do not need individual Google accounts. Town projects, the wallet, piggy-bank progress, tracks, blocks, and park creations belong to the chosen kid profile. Signing out restores guest play without deleting local progress.

Existing saves remain on the device. First sign-in offers an explicit choice to copy this device's progress into a new profile or open an existing cloud profile. Never replace a cloud save with an empty browser, and never merge wallet balances by adding them together. Keep a recoverable version before imports or conflict resolution.

## Required infrastructure

The site is currently static GitHub Pages with browser localStorage. Google sign-in establishes identity; it does not store games. A practical option is Firebase Authentication for Google sign-in plus Firestore for saved game documents. Configure an owner-controlled Firebase project, authorized domain chillionbucks.com, and the Google provider. Only public browser configuration belongs in this repository; no service account or private credentials.

Suggested data layout: users/{parentUid}/profiles/{profileId}/saves/{gameId}. Security rules must require an authenticated matching parent UID on every read and write. Reject malformed save schemas and excessive payload sizes. Use generated profile IDs. Do not use a child's full name or email as an identifier.

Saves need schema versions, updated timestamps, and a last-known revision. Use transactions or conditional writes so two open devices cannot silently replace newer progress. Queue offline changes locally and expose save status. Reconcile divergent versions with a grown-up instead of blindly choosing the last browser to reconnect. Keep local backups during migration.

## Before enabling

Configure the backend in the owner's account, verify Google sign-in on the actual production domain, test rules with two unrelated test users, and verify login, logout, offline play, restore, and concurrent edits. Provide parent-facing data and account deletion controls and update site disclosures for the new data storage behavior. Review provider limits before launch. No claim of guaranteed free hosting for the new backend.

Official implementation references:
- https://firebase.google.com/docs/auth/web/google-signin
- https://firebase.google.com/docs/firestore/security/get-started

The earlier local-only repository policy describes the existing implementation. Artin's new request permits planning a different account system. This document does not add a fake sign-in button or claim cloud saving already works.
