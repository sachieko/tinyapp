# TinyApp
LHL Web Dev Project

This app will host a url-shortening web app service with user logins and user-specific links, and has a dark-mode theme.

User Feature-List:

* Users can register by email
* Can create personal shortened links which are shareable with anyone
* The user can track how many times their shortened links are clicked
* Users can edit and update the destination URLS, or delete them if they no longer want them.
* Only they can edit and delete links they created!

# Server Setup and Information

For first time setup, you can run a server using the following: 

```
npm run tinyappsetup
npm run tinyapp 
```
After, you can simply run the server with: 
```
npm run tinyapp
```
Server Features:

* User PWs are hashed
* Cookies are encrypted
* Constants are easy to customize in the constants.js folder
* For devs, there are some debug functions built in.
* Server is only in darkmode, so you can feel superior over lightmode tinyApps.

Heaped together from scraps by [@sachieko](https://github.com/sachieko).