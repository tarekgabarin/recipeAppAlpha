This is a backend API, deployed on Heroku, that I created during the summer of 2017. It's the first project I made using
Node.js, Express, and MongoDB.

I have not created the frontend for it yet, as I am currently finishing the final version of the project I made during
my course at Brainstation.

The app is called "Deelish". With it, users can post their own recipes and view and rate other people's recipes as well.
Anyone can log in and post a recipe they made. Other users can then give that recipe a rating out of five stars. All
such rating are combined to produce a total rating for the recipe in question.

Each recipe contains instructions on how to cook it, and a picture. And below the instructions and pictures, you can
see the reviews for it.

You can search for different recipes based on what type they are ('Vegetarian', "Breakfast", etc), and also their rating.

Each user has something called "Chef Karma". The more people who give your dishes a 4 or 5 star rating, the more points
are added to your Chef Karma. Conversley, the more people who give your dish a 2 to 0 star rating, the more points are
deducted from your Chef Karma. You can look at a user's profile to view their Chef Karma.

If you like someones cooking, you can subscribe to them. It sort of works like Youtube, except with recipes instead of
videos. You can browse through all the recipes made specifically by people you're subscribed to. If you no longer like
someones cooking, you can also unsubscribe from them.

I have written the URL for each API call below, describing them in detail. If you want, you can test them out in POSTMAN.



