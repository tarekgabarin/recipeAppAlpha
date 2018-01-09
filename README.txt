This is a backend API, deployed on Heroku, that I created during the summer of 2017. It's the first project I made using Node.js, Express, and MongoDB.

I have not created the frontend for it yet, as I am currently finishing another project I started at Brainstation.

The app is called "Deelish". With it, users can post their own recipes and view and rate other people's recipes as well. Anyone can log in and post a recipe they made. Other users can then give that recipe a rating out of five stars. All
such ratings are combined to produce a total rating for the recipe in question.

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
are added to your Chef Karma. And the more people who give your dish a 2 to 0 star rating, the more points are
deducted from your Chef Karma. You can look at a user's profile to view their Chef Karma.

If you like someones cooking, you can subscribe to them. It sort of works like Youtube, except with recipes instead of
videos. You can browse through all the recipes made specifically by people you're subscribed to. If you no longer like
someones cooking, you can also unsubscribe from them.

I have written the URL for each API call below, describing them in detail. If you want, you can test them out in POSTMAN.

But before that, let's go over how the documentation for this README is organized.

The **INFO** heading will describe what the API route does in a general sense.

The **TYPE** heading will be what REST variable it is (GET, POST, PUT, DELETE).

For each router described, I will give the template url, and an example url. The template URL is under the **TEMPLATE** heading, and the example url is listed under the **EXAMPLE** heading.

The template url will show you the url, but with the variables shown in brackets to highlight exactly where the variables are placed in the URL.  Here is an example of the template url for any user checking his/her account via the "/myAccount" end point. In this example, [ACCOUNT_NAME] stands for whatever the name of that account may be.

https://example-url.com/[ACCOUNT_NAME]/myAccount

And example urls should be self-explanatory. Here is an example url where a user whose account name is "Tarek" is checking their account:

https://example-url.com/Tarek/myAccount

I will also describe the request body. Most of the time, it will be shown as a json object. However, for the router that creates a recipe, and the one that uploads a profile picture, I will write it as from-data. Otherwise, expect it written as JSON. I will specify what the Content-Type is. I will give descriptions for what a given key-value pair is if it isn't self explanatory. This will be under the **REQUEST BODY EXAMPLE** heading.

And under the **RESPONSE** heading, I will describe what exactly the response data for a give route is.

And last, but certainly not least, a majority of the API calls require that you have an header named "x-auth" set to the JWT token that is generated when registering or logging in. Under the **JWT REQUIRED** header, you will see either a YES or NO to indicate whether of not a "x-auth" header set to a JWT token is necessary.

The base url for my server is https://deelish-backend.herokuapp.com

Now, here are the routes you can test out in POSTMAN described in detail.


#####################################################################################################################


//// REGISTERING ///

**INFO**

This is a router for a user registering. The variables in the req.body are the general account information filled out in a form when one signs up for the website.

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

The response should return a JWT Token which would then be set to a custom header named "x-auth" for verification.


#######################################################################################################################


//// CREATING A RECIPE ////

**INFO**

This is the router for when the user creates a recipe. This is also one of the two router wherein you have to use form-data to test it out. For an image of your recipe, you have to have the key be called "file" and it's value type set to "file" in postman.

**TYPE**

POST

**TEMPLATE**

https://deelish-backend.herokuapp.com/recipes/addrecipe

**EXAMPLE**

https://deelish-backend.herokuapp.com/recipes/addrecipe

**REQUEST BODY**

    //// The content-type for it is application/x-www-form-urlencoded

    | Key         	| Value                                                      	|
    |-------------	|------------------------------------------------------------	|
    | name        	| Cereal                                                     	|
    | ingredients 	| Milk                                                       	|
    | ingredients 	| Cereal                                                     	|
    | steps       	| First, pour cereal into a bowl. Then add milk and enjoy :) 	|
    | category    	| breakfast                                                  	|
    | file        	| picture-of-breakfast-cereal.jpeg                           	|


**JWT REQUIRED**

YES

**RESPONSE**

It will return the document of the recipe you just created. This is so that, in the front-end, the user will be taken to the page of their recipe once it is created and added to the database.



#######################################################################################################################


//// RATING A RECIPE //////

**INFO**

This is the route wherein the user rates another users recipe. If the router fires again, but the user has already reviewed the recipe, then it merely updates their review instead of adding a new one.

**TYPE**

POST

**TEMPLATE**

https://deelish-backend.herokuapp.com/recipes/[The category the recipe is in]/[the name of the recipe]

**Example**

https://deelish-backend.herokuapp.com/recipes/breakfast/cereal

**REQUEST BODY**


    //// The content-type for it is application/json


{
	"wouldMakeAgain": 5,
	"howGoodTaste": 5,
	"howEasyToMake": 5,
	"comment": "Great!"
}

   // A score between 1 and 5 is given to each of these categries; the final score is based on calculating all three.
   // The comment is basically the users written review.


**JWT REQUIRED**

YES

**RESPONSE**

It returns the recipe document that has all of the reviews embedded within it. This is so that the front end can update to then show the newly added review in the review section of the page. (This was my first MongoDB project, so I naively embedded reviews for the recipe within that recipes document. Nevertheless, It still works. I have avoided using embedded references
ever since)

########################################################################################################################

///// LOGGING IN //////////


**INFO**

This route basically logs the user in.

**TYPE**

POST

**TEMPLATE**

https://deelish-backend.herokuapp.com/users/login

**EXAMPLE**

https://deelish-backend.herokuapp.com/users/login

**REQUEST BODY**

/// I should note that all the emails I am using, and encourage you to use, ought to be fake one. As long as you have
// an @ symbol it should work

{
	"email": "nadia@gmail.com",
	"password": "secretPassWord"
}

**JWT REQUIRED**

YES

**RESPONSE**

Same as the register route, it returns a JWT token for verification purposes.


########################################################################################################################

//////// GETTING ALL RECIPES /////////

**INFO**

This route brings back recipes of all categories. There is a URL variable within it. It is a number, and determines how many recipes to skip over when retrieving recipes from the database. This is to limit the amount of recipes in the response object in
order to improve performance. If you have have 100,000 recipes in your Mongo collection, having them all be within one response object would negatively impact performance.

The URL variable is multiple by 10, and whatever it equals will be the amount of documents that are skipped over. I should note that the first number you can use as a URL variable is 0 to avoid unintentionally skipping over first 10.

The routes, and the ones like it, are designed with pagination in mind. These calls will be made automatically as the user clicks on the next page number in the CSS pagination.

**TYPE**

GET

**TEMPLATE**

 https://deelish-backend.herokuapp.com/recipes/[amount of recipes to skip over]

**EXAMPLE**

 https://deelish-backend.herokuapp.com/recipes/1

 //// Mongo will skip over the first 10 recipes, and give you 10 recipes that follow them. If you want to see the first
 /// 10 in the collection, the URL variable should be 0. Regardless of what the URL variable is, it will always return
 /// 10 documents

 **REQUEST BODY**

 N/A

 **JWT REQUIRED**

 NO

**RESPONSE**

Will always return 10 recipes. THe recipes themselves will vary depending on the URL variable.



#######################################################################################################################


///// GETTING RECIPES FROM A SPECIFIC CATEGORY /////

**INFO**

Self-explanatory. Follows the same rules and logic as the GET router above.

**TYPE**

GET

**TEMPLATE**

 https://deelish-backend.herokuapp.com/recipes/[category]/[url number variable]



**EXAMPLE**

https://deelish-backend.herokuapp.com/recipes/breakfast/2

/// This will get 10 recipe documents that follow the first 20


 **JWT REQUIRED**

 NO

#######################################################################################################################

///// GET TOP RECIPES ///////


**INFO**

Getting the recipes with the highest rating. The higher your URL variable number is however, the lower the rating is.

**TYPE**

GET

**TEMPLATE**

https://deelish-backend.herokuapp.com/recipes/top/[url variable number]

**EXAMPLE**

/// This will get you the highest rated recipes

 https://deelish-backend.herokuapp.com/recipes/top/0

 /// Whereas this will get you some bad pretty mediocre ones (assuming the database has more than 500 recipe documents
 of course).

 https://deelish-backend.herokuapp.com/recipes/top/500

  **JWT REQUIRED**

  NO

########################################################################################################################

/// GET DETAILS (ALONG WITH REVIEWS) OF A SPECIFIC RECIPE /////

**INFO**

Basically the API call made when you click on a recipe when browsing, and want to see the page for it. It returns the
recipe document (along with the reviews for it).

**TYPE**

GET

**TEMPLATE**

https://deelish-backend.herokuapp.com/recipes/[category of the recipe]/[name of the recipe]

**EXAMPLE**

https://deelish-backend.herokuapp.com/recipes/breakfast/cereal

 **JWT REQUIRED**

 NO

#######################################################################################################################

///////////// SEE ALL THE RECIPES MADE BY A SPECIFIC USER /////////////////////////////

**TYPE**

GET

**TEMPLATE**

https://deelish-backend.herokuapp.com/users/[name of user]/recipes

**EXAMPLE**

https://deelish-backend.herokuapp.com/users/tarek/recipes

#######################################################################################################################

/////////// SEE ALL THE REVIEWS MADE BY A SPECIFIC USER /////////////////////////////////////

**TYPE**

GET

**TEMPLATE**

https://deelish-backend.herokuapp.com/users/[name of user]/reviews

**EXAMPLE**

https://deelish-backend.herokuapp.com/users/tarek/reviews

 **JWT REQUIRED**

 NO

#######################################################################################################################

///////// SUBSCRIBE TO ANOTHER USERS COOKING ////////////////////////////////////////////////////////////////////////

**INFO**

It basically let's the user subscribe to another user, so that the former can get the latest dishes made by the latter
easily.

**TYPE**

PUT

**TEMPLATE**

https://deelish-backend.herokuapp.com/users/[_id of that users you want to subscribe to]/subscribe

**EXAMPLE**

https://deelish-backend.herokuapp.com/users/598ca0788f96ab08ec0fb3e2/subscribe

 **JWT REQUIRED**

 YES

#######################################################################################################################

///////////// UNSUBSCRIBE TO ANOTHER USERS COOKING ////////////////////////////////////////////////////////////////////

**INFO**

Same as above except you unsubscribe.

**TYPE**

PUT

**TEMPLATE**

https://deelish-backend.herokuapp.com/users/[_id of that users you want to subscribe to]/unsubscribe

**EXAMPLE**

https://deelish-backend.herokuapp.com/users/598ca0788f96ab08ec0fb3e2/unsubscribe

 **JWT REQUIRED**

 YES



#########################################################################################################################

//////////// EDIT A RECIPE YOU MADE ///////////////////////////////////////////////////////////////////////////////////

**INFO**

Let's you edit your recipe you made.

**TYPE**

PUT

**TEMPLATE**

https://deelish-backend.herokuapp.com/recipes/[category the user's recipe is in]/[name of the recipe/editRecipe

**EXAMPLE**

https://deelish-backend.herokuapp.com/recipes/breakfast/cereal/editRecipe

**REQUEST BODY**

/// If you just want to change the name of your recipe

{
	"name": "Frosted Flakes"
}

// Or let's say you just want to change the ingredients

{

    "ingredients": ["cereal", "orange juice"]

}

 **JWT REQUIRED**

 YES

**RESPONSE**

Returns the updated recipe document.

#########################################################################################################################

//////////// EDIT YOUR PERSONAL INFO /////////////////////////////////////////////////////////////////////////////////

**TYPE**

PUT

**TEMPLATE**

https://deelish-backend.herokuapp.com/users/editProfile

**EXAMPLE**

https://deelish-backend.herokuapp.com/users/editProfile

**REQUEST BODY**

/// If you just want to change your name

{
	"firstname": "Miles"

	"lastName": "Prower"
}

 **JWT REQUIRED**

 YES

**RESPONSE**

Returns the updated recipe document.

#######################################################################################################################

 //////// DEACTIVATE ACCOUNT //////////////////////////////////////////////////////////////////////////////////////////

**INFO**

When you deactivate your account, all your reviews, recipes, and your user document are still in the mongodb database.
However, your profile and all your recipes/reviews will be hidden until you reactivate it.

**TYPE**

POST

**TEMPLATE**

https://deelish-backend.herokuapp.com/manage-account/deactivate

**EXAMPLE**

https://deelish-backend.herokuapp.com/manage-account/deactivate

 **JWT REQUIRED**

 YES


#######################################################################################################################

///////// DELETE A RECIPE YOU MADE ////////////////////////////////////////////////////////////////////////////////////

**INFO**

Deletes a recipe you made.

**TYPE**

DELETE

**TEMPLATE**

https://deelish-backend.herokuapp.com/recipes/[category your recipe is in]/[name of your recipe]

**EXAMPLE**

https://deelish-backend.herokuapp.com/recipes/sweets/cupcakes

 **JWT REQUIRED**

 YES


 #######################################################################################################################

 ////////////////// SEE RECIPES MADE BY USERS YOU ARE SUBSCRIBED TO /////////////////////////////////////////////////////

 **TYPE**

 GET

 **TEMPLATE**

https://deelish-backend.herokuapp.com/users/recommended

**EXAMPLE**

https://deelish-backend.herokuapp.com/users/recommended

 **JWT REQUIRED**

 YES

 **RESPONSE OBJECT**

 User gets recipes from people he is subscribed to. 