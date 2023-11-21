League of Legends(LOL) Favourite Champion database

Group: 20
Name: 
Shum Yee Lam (13161005),
Tang Chi Kin (13248891),
Lee Yat Kai(13342037)

Application link: 

********************************************
# Login
Through the login interface, each user can access League of Legends(LOL) Champion database by entering their username and password.

Each user has a userID and password;
[
	{userid: user1, password: cs381},
	{userid: user2, password: cs381},
	{suerid: user3, password: cs381}

]

After successful login, userid is stored in seesion.

********************************************
# Logout
In the home page, each user can log out their account by clicking logout.

********************************************
# CRUD service
- Create
-	A Champion database may contain the following attributes with an example: 
	1)	Champion Name (AHRI)
	2)	Champion ID (00000001), Character id must be 8 digits
	3)	Role (Mage)
	4)	Abilities (null)
	5)	Difficulty (Moderate)
	6)	Description (...ahri is a fox-like vastaya )

Champion Name and Champion ID is mandatory, and other attributes are optional.

Create operation is post request, and all information is in body of request.

********************************************
# CRUD service
- Read
-  There are two options to read and find Champions list all information or searching by Champion id.

1) List all information
	display.ejs will be displayed with all Champion ID;
	clicking on Champion ID, the details will be shown;

2) Searching by Champion id
	input id of Champion you want to find (00000003);
	id is in the body of post request, and in display.ejs Champion id will be shown as link;
	clicking on Champion ID, the details will be displayed;

********************************************
# CRUD service
- Update
-	The user can update the Champion information through the details interface.
-	Among the attribute shown above, Champion ID cannot be changed. Since Champion ID is fixed, Champion ID is searching criteria for updating information. 

-	A restaurant document may contain the following attributes with an example: 
  	1)	Role (Mage)
	2)	Abilities (null)
	3)	Difficulty (Moderate)
	4)	Description (...ahri is a fox-like vastaya )

	In example, we updated the Role, Abilities, Difficulty and Description.

********************************************
# CRUD service
- Delete
-	The user can delete the Champion information through the details interface.

********************************************
# Restful
In this project, there are three HTTP request types, post, get and delete.
- Post 
	Post request is used for insert.
	Path URL: /api/item/championID/:championID
	Test: curl -X POST -H "Content-Type: application/json" --data '{"name": "ahri", "championID":"00000001"}'localhost:8099/api/item/championID/00000001/name/ahri

- Get
	Get request is used for find.
	Path URL: /api/item/championID/:championID
	Test: curl -X GET http://localhost:8099/api/item/championID/00000002

- Delete
	Delete request is used for deletion.
	Path URL: /api/item/championID/:championID
	Test: curl -X DELETE localhost:8099/api/item/championID/00000002

For all restful CRUD services, login should be done at first.


curl -X POST -H "Content-Type: application/json" --data '{"name": "ahri", "championID":"00000001"}' http://localhost:8099/api/item/championID/00000001

curl -X GET http://localhost:8099/api/item/championID/00000002

curl -X DELETE http://localhost:8099/api/item/championID/00000002
