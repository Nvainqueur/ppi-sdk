# Pay-per-Insight Publisher SDK

Embed micropayments for premium content in minutes.

## Quick Start

### 1. Add the SDK to your page

```html
<script>
  window.PPI_WALLET_API_URL = "https://YOUR_WALLET_API_URL";
  window.PPI_PRICING_API_URL = "https://YOUR_PRICING_API_URL";
  window.PPI_PUBLICATION = "yoursite.com"; // used for pricing tier
</script>
<script src="https://YOUR_SDK_CDN_URL/sdk.js"></script>
```

### 2. Mark premium content

```html
<section data-premium data-topic="technology">
  Your premium article content here. This will be blurred and
  require a micropayment to unlock.
</section>
```

### 3. Optional: topic values for pricing multipliers

| Topic value       | Multiplier |
|-------------------|-----------|
| `investigative`   | +20%      |
| `science`         | +10%      |
| `technology`      | +5%       |
| `opinion`         | -15%      |
| `entertainment`   | -12%      |

## Publisher Dashboard

Open `publisher-dashboard/index.html` in a browser and enter your API URLs to see reads and earnings.

## How it works

1. When a visitor lands on your page, the SDK automatically creates an anonymous wallet (stored in `localStorage`) if one does not exist.
2. Premium sections (`data-premium`) are blurred and an unlock overlay is shown with the calculated price.
3. When the visitor clicks "Unlock", their wallet is charged the micropayment amount and the content is revealed.
4. Visitors can top up their wallet via Stripe Checkout by clicking "Top up wallet".
