# Smart Study Tutor — Netlify Deploy Guide

## 1. GitHub par upload karo
```
cd smart-study-tutor
git init
git add .
git commit -m "Smart Study Tutor"
```
Phir GitHub par ek naya repo banao aur push karo (GitHub website pe "Create repository" karke jo commands milengi wahi chalao).

## 2. Netlify se connect karo
1. https://app.netlify.com par login/signup karo (GitHub se ho jayega)
2. "Add new site" → "Import an existing project" → apna GitHub repo select karo
3. Build settings automatically aa jayengi (netlify.toml se):
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Deploy karne se pehle mat bhoolna:** "Site settings" → "Environment variables" → add karo:
   - Key: `ANTHROPIC_API_KEY`
   - Value: apni Anthropic API key (console.anthropic.com se milegi, "API Keys" section mein)
5. "Deploy site" click karo

## 3. Ho gaya
2-3 minute mein tumhara live link mil jayega (jaise `smart-study-tutor-xyz.netlify.app`). Chahoge to Netlify settings mein custom domain bhi laga sakte ho.

## Google par search karke milne ke liye
Deploy hone ke baad bhi Google index karne mein kuch din-hafte lagte hain. Jaldi ke liye:
- Google Search Console (search.google.com/search-console) par site add karo aur sitemap submit karo
- Site ka content aur naam clear rakho taaki relevant searches mein aaye

## Cost note
Har sawaal/notes request par thoda sa Anthropic API cost lagega (paise your Anthropic account se katenge, based on usage). Free traffic zyada hone par cost badh sakta hai — control karne ke liye Anthropic console mein spending limit set kar sakte ho.
