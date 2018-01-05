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

These are the different categories that a recipe can fall under.

-breakfast
-dinner
-brunch
-sweets
-vegetarian
-lunch

Each user has something called "Chef Karma". The more people who give your dishes a 4 or 5 star rating, the more points
are added to your Chef Karma. Conversley, the more people who give your dish a 2 to 0 star rating, the more points are
deducted from your Chef Karma. You can look at a user's profile to view their Chef Karma.

If you like someones cooking, you can subscribe to them. It sort of works like Youtube, except with recipes instead of
videos. You can browse through all the recipes made specifically by people you're subscribed to. If you no longer like
someones cooking, you can also unsubscribe from them.

I have written the URL for each API call below, describing them in detail. If you want, you can test them out in POSTMAN.

But before that, let's go over how the documentation for this README is organized.

The **INFO** heading will describe what the API route does in a general sense.

The **TYPE** heading will be what REST variable it is (GET, POST, PUT, DELETE).

For each router described, I will give the template url, and an example url. The template URL is under the **TEMPLATE**
heading, and the example url is listed under the **EXAMPLE** heading.

The template url will show you the url, but with the variables shown in brackets to highlight exactly and where the
variables are placed in the URL. [ACCOUNT_NAME] stands for whatever the name of that account may be. Here is an example
of the template url for any user checking his/her account via the "/myAccount" end point.

https://example-url.com/[ACCOUNT_NAME]/myAccount

And example urls should be self-explanatory. Here is an example url where a user whose account name is "Tarek" is
checking their account:

https://example-url.com/[ACCOUNT_NAME]/myAccount

I will also describe the request body. Most of the time, it will be shown as a json object.
However, for the router that creates a recipe, and the one that uploads a profile picture, I will write it as from-data.
Otherwise, expect it written as JSON. I will specify what the Content-Type is. I will give descriptions for what a
given key-value pair is if it isn't self explanatory. This will be under the **REQUEST BODY EXAMPLE** heading.

And under the **RESPONSE** heading, I will describe what exactly the response data for a give route is.

And last, but certainly not least, a majority of the API calls require that you have an header named "x-auth" set to
the JWT token that is generated when registering or logging in. Under the **JWT REQUIRED** header, you will see either a
YES or NO to indicate whether of not "x-auth" header set to a JWT token is necessary.

The base url for my server is https://deelish-backend.herokuapp.com

Now, here are the routes you can test out in POSTMAN described in detail.


#####################################################################################################################


//// REGISTERING ///

**INFO**

This is a router for a user registering. The variables in the req.body are general account information filled out through
a form when one signs up for the website.

**TYPE**

POST

**TEMPLATE**

https://deelish-backend.herokuapp.com/users/register

**EXAMPLE**

https://deelish-backend.herokuapp.com/users/register

**REQUEST BODY**

    //// The content-type for it is application/json

{
	"email": "nadia@gmail.com",

	"password": "nadia",

	"username": "nadia",

	"city": "Toronto",

	"country": "Canada",

	"firstName": "Nadia",

	"lastName": "Gabarin"


}

**JWT REQUIRED**

NO

**RESPONSE**

The response should return a JWT Token which is would then be set to a custom header named "x-auth" for verification.


#######################################################################################################################


//// CREATING A RECIPE ////

**INFO**

This is the router for when the User creates a recipe. This is also one of the two router wherein you have to use
form-data to test it out. For an image of your recipe you have to have the key be called "file" and it's value type set
to "file" in postman.

**TYPE**

POST

**TEMPLATE**

https://deelish-backend.herokuapp.com/recipes/addrecipe

**EXAMPLE**

https://deelish-backend.herokuapp.com/recipes/addrecipe

**REQUEST BODY**

    //// The content-type for it is application/x-www-form-urlencoded

    KEY          |        value
----------------------------------
                 |
                 |
----------------------------------
                 |
                 |
----------------------------------
                 |
                 |
----------------------------------
                 |
                 |
----------------------------------
                 |
                 |
----------------------------------
                 |
                 |
----------------------------------
                 |
                 |
----------------------------------







