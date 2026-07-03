export interface SampleDataset {
  name: string;
  description: string;
  focusArea: string;
  reviews: string;
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    name: "🚀 TaskFlow SaaS Reviews",
    description: "Feedback for a modern project management software tool focusing on integrations, speed, and learning curve.",
    focusArea: "User Interface & Performance",
    reviews: `[2026-06-01] User review: I love TaskFlow! The interface is incredibly clean and snappy. Moving cards around is smooth, and the keyboard shortcuts make me so fast. Best project manager I've used.
[2026-06-03] User review: The mobile app is really disappointing. It takes forever to load, crashes on my Android device when uploading attachments, and lacks the offline support we were promised.
[2026-06-06] User review: Great tool, but pricing is too high for small teams. $15 per user is too steep. We might have to switch to something else if they increase prices next quarter.
[2026-06-10] User review: Integration with Slack and GitHub works like a charm. It completely automated our sprint updates. Highly recommend for developer teams!
[2026-06-12] User review: Learning curve is a bit steep for non-technical team members. My marketing team struggled to understand how the nested subtasks and dependencies work. Documentation could be better.
[2026-06-15] User review: The notifications are overwhelming. I get an email, a push notification, and a Slack alert for every tiny edit on a card. Even after modifying settings, they keep coming.
[2026-06-18] User review: Absolutely adore the new timeline view! It made planning our product launch so much easier. The drag-and-drop dependency lines are super intuitive.
[2026-06-20] User review: Customer support is non-existent. I opened a critical ticket because we were locked out of our workspace, and it took 3 days to get a template response that didn't help.
[2026-06-23] User review: Excellent dark mode! It's very easy on the eyes during late-night coding sessions. Speed is amazing, the search bar is instantaneous.
[2026-06-26] User review: The reporting tool lacks depth. I can't export custom charts to PDF, and the velocity chart doesn't account for rolled-over tasks. We need better analytics.
[2026-06-28] User review: Clean UI, responsive, and reliable. No downtime experienced over the last 6 months. Happy with our team migration.
[2026-07-01] User review: I'm finding it hard to customize custom fields on the free tier, but the paid tier is excellent. Drag-and-drop boards are top tier.`
  },
  {
    name: "🛒 FreshCart Grocery Delivery",
    description: "Customer feedback for a hyper-local grocery delivery app highlighting fresh produce quality and delivery times.",
    focusArea: "Delivery & Produce Freshness",
    reviews: `[2026-06-02] Verified Purchase: The strawberries I received were completely moldy! This is the second time I've ordered fruit from FreshCart and received rotten produce. Extremely disappointed.
[2026-06-05] Verified Purchase: Delivery was incredibly fast, arrived in 20 minutes! The rider was extremely polite and kept my eggs safe. Will definitely order again.
[2026-06-08] Verified Purchase: App is glitchy. It let me add items to my cart, but then at checkout said they were out of stock. The checkout screen kept reloading and double-charged my Apple Pay.
[2026-06-11] Verified Purchase: Outstanding customer support! One of my milk bottles was leaking, I reported it in the app, and they refunded me instantly with zero questions asked. Truly customer-first.
[2026-06-14] Verified Purchase: Delivery drivers keep ignoring my instructions to leave the groceries at the gate. They keep ringing the bell and waking up my newborn baby. Very frustrating.
[2026-06-17] Verified Purchase: Fantastic variety of organic foods. The prices are competitive with physical supermarkets, and the buy-one-get-one-free deals are actually genuine.
[2026-06-19] Verified Purchase: My delivery was delayed by over two hours last night without any notification. When I checked the map, the driver was sitting in one spot for an hour. Groceries arrived warm, and my ice cream was completely melted.
[2026-06-22] Verified Purchase: The quality of meats is exceptional! Extremely fresh, well-packaged, and temperature-controlled. Very happy with the premium quality.
[2026-06-25] Verified Purchase: Searching for items is a nightmare. Typing 'cilantro' brings up shampoo first. The categorization is completely scrambled.
[2026-06-27] Verified Purchase: Great service overall, saves me hours of shopping every week. The subscription plan is totally worth it.
[2026-06-29] Verified Purchase: Love how easy it is to re-order my weekly list in one click. Perfect UX for busy families.
[2026-07-02] Verified Purchase: Delivery was late again, and half of my tomatoes were squashed underneath heavy soda cans. Please teach packagers how to bag groceries properly.`
  },
  {
    name: "🍽️ Bistro 88 Restaurant",
    description: "Diner feedback for an upscale casual restaurant discussing menu pricing, food quality, and service pace.",
    focusArea: "Service Quality & Value for Money",
    reviews: `Review: The truffle pasta was out of this world! Absolute perfection. The atmosphere is cozy, romantic, and beautifully lit. A gem in the city.
Review: We had to wait for 45 minutes even though we had a confirmed reservation. The host was very dismissive and didn't offer any explanation or even a glass of water.
Review: The ribeye steak was cold and completely overcooked. I asked for medium rare and it came out gray and dry. For $50, this is unacceptable.
Review: Incredible cocktails! The mixologist made a custom rosemary-infused gin drink that was outstanding. The bartenders are incredibly knowledgeable.
Review: Service was painfully slow. It took 20 minutes to take our drink orders and another 45 minutes for the appetizers to arrive. We felt completely forgotten by our waiter.
Review: The molten chocolate lava cake was spectacular! Perfect ending to our anniversary. The waiter brought us complementary champagne, which was a lovely, generous touch.
Review: Music was way too loud. We had to shout across our small table to hear each other. It felt more like a nightclub than a dining restaurant.
Review: Very accommodating for dietary restrictions. They have a full separate gluten-free and vegan menu, and the server checked with the chef to ensure our safety. Much appreciated!
Review: Disappointing value. The portions are miniscule and everything is priced à la carte. Even the side bread costs $8. Not worth the hefty price tag.
Review: Visited Bistro 88 last night. The service was impeccable! Every course was perfectly timed, and the manager stopped by to ensure everything was to our liking.
Review: The ambient design is beautiful but the seating is cramped. We were practically touching elbows with the table next to us.
Review: Food is solid but nothing spectacular for the price. You are mostly paying for the Instagrammable interior design.`
  }
];
