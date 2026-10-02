# Gardening Service Co. — Cloudflare Pages

A responsive, multi-page static website for Gardening Service Co., built with HTML, CSS, vanilla JavaScript, and one Cloudflare Pages Function for quote-form delivery.

## Included

- Home, About, Services, Residential, Commercial, Our Work, Contact, Payments, and 404 pages
- Responsive mobile navigation and accessible focus states
- Filterable image gallery
- Quote form with validation and service preselection from CTA links
- Cloudflare Pages Function at `functions/api/quote.js`
- SEO titles/descriptions, canonical URLs, Open Graph metadata, basic LocalBusiness structured data, sitemap, and robots.txt
- Security headers and cache headers

## Before publishing

1. **Replace illustrative stock photography.** The Our Work page explicitly identifies its images as inspiration rather than company project photos. Replace these with approved business photos before describing them as completed work.
2. Confirm the business name, phone number, email address, service area, insurance statement, payment methods, and all service descriptions.
3. Confirm the official canonical domain and redirect preference (`www` or apex) in Cloudflare.
4. Review all copy and privacy/legal requirements for the business.
5. Test the site on mobile and desktop.

## Deploy to Cloudflare Pages

### Option A: Git integration (recommended)

1. Create a GitHub repository and upload the contents of this project.
2. In Cloudflare Dashboard, go to **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the repository.
4. Use these settings:
   - Production branch: `main`
   - Framework preset: `None`
   - Build command: leave blank or use `exit 0`
   - Build output directory: `/` (the repository root)
5. Deploy. Cloudflare Pages serves the HTML pages and detects the `functions/` directory automatically when deploying through Git integration.

### Option B: Wrangler

Install Wrangler and authenticate first. From this project directory, run:

```sh
npx wrangler pages project create gardening-service-co
npx wrangler pages deploy . --project-name gardening-service-co
```

For Pages Functions, a Git-connected deployment is the simplest supported workflow. If using direct upload, follow the current Cloudflare Pages Functions deployment instructions and verify that the `functions/` directory is included in the deployment.

## Configure quote form email delivery

The form endpoint uses [Resend](https://resend.com/) to deliver quote requests.

1. Create a Resend account and verify the sender domain you want to use.
2. In Cloudflare Dashboard, open **Workers & Pages → your Pages project → Settings → Variables and Secrets**.
3. Add these values for both production and preview as appropriate:
   - `RESEND_API_KEY` — **secret**; paste your Resend API key.
   - `QUOTE_TO_EMAIL` — inbox that should receive quote requests.
   - `QUOTE_FROM_EMAIL` — verified sender, e.g. `quotes@your-verified-domain.com`.
4. Redeploy the project.
5. Test the form with a real email address and verify receipt, reply-to behavior, and spam handling.

If these variables are missing, the function returns a clear error and the form tells the visitor to call or email instead. It does not falsely report a successful submission.

### Form privacy and spam

- A hidden honeypot field provides basic bot filtering; it is not a complete anti-spam system.
- Consider adding Cloudflare Turnstile and rate limiting if the form receives spam.
- The current form accepts photo links, not file uploads.
- The function sends inquiry details to the configured recipient through Resend. Update your privacy notice to match the business's actual data practices.

## Local preview

A simple static preview can be served from this directory using any local static server. The quote endpoint will not work unless the Pages Function is run in a Cloudflare-compatible local environment and the required environment variables are set.

## Notes

- Images currently load from Unsplash URLs, so an internet connection is needed to display them.
- Testimonials are not fabricated or reproduced as full quotations. The homepage summarizes feedback themes from the prior site specification.
- The page copy avoids claiming unverified licenses, certifications, exact cities served, warranties, or service guarantees.
